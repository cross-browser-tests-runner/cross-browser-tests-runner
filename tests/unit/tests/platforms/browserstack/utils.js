'use strict';

var
  ps = require('ps-node'),
  path = require('path'),
  retry = require('p-retry'),
  sleep = require('./../../../../../lib/core/sleep'),
  Request = require('./../../../../../lib/core/request').Request,
  BinaryVars = require('./../../../../../lib/platforms/browserstack/tunnel/binary').BinaryVars,
  utils = require('./../../core/utils')

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

function killJob(job) {
  var req = new Request()
  return req.request(
    job.endpoint,
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
    utils.log.debug('job %s stop error %d', job.id, error.statusCode, error.response.body)
    throw error
  })
}

function jobStatus(job) {
  var req = new Request()
  return req.request(
    job.endpoint,
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
    var status = (response.body && response.body.status || 'stopped')
    return status
  })
}

function waitUntilRunningRetries(job) {
  var max = 6, minTimeout = 500, factor = 2
  const check = () => {
    return jobStatus(job)
    .then(status => {
      if('running' === status || 'stopped' === status) {
        utils.log.debug('job %s status is %s, no need to wait anymore', job.id, status)
        return true
      }
      utils.log.debug('job %s status is %s, waiting for it to become running', job.id, status)
      throw new Error('job ' + job.id + ' status is still ' + status)
    })
  }
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
}

function terminateJobRetries(job) {
  var max = 12, minTimeout = 5000, factor = 1
  const check = () => {
    return killJob(job)
    .then(() => {
      return jobStatus(job)
    })
    .catch(error => {
      return jobStatus(job)
    })
    .then(status => {
      if('stopped' === status) {
        utils.log.debug('job %s stopped', job.id)
        return true
      }
      utils.log.debug('job %s not stopped yet', job.id)
      throw new Error('not done yet')
    })
  }
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
}

function safeKillJob(job) {
  return waitUntilRunningRetries(job)
  .then(() => {
    return terminateJobRetries(job)
  })
  .catch(() => {
    return terminateJobRetries(job)
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
    return true
  })
  .catch(err => {
    utils.log.info('web driver session %s closed with error %s', scriptJob.session, err)
    return true
  })
}

exports.ensureZeroTunnels = ensureZeroTunnels
exports.safeKillJob = safeKillJob
exports.safeStopScript = safeStopScript
exports.buildDetails = utils.buildDetails
exports.tunnels = tunnels
exports.log = utils.log
