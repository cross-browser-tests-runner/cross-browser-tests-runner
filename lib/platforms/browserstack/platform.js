'use strict';

let
  uuidv4 = require('uuid/v4'),
  ps = require('ps-node'),
  Bluebird = require('bluebird'),
  Log = require('./../../core/log').Log,
  InputError = require('./../../core/errors').InputError,
  PlatformInterface = require('./../interfaces/platform').Platform,
  Worker = require('./worker').Worker,
  WebDriver = require('./webdriver').WebDriver,
  Tunnel = require('./tunnel').Tunnel,
  Manager = require('./manager').Manager

let log = new Log('Platforms.BrowserStack.Platform')

const VARS = {
  conversions: {
    browser: {
      os: 'os',
      osVersion: 'os_version',
      browser: 'browser',
      browserVersion: 'browser_version',
      device: 'device',
      orientation: 'deviceOrientation',
      size: 'resolution'
    },
    capabilities: {
      timeout: 'timeout',
      project: 'project',
      test: 'name',
      build: 'build',
      local: 'browserstack.local',
      localIdentifier: 'browserstack.localIdentifier',
      screenshots: 'browserstack.debug',
      video: 'browserstack.video'
    }
  },
  required: {
    browser: [ 'os', 'osVersion', 'browser', 'browserVersion' ],
    capabilities: [ ]
  },
  defaults: {
    browser: {
    },
    capabilities: {
      timeout: 60
    }
  },
  monitorInterval: 2000
}

class Platform extends PlatformInterface {

  constructor() {
    super()
    this.runs = { }
    this.done = { }
    this.tunnels = [ ]
    setTimeout(() => {this.monitor()}, VARS.monitorInterval)
  }

  open(capabilitiesArr) {
    capabilitiesArr = capabilitiesArr || [ ]
    capabilitiesArr.forEach(capabilities => {
      parse(capabilities, 'capabilities')
    })
    let promises = capabilitiesArr.map(capabilities => {
      return handleTunnel(capabilities)
    })
    return Bluebird.all(promises)
    .then(tunnels => {
      tunnels.forEach(tunnel => {
        if(tunnel.constructor && 'Tunnel' === tunnel.constructor.name) {
          storeTunnel(this, tunnel)
        }
      })
      log.debug('opened BrowserStack platform')
      return true
    })
  }

  run(url, browser, capabilities) {
    browser = browser || { }
    capabilities = capabilities || { }
    let
      capsOpts = parse(capabilities, 'capabilities'),
      browserOpts = parse(browser, 'browser'),
      tunnel
    return handleTunnel(capabilities)
    .then(ret => {
      tunnel = (ret.constructor && 'Tunnel' === ret.constructor.name ? ret : undefined)
      return createWorker(url, browserOpts, capsOpts)
    })
    .then(worker => {
      return createWorkersRun(this, [ worker ], tunnel)
    })
  }

  runMultiple(url, browsers, capabilities) {
    capabilities = capabilities || { }
    if(!browsers || !browsers.length) {
      throw new InputError('Platforms.BrowserStack.Platform: no browsers provided for runMultiple')
    }
    let
      capsOpts = parse(capabilities, 'capabilities'),
      browsersOpts = browsers.map(browser => {
        return parse(browser, 'browser')
      }),
      tunnel
    return handleTunnel(capabilities)
    .then(ret => {
      tunnel = (ret.constructor && 'Tunnel' === ret.constructor.name ? ret : undefined)
      let promises = browsersOpts.map(browserOpts => {
        return createWorker(url, browserOpts, capsOpts)
      })
      return Bluebird.all(promises)
    })
    .then(workers => {
      return createWorkersRun(this, workers, tunnel)
    })
  }

  runScript(url, browser, capabilities, script, decider) {
    browser = browser || { }
    capabilities = capabilities || { }
    let
      capsOpts = parse(capabilities, 'capabilities'),
      browserOpts = parse(browser, 'browser')
    if('function' !== typeof(script)) {
      throw new Error('Platform.BrowserStack.Platform: invalid script')
    }
    let tunnel, webDriver
    return handleTunnel(capabilities)
    .then(ret => {
      tunnel = (ret.constructor && 'Tunnel' === ret.constructor.name ? ret : undefined)
      return createWebDriver(url, browserOpts, capsOpts)
    })
    .then(wd => {
      webDriver = wd
      scheduleScript(webDriver, script, decider)
      return createWebDriversRun(this, [ webDriver ], tunnel)
    })
  }

  stop(run, takeScreenshot) {
    if(!this.runs[run]) {
      throw new InputError('Platforms.BrowserStack.Platform: stop: no such run ' + run + ' found')
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
      throw new InputError('Platforms.BrowserStack.Platform: status: no such run ' + run + ' found')
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
      return Bluebird.all(
        this.tunnels.map(tunnel => {
          return tunnel.stop()
        })
      )
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
      return exists(tunnel.process.pid)
      .catch(() => {
        died.push(tunnel)
      })
    }))
    .then(() => {
      if(died.length) {
        log.warn('monitor: found died tunnel processes', died.map(tunnel => { return tunnel.process.pid }))
        return Bluebird.all(died.map(tunnel => {
          return tunnel.start()
        }))
      } else {
        return true
      }
    })
    .then(() => {
      setTimeout(() => {this.monitor()}, VARS.monitorInterval)
    })
    .catch(err => {
      log.warn('monitor: unexpected error %s, continuing', err)
    })
  }

  static browserKeys(standard) {
    return converted('browser', standard)
  }

  static capabilitiesKeys(standard) {
    return converted('capabilities', standard)
  }

  static get required() {
    return VARS.required
  }
}

function parse(opts, which) {
  checkRequired(opts, VARS.required[which])
  checkUnallowed(opts, VARS.conversions[which])
  checkDefaults(opts, VARS.defaults[which])
  let out = { }
  Object.keys(opts).forEach(opt => {
    out[VARS.conversions[which][opt]] = opts[opt]
  })
  return out
}

function checkRequired(opts, required) {
  required.forEach(opt => {
    if (!(opt in opts)) {
      throw new InputError('Platforms.BrowserStack.Platform: required option ' + opt + ' missing')
    }
  })
}

function checkUnallowed(opts, conversions) {
  Object.keys(opts).forEach(opt => {
    if(!(opt in conversions)) {
      throw new InputError('Platforms.BrowserStack.Platform: option ' + opt + ' is not allowed')
    }
  })
}

function checkDefaults(opts, defaults) {
  Object.keys(defaults).forEach(def => {
    if(!(def in opts)) {
      opts[def] = defaults[def]
    }
  })
}

function handleTunnel(capabilities) {
  if(capabilities.local) {
    if(capabilities.localIdentifier) {
      return withId(capabilities.localIdentifier)
    } else {
      return withoutId()
    }
  } else {
    return Bluebird.resolve(true)
  }
}

function withId(localId) {
  let tunnel
  return Manager.withId()
  .then(withId => {
    for(let idx = 0; idx < withId.length; ++idx) {
      if(withId[idx].tunnelId === localId) {
        tunnel = new Tunnel({ localIdentifier : localId }, withId[idx])
        return true
      }
    }
    tunnel = new Tunnel({ localIdentifier : localId })
    return tunnel.start()
  })
  .then(() => {
    return tunnel
  })
}

function withoutId() {
  let tunnel
  return Manager.withoutId()
  .then(withoutId => {
    if(withoutId.length) {
      tunnel = new Tunnel(undefined, withoutId[0])
      return true
    }
    tunnel = new Tunnel()
    return tunnel.start()
  })
  .then(() => {
    return tunnel
  })
}

function createWorker(url, browserOpts, capsOpts) {
  let options = Object.assign(browserOpts, capsOpts)
  options.url = url
  let worker = new Worker()
  return worker.create(options)
  .then(() => {
    return worker
  })
}

function createWorkersRun(platform, workers, tunnel) {
  let runId = createRun(platform, workers, [ ], tunnel)
  log.debug('new test run %s with %d test(s) created', runId, workers.length)
  return { id : runId }
}

function createWebDriver(url, browserOpts, capsOpts) {
  let options = Object.assign(browserOpts, capsOpts)
  let webDriver = new WebDriver(url, options)
  return webDriver.create()
  .then(() => {
    return webDriver
  })
}

function createWebDriversRun(platform, webDrivers, tunnel) {
  let runId = createRun(platform, [ ], webDrivers, tunnel)
  log.debug('new scripts run %s with %d test(s) created', runId, webDrivers.length)
  return { id : runId }
}

function createRun(platform, workers, webDrivers, tunnel) {
  let runId = uuidv4()
  platform.runs[runId] = { workers : workers, webDrivers: webDrivers }
  if(tunnel) {
    platform.runs[runId].tunnel = tunnel
    storeTunnel(platform, tunnel)
  }
  return runId
}

function storeTunnel(platform, tunnel) {
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

function scheduleScript(webDriver, script, decider) {
  webDriver.timer = setTimeout(() => {
    webDriver.run(script)
    .catch(err => {
      log.warn('exception from selenium script %s', err)
      return true
    })
    .then(() => {
      if(webDriver.options['browserstack.debug']) {
        return webDriver.screenshot()
      }
      else {
        return Promise.resolve(true)
      }
    })
    .then(() => {
      return webDriver.markStatus(decider)
    })
    .then(() => {
      return webDriver.close()
    })
  },
  16)
}

function stopPromises(entity) {
  let workersPromises = entity.workers.map(worker => {
      return worker.terminate()
    }),
    webDriversPromises = entity.webDrivers.map(webDriver => {
      return webDriver.close()
      .catch(err => {
        if(err.message && err.message.match(/This driver instance does not have a valid session ID/)) {
          return Promise.resolve(true)
        }
        throw err
      })
    })
  return workersPromises.concat(webDriversPromises)
}

function statusPromises(entity) {
  let workersPromises = entity.workers.map(worker => {
      return worker.status()
    }),
    webDriversPromises = entity.webDrivers.map(webDriver => {
      return webDriver.status()
    }),
    promises = workersPromises.concat(webDriversPromises)
  if(entity.tunnel) {
    promises.push(entity.tunnel.status())
  }
  return promises
}

function parseStatusResults(ret, entity) {
  let results = { tunnel: entity.tunnel ? ret.pop() : 'none' }
  results.workers = [ ]
  for(var idx = 0; idx < entity.workers.length; ++idx) {
    results.workers.push(ret.shift())
  }
  results.webDrivers = ret
  return results
}

function decideStatus(results) {
  results.status = 'stopped'
  for(let i = 0; i < results.workers.length; ++i) {
    if('terminated' !== results.workers[i]) {
      results.status = 'running'
      break
    }
  }
  for(let i = 0; i < results.webDrivers.length; ++i) {
    if('stopped' !== results.webDrivers[i]) {
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
    let workersPromises = platform.runs[run].workers.map(worker => {
        return worker.screenshot()
      }),
      webDriversPromises = platform.runs[run].webDrivers.map(webDriver => {
        return webDriver.screenshot()
      }),
      promises = workersPromises.concat(webDriversPromises)
    return Bluebird.all(promises)
    /*.catch(err => {
      if(err.message && err.message.match(/Terminal not alloted yet, cannot process screenshot at the moment/)) {
        return true
      }
      throw err
    })*/
  }
  else {
    return Bluebird.resolve(true)
  }
}

function converted(which, standard) {
  let out = { }
  standard.forEach(function(key) {
    out[key] = VARS.conversions[which][key]
  })
  return out
}

function exists(pid) {
  return new Bluebird((resolve, reject) => {
    ps.lookup({
      pid: parseInt(pid, 10)
    },
    function(err, list) {
      if(err) {
        reject(err)
        return
      }
      if(!list.length || !list[0].command.match(/BrowserStackLocal/)) {
        reject(new Error('process died'))
        return
      }
      resolve(true)
    })
  })
}

exports.Platform = Platform
exports.PlatformVars = VARS
