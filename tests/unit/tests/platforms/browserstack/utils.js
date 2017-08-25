'use strict';

var
  ps = require('ps-node'),
  expect = require('chai').expect,
  path = require('path'),
  retry = require('p-retry'),
  sleep = require('./../../../../../lib/core/sleep'),
  Request = require('./../../../../../lib/core/request').Request,
  BinaryVars = require('./../../../../../lib/platforms/browserstack/tunnel/binary').BinaryVars,
  coreUtils = require('./../../core/utils')

function stopProc(pid) {
  try {
    process.kill(pid)
  }
  catch(e) {
    // ignore what would be typically ESRCH here
  }
  var counter = 10
  while(counter--) {
    try {
      process.kill(pid, 0)
      coreUtils.log.debug('waiting as process %d is still responding...', pid)
      sleep.msleep(800)
    }
    catch(e) {
      break
    }
  }
  coreUtils.log.debug('Stopped process %d', pid)
}

function tunnels() {
  return new Promise(resolve => {
    ps.lookup({
      command: path.basename(BinaryVars.path)
    },
    function(err, procs) {
      if(err) throw new Error(err)
      resolve(procs || [ ])
    })
  })
}

function killRunningTunnels() {
  return tunnels()
  .then(procs => {
    procs.forEach(proc => {
      stopProc(proc.pid)
    })
    coreUtils.log.debug('killed %d found tunnel processes', procs.length)
    return true
  })
}

function awaitZeroTunnels() {
  const max = 6, minTimeout = 500, factor = 2
  const check = (retries) => {
    return tunnels()
    .then(procs => {
      coreUtils.log.debug('number of remaining tunnel processes', procs.length)
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
    return killRunningTunnels()
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

function killWorker(worker) {
  var req = new Request()
  return req.request(
    worker.endpoint,
    'DELETE',
    {
      json: true,
      resolveWithFullResponse: true,
      auth: {
        user: process.env.BROWSERSTACK_USERNAME,
        pass: process.env.BROWSERSTACK_ACCESS_KEY
      }
    }
  )
  .then(() => {
    return true
  })
  .catch(error => {
    coreUtils.log.debug('worker %s terminate error %d', worker.id, error.statusCode, error.response.body)
    throw error
  })
}

function workerStatus(worker) {
  var req = new Request()
  return req.request(
    worker.endpoint,
    'GET',
    {
      json: true,
      resolveWithFullResponse: true,
      auth: {
        user: process.env.BROWSERSTACK_USERNAME,
        pass: process.env.BROWSERSTACK_ACCESS_KEY
      }
    }
  )
  .then(response => {
    var status = (response.body && response.body.status || 'terminated')
    return status
  })
}

function waitUntilRunningRetries(worker) {
  var max = 6, minTimeout = 500, factor = 2
  const check = () => {
    return workerStatus(worker)
    .then(status => {
      if('running' === status || 'terminated' === status) {
        coreUtils.log.debug('worker %s status is %s, no need to wait anymore', worker.id, status)
        return true
      }
      coreUtils.log.debug('worker %s status is %s, waiting for it to become running', worker.id, status)
      throw new Error('worker ' + worker.id + ' status is still ' + status)
    })
  }
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
}

function terminateWorkerRetries(worker) {
  var max = 12, minTimeout = 5000, factor = 1
  const check = () => {
    return killWorker(worker)
    .then(() => {
      return workerStatus(worker)
    })
    .catch(error => {
      return workerStatus(worker)
    })
    .then(status => {
      if('terminated' === status) {
        coreUtils.log.debug('worker %s terminated', worker.id)
        return true
      }
      coreUtils.log.debug('worker %s not terminated yet', worker.id)
      throw new Error('not done yet')
    })
  }
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
}

function safeKillWorker(worker) {
  return waitUntilRunningRetries(worker)
  .then(() => {
    return terminateWorkerRetries(worker)
  })
  .catch(() => {
    return terminateWorkerRetries(worker)
  })
}

function safeStopScript(webDriver) {
  if(webDriver.timer) {
    clearTimeout(webDriver.timer)
    delete webDriver.timer
  }
  coreUtils.log.debug('closing web driver session %s', webDriver.session)
  return webDriver.driver.quit()
  .then(response => {
    coreUtils.log.debug('web driver session %s closed', webDriver.session)
    return true
  })
  .catch(err => {
    coreUtils.log.info('web driver session %s closed with error %s', webDriver.session, err)
    return true
  })
}

exports.ensureZeroTunnels = ensureZeroTunnels
exports.safeKillWorker = safeKillWorker
exports.safeStopScript = safeStopScript
exports.buildDetails = coreUtils.buildDetails
exports.log = coreUtils.log
