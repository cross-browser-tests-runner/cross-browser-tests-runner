'use strict';

let
  uuidv4 = require('uuid/v4'),
  retry = require('p-retry'),
  ps = require('ps-node'),
  Bluebird = require('bluebird'),
  Log = require('./../../core/log').Log,
  InputError = require('./../../core/errors').InputError,
  PlatformInterface = require('./../interfaces/platform').Platform

let log = new Log('Platforms.Core.Platform')

const VARS = {
  monitorInterval: 2000
}

class Platform extends PlatformInterface {

  constructor(optionsParser, Tunnel, Manager, tunnelIdField, processPattern, Job, ScriptJob) {
    super()
    this.runs = { }
    this.done = { }
    this.tunnels = [ ]
    this.optionsParser = optionsParser
    this.Tunnel = Tunnel
    this.Manager = Manager
    this.tunnelIdField = tunnelIdField
    this.processPattern = processPattern
    this.Job = Job
    this.ScriptJob = ScriptJob
    setTimeout(() => {this.monitor()}, VARS.monitorInterval)
  }

  open(capabilitiesArr) {
    capabilitiesArr = capabilitiesArr || [ ]
    capabilitiesArr.forEach(capabilities => {
      this.optionsParser(capabilities, 'capabilities')
    })
    let promises = capabilitiesArr.map(capabilities => {
      return handleTunnel(this, capabilities, this.Tunnel, this.Manager, this.tunnelIdField)
    })
    return Bluebird.all(promises)
    .then(tunnels => {
      tunnels.forEach(tunnel => {
        if(isTunnel(tunnel)) {
          storeTunnelIfNew(this, tunnel)
        }
      })
      log.debug('opened platform')
      return true
    })
  }

  run(url, browser, capabilities, isNative) {
    let
      parseRet = parseRunInput(browser, capabilities, this.optionsParser),
      runId = uuidv4(),
      tunnel
    return handleTunnel(this, capabilities, this.Tunnel, this.Manager, this.tunnelIdField)
    .then(ret => {
      if(isTunnel(ret)) {
        tunnel = ret
        storeTunnelIfNew(this, tunnel)
      }
      return this.Job.create(url, parseRet.browserOpts, parseRet.capsOpts, runId, isNative)
    })
    .then(job => {
      return createJobsRun(this, runId, [ job ], tunnel)
    })
  }

  runMultiple(url, browsers, capabilities, isNative) {
    let
      parseRet = parseRunMultiInput(browsers, capabilities, this.optionsParser),
      runId = uuidv4(),
      tunnel
    return handleTunnel(this, capabilities, this.Tunnel, this.Manager, this.tunnelIdField)
    .then(ret => {
      if(isTunnel(ret)) {
        tunnel = ret
        storeTunnelIfNew(this, tunnel)
      }
      return this.Job.createMultiple(url, parseRet.browsersOpts, parseRet.capsOpts, runId, isNative)
    })
    .then(jobs => {
      return createJobsRun(this, runId, jobs, tunnel)
    })
  }

  runScript(url, browser, capabilities, script, decider) {
    let parseRet = parseRunInput(browser, capabilities, this.optionsParser),
      tunnel, scriptJob
    if('function' !== typeof(script)) {
      throw new Error('Platform.Core.Platform: invalid script')
    }
    return handleTunnel(this, capabilities, this.Tunnel, this.Manager, this.tunnelIdField)
    .then(ret => {
      if(isTunnel(ret)) {
        tunnel = ret
        storeTunnelIfNew(this, tunnel)
      }
      scriptJob = new this.ScriptJob(url, Object.assign(parseRet.browserOpts, parseRet.capsOpts))
      return scriptJob.create()
    })
    .then(() => {
      scheduleScript(scriptJob, script, decider)
      return createScriptJobsRun(this, uuidv4(), [ scriptJob ], tunnel)
    })
  }

  runScriptMultiple(url, browsers, capabilities, script, decider) {
    let
      parseRet = parseRunMultiInput(browsers, capabilities, this.optionsParser),
      tunnel, scriptJobs
    if('function' !== typeof(script)) {
      throw new Error('Platform.Core.Platform: invalid script')
    }
    return handleTunnel(this, capabilities, this.Tunnel, this.Manager, this.tunnelIdField)
    .then(ret => {
      if(isTunnel(ret)) {
        tunnel = ret
        storeTunnelIfNew(this, tunnel)
      }
      scriptJobs = parseRet.browsersOpts.map(browserOpts => {
        return new this.ScriptJob(url, Object.assign(browserOpts, parseRet.capsOpts))
      })
      let promises = scriptJobs.map(scriptJob => {
        return scriptJob.create()
      })
      return Bluebird.all(promises)
    })
    .then(() => {
      scriptJobs.forEach(scriptJob => {
        scheduleScript(scriptJob, script, decider)
      })
      return createScriptJobsRun(this, uuidv4(), scriptJobs, tunnel)
    })
  }

  stop(run, takeScreenshot) {
    if(!this.runs[run]) {
      throw new InputError('Platforms.Core.Platform: stop: no such run ' + run + ' found')
    }
    return screenshot(this, run, takeScreenshot)
    .then(() => {
      return Bluebird.all(stopPromises(this.runs[run]))
    })
    .then(() => {
      this.done[run] = this.runs[run]
      delete this.runs[run]
      log.debug('marked run %s as done', run)
      return true
    })
  }

  status(run) {
    let entity = this.runs[run] || this.done[run]
    if(!entity) {
      throw new InputError('Platforms.Core.Platform: status: no such run ' + run + ' found')
    }
    return Bluebird.all(statusPromises(entity))
    .then(ret => {
      let results = decideStatus(parseStatusResults(ret, entity))
      log.debug('status', results)
      return results
    })
  }

  close(takeScreenshot) {
    this.stopMonitoring = true
    return Bluebird.all(
      Object.keys(this.runs).map(run => {
        return this.stop(run, takeScreenshot)
      })
    )
    .then(() => {
      return Bluebird.all(tunnelStopPromises(this))
    })
    .then(() => {
      this.tunnels = [ ]
      log.info('platform is closed post tests completion')
    })
  }

  monitor() {
    if(this.stopMonitoring) {
      setTimeout(() => {this.monitor()}, VARS.monitorInterval)
      return
    }
    let died = [ ]
    Bluebird.all(this.tunnels.map(tunnel => {
      return exists(tunnel.process.pid, this.processPattern)
      .catch(() => {
        died.push(tunnel)
      })
    }))
    .then(() => {
      if(died.length) {
        return restartDeadTunnels(this, died)
      } else {
        return Promise.resolve(true)
      }
    })
    .then(() => {
      setTimeout(() => {this.monitor()}, VARS.monitorInterval)
    })
    .catch(err => {
      log.warn('monitor: unexpected error %s, continuing', err)
      setTimeout(() => {this.monitor()}, VARS.monitorInterval)
    })
  }

}

function parseRunInput(browser, capabilities, parser) {
 browser = browser || { }
 capabilities = capabilities || { }
 let
   browserOpts = parser(browser, 'browser'),
   capsOpts = parser(capabilities, 'capabilities')
 return {browserOpts: browserOpts, capsOpts: capsOpts}
}

function parseRunMultiInput(browsers, capabilities, parser) {
  capabilities = capabilities || { }
  if(!browsers || !browsers.length) {
    throw new InputError('Platforms.Core.Platform: no browsers provided for multiple run')
  }
  let
    capsOpts = parser(capabilities, 'capabilities'),
    browsersOpts = browsers.map(browser => {
      return parser(browser, 'browser')
    })
  return {browsersOpts: browsersOpts, capsOpts: capsOpts}
}

function handleTunnel(platform, capabilities, Tunnel, Manager, tunnelIdField) {
  capabilities = capabilities || { }
  if(capabilities.local) {
    if(capabilities.localIdentifier) {
      return withId(platform, capabilities.localIdentifier, Tunnel, Manager, tunnelIdField)
    } else {
      return withoutId(platform, Tunnel, Manager)
    }
  } else {
    return Bluebird.resolve(true)
  }
}

function withId(platform, localId, Tunnel, Manager, tunnelIdField) {
  let tunnel
  return Manager.withId()
  .then(procs => {
    for(let idx = 0; idx < procs.length; ++idx) {
      if(procs[idx].tunnelId === localId) {
        tunnel = findPlatformTunnel(platform, procs[idx])
        return true
      }
    }
    let options = { }
    options[tunnelIdField] = localId
    tunnel = new Tunnel(options)
    return tunnel.start()
  })
  .then(() => {
    return tunnel
  })
}

function withoutId(platform, Tunnel, Manager) {
  let tunnel
  return Manager.withoutId()
  .then(procs => {
    if(procs.length) {
      tunnel = findPlatformTunnel(platform, procs[0])
      return true
    }
    tunnel = new Tunnel()
    return tunnel.start()
  })
  .then(() => {
    return tunnel
  })
}

function findPlatformTunnel(platform, proc) {
  for(let i = 0; i < platform.tunnels.length; ++i) {
    if (platform.tunnels[i].process.pid === proc.pid) {
      return platform.tunnels[i]
    }
  }
  throw new Error('Platforms.Core.Platform: manager returned a tunnel with pid ' + proc.pid + ' tunnel-id ' + proc.tunnelId + ' that was not created by platform')
}

function storeTunnelIfNew(platform, tunnel) {
  let exists = false
  for(let i = 0; i < platform.tunnels.length; ++i) {
    if (platform.tunnels[i].process.pid === tunnel.process.pid) {
      exists = true
      break
    }
  }
  if(!exists) {
    platform.tunnels.push(tunnel)
  }
}

function createJobsRun(platform, runId, jobs, tunnel) {
  createRun(platform, runId, jobs, [ ], tunnel)
  log.debug('new test run %s with %d test(s) created', runId, jobs.length)
  return { id : runId }
}

function createScriptJobsRun(platform, runId, scriptJobs, tunnel) {
  createRun(platform, runId, [ ], scriptJobs, tunnel)
  log.debug('new scripts run %s with %d test(s) created', runId, scriptJobs.length)
  return { id : runId }
}

function createRun(platform, runId, jobs, scriptJobs, tunnel) {
  platform.runs[runId] = { jobs : jobs, scriptJobs: scriptJobs }
  if(tunnel) {
    platform.runs[runId].tunnel = tunnel
  }
}

function scheduleScript(scriptJob, script, decider) {
  scriptJob.timer = setTimeout(() => {
    scriptJob.run(script)
    .then(() => {
      if(scriptJob.options['browserstack.debug']) {
        return scriptJob.screenshot()
      }
      else {
        return Promise.resolve(true)
      }
    })
    .then(() => {
      return scriptJob.markStatus(decider)
    })
    .catch(err => {
      log.warn('exception for script session %s from selenium script %s', scriptJob.session, err)
      return true
    })
    .then(() => {
      return scriptJob.stop()
    })
    .catch(err => {
      log.warn('failed to stop script session %s with error %s', scriptJob.session, err)
      return true
    })
  },
  16)
}

function tunnelStopPromises(entity) {
  return entity.tunnels.map(tunnel => {
    return tunnel.stop()
    .catch(err => {
      if(err.message.match(/Process: already stopped/)) {
        return true
      }
      throw err
    })
  })
}

function stopPromises(entity) {
  let jobsPromises = entity.jobs.map(job => {
      return job.stop()
    }),
    scriptJobsPromises = entity.scriptJobs.map(scriptJob => {
      return scriptJob.stop()
      .catch(err => {
        if(err.message.match(/This driver instance does not have a valid session ID/)
           || err.message.match(/has already finished, and can't receive further commands/))
        {
          return Promise.resolve(true)
        }
        throw err
      })
    })
  return jobsPromises.concat(scriptJobsPromises)
}

function statusPromises(entity) {
  let jobsPromises = entity.jobs.map(job => {
      return job.status()
    }),
    scriptJobsPromises = entity.scriptJobs.map(scriptJob => {
      return scriptJob.status()
    }),
    promises = jobsPromises.concat(scriptJobsPromises)
  if(entity.tunnel) {
    promises.push(entity.tunnel.status())
  }
  return promises
}

function parseStatusResults(ret, entity) {
  let results = { tunnel: entity.tunnel ? ret.pop() : 'none' }
  results.jobs = [ ]
  for(let idx = 0; idx < entity.jobs.length; ++idx) {
    results.jobs.push(ret.shift())
  }
  results.scriptJobs = ret
  return results
}

function decideStatus(results) {
  results.status = 'stopped'
  for(let i = 0; i < results.jobs.length; ++i) {
    if('stopped' !== results.jobs[i]) {
      results.status = 'running'
      break
    }
  }
  for(let i = 0; i < results.scriptJobs.length; ++i) {
    if('stopped' !== results.scriptJobs[i]) {
      results.status = 'running'
      break
    }
  }
  if('stopped' === results.tunnel && 'running' === results.status) {
    results.status = 'messy'
  }
  return results
}

function screenshot(platform, run, takeScreenshot) {
  if(takeScreenshot) {
    let jobsPromises = platform.runs[run].jobs.map(job => {
        return job.screenshot()
      }),
      scriptJobsPromises = platform.runs[run].scriptJobs.map(scriptJob => {
        return scriptJob.screenshot()
      }),
      promises = jobsPromises.concat(scriptJobsPromises)
    return Bluebird.all(promises)
  }
  else {
    return Bluebird.resolve(true)
  }
}

function exists(pid, processPattern) {
  return new Bluebird((resolve, reject) => {
    ps.lookup({
      pid: parseInt(pid, 10)
    },
    (err, list) => {
      if(err) {
        reject(err)
        return
      }
      if(!list.length || !list[0].command.match(processPattern)) {
        reject(new Error('process died'))
        return
      }
      resolve(true)
    })
  })
}

function restartDeadTunnels(platform, died) {
  log.warn('monitor: found died tunnel processes', died.map(tunnel => { return tunnel.process.pid }))
  return Bluebird.all(died.map(tunnel => {
    return waitTillStopping(tunnel)
  }))
  .then(() => {
    return Bluebird.all(died.map(tunnel => {
      return tunnel.start()
    }))
  })
  .catch(err => {
    if(err.message.match(/arguments must be provided for creating the new tunnel as otherwise it would conflict with existing tunnels and would not start/)) {
      return true
    }
    throw err
  })
}

function waitTillStopping(tunnel) {
  const check = () => {
    log.debug('tunnel stopping %s', tunnel.process.stopping)
    if(tunnel.process.stopping) {
      throw new Error('tunnel is still stopping')
    }
    return true
  },
  max = 120, minTimeout = 1000, factor = 1
  return retry(check, {retries: max, minTimeout: minTimeout, factor: factor})
}

function isTunnel(object) {
  return(object.constructor && 'Tunnel' === object.constructor.name)
}

exports.Platform = Platform
exports.PlatformVars = VARS
