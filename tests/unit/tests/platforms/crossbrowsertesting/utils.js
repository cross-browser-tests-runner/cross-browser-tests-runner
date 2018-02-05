'use strict';

var
  ps = require('ps-node'),
  path = require('path'),
  Bluebird = require('bluebird'),
  retry = require('p-retry'),
  Env = require('./../../../../../lib/core/env').Env,
  InputError = require('./../../../../../lib/core/errors').InputError,
  sleep = require('./../../../../../lib/core/sleep'),
  Request = require('./../../../../../lib/core/request').Request,
  BinaryVars = require('./../../../../../lib/platforms/crossbrowsertesting/tunnel/binary').BinaryVars,
  utils = require('./../../core/utils')

function stopProc(pid) {
  try {
    process.kill(pid, 'SIGINT')
  }
  catch(e) {
    // ignore what would be typically ESRCH here
  }
  var counter = 10
  while(counter--) {
    try {
      process.kill(pid, 0)
      utils.log.debug('waiting as process %d is still responding...', pid)
      sleep.msleep(800)
    }
    catch(e) {
      break
    }
  }
  utils.log.debug('Stopped process %d', pid)
}

function tunnels() {
  return new Promise(resolve => {
    ps.lookup({
      command: !Env.isWindows ? BinaryVars.path : 'cbtr-tunnels-win64.exe'
    },
    function(err, procs) {
      if(err) throw new Error(err)
      resolve(procs || [ ])
    })
  })
}

const
  host = 'https://crossbrowsertesting.com/api/v3',
  allTunnelsApi = '/tunnels',
  oneTunnelApi = '/tunnels/{id}',
  seleniumTestApi = '/selenium/{platformId}'

function killServerTunnels() {
  var serverIds
  return readRequest(host + allTunnelsApi + '?active=true', 'GET')
  .then(response => {
    var tunnels = response.body.tunnels
    serverIds = tunnels.map(tunnel => {
      return tunnel.tunnel_id
    })
    utils.log.debug('currently running server tunnel instances - %s, sending DELETE to all of them', serverIds.join(', '))
    return Bluebird.all(serverIds.map(serverId => {
      return writeRequest(host + oneTunnelApi.replace(/{id}/, serverId), 'DELETE')
    }))
  })
  .then(() => {
    return waitForServerTunnelsToDie(serverIds)
  })
}

function waitForServerTunnelsToDie(serverIds) {
  const max = 60, minTimeout = 2000, factor = 1
  const check = (retries) => {
    utils.log.debug('checking status of server tunnel instances - %s', serverIds.join(', '))
    return Bluebird.all(serverIds.map(serverId => {
      return readRequest(host + oneTunnelApi.replace(/{id}/, serverId), 'GET')
    }))
    .then(responses => {
      var done = [ ]
      responses.forEach((response, idx) => {
        if('stopped' === response.body.state) {
          utils.log.debug('tunnel server instance %s is terminated', serverIds[idx])
          done.push(serverIds[idx])
        }
        else {
          utils.log.debug('tunnel server instance %s is still to stop, state reported is %s', serverIds[idx], response.body.state)
        }
      })
      done.forEach(stopped => {
        serverIds.splice(serverIds.indexOf(stopped), 1)
      })
      if(!serverIds.length) {
        utils.log.debug('all server tunnel instances stopped')
        return true
      }
      throw new Error('not all server tunnel instances have stopped')
    })
  }
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
}

function killRunningTunnels() {
  return tunnels()
  .then(procs => {
    procs.forEach(proc => {
      stopProc(proc.pid)
    })
    utils.log.debug('killed %d found tunnel processes', procs.length)
    return true
  })
}

function awaitZeroTunnels() {
  const max = 6, minTimeout = 500, factor = 2
  const check = (retries) => {
    return tunnels()
    .then(procs => {
      utils.log.debug('number of remaining tunnel processes', procs.length)
      if(!procs.length) {
        return 0
      }
      if(retries !== max) {
        throw new Error('not exhausted retries of waiting for zero tunnels')
      }
      return procs.length
    })
  }
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
}

function ensureZeroTunnels() {
  const max = 6, minTimeout = 500, factor = 2
  const check = (retries) => {
    return killServerTunnels()
    .then(killRunningTunnels)
    .then(awaitZeroTunnels)
    .then(tunnels)
    .then(procs => {
      if(!procs.length) {
        return true
      }
      if(retries !== max) {
        throw new Error('not exhausted retries of ensuring zero tunnels')
      }
      throw new Error('could not kill all tunnels')
    })
  }
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
}

const baseUrl = 'https://crossbrowsertesting.com/api/v3/livetests'

function safeKillJob(job) {
  var max = 7, minTimeout = 400, factor = 2
  const check = () => {
    return jobStatus(job)
    .then(status => {
      if('stopped' === status) {
        utils.log.debug('job %s stopped', job.id)
        return true
      }
      utils.log.debug('job %s not stopped yet', job.id)
      throw new Error('not done yet')
    })
  }
  return killJob(job)
  .then(() => {
    return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
  })
}

function killJob(job) {
  return writeRequest(baseUrl + '/' + job.id, 'DELETE')
  .then(response => {
    utils.log.debug('response for stopping job %s', job.id, response.body)
    return true
  })
  .catch(error => {
    utils.log.debug('job %s stop error %d', job.id, error.statusCode, error.response.body)
    throw error
  })
}

function jobStatus(job) {
  return readRequest(baseUrl + '/' + job.id, 'GET')
  .then(response => {
    utils.log.debug('status api response for job %s', job.id, response.body)
    if(!response.body.active && 'stopped' === response.body.state) {
      return 'stopped'
    }
    return 'running'
  })
  .catch(err => {
    utils.log.error('error: ', err)
    throw err
  })
}

function safeStopScript(scriptJob) {
  if(scriptJob.timer) {
    clearTimeout(scriptJob.timer)
    delete scriptJob.timer
  }
  utils.log.debug('closing web driver session %s', scriptJob.session)
  return scriptJob.driver.quit()
  .then(response => {
    utils.log.debug('web driver session %s closed', scriptJob.session)
    return waitForScriptStop(scriptJob)
  })
  .catch(err => {
    utils.log.info('web driver session %s closed with error %s', scriptJob.session, err)
    return true
  })
}

function waitForScriptStop(scriptJob) {
  var max = 7, minTimeout = 400, factor = 2
  const check = () => {
    return readRequest(host + seleniumTestApi.replace(/{platformId}/, scriptJob.platformId), 'GET')
    .then(response => {
      if(!response.body.active && 'stopped' === response.body.state) {
        utils.log.debug('script job session %s stopped', scriptJob.session)
        return true
      }
      utils.log.debug('script job session %s not stopped yet', scriptJob.session)
      throw new Error('not done yet')
    })
  }
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
}

function writeRequest(url, method, body) {
  var req = new Request()
  var options = {
    json: true,
    resolveWithFullResponse: true,
    auth: {
      user: process.env.CROSSBROWSERTESTING_USERNAME,
      pass: process.env.CROSSBROWSERTESTING_ACCESS_KEY
    }
  }
  if(body) {
    options.body = body
  }
  return req.request(url, method, options)
}

function readRequest(url, method) {
  var req = new Request()
  return req.request( url, method, {
    json: true,
    resolveWithFullResponse: true,
    auth: {
      user: process.env.CROSSBROWSERTESTING_USERNAME,
      pass: process.env.CROSSBROWSERTESTING_ACCESS_KEY
    }
  })
}

exports.log = utils.log
exports.ensureZeroTunnels = ensureZeroTunnels
exports.tunnels = tunnels
exports.buildDetails = utils.buildDetails
exports.safeKillJob = safeKillJob
exports.safeStopScript = safeStopScript
exports.waitForScriptStop = waitForScriptStop
