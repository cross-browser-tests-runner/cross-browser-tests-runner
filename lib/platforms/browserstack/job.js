'use strict';

let
  retry = require('p-retry'),
  Bluebird = require('bluebird'),
  Log = require('./../../core/log').Log,
  InputError = require('./../../core/errors').InputError,
  Request = require('./../../core/request').Request,
  JobBase = require('./../core/job').Job,
  Values = require('./values').Values

let log = new Log('Platforms.BrowserStack.Job')

const VARS = {
  commonOptions: [ 'host', 'username', 'accessKey' ],
  host: 'https://api.browserstack.com/4',
  username: process.env.BROWSERSTACK_USERNAME,
  accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
  timeout: 60,
  jobApiEndpoint: '/worker'
}

class Job extends JobBase {

  constructor(options, serverId) {
    super()
    this.processed = parse(options)
    this.serverId = serverId
  }

  static create(url, browser, capabilities, runId, isNative) {
    let
      bRet = JobBase.create(url, browser, capabilities, runId, isNative),
      vRet = Values.js(bRet.browser || { }, bRet.capabilities),
      options = Object.assign({ }, vRet.browser, vRet.capabilities)
    options.url = bRet.url
    return startJob(new Job(options, bRet.serverId))
  }

  static createMultiple(url, browsers, capabilities, runId, isNative) {
    if(!browsers || !browsers.length) {
      throw new InputError('Platforms.BrowserStack.Job: no browsers specified for createMultiple')
    }
    let bRetAll = JobBase.createMultiple(url, browsers, capabilities || { }, runId, isNative),
      promises = [ ]
    bRetAll.forEach(bRet => {
      let
        vRet = Values.js(bRet.browser || { }, bRet.capabilities),
        options = Object.assign({ }, vRet.browser, vRet.capabilities)
      options.url = bRet.url
      promises.push(startJob(new Job(options, bRet.serverId)))
    })
    return Bluebird.all(promises)
  }

  status() {
    let callbacks = {
      onresponse: response => {
        let status = (response.body && response.body.status || 'stopped')
        return status
      }
    }
    return apiReq(this, 'GET', callbacks)
  }

  screenshot() {
    return safeScreenshot(this)
  }

  stop() {
    let callbacks = termCallbacks(this)
    return safeTerminate(this, callbacks)
  }
}

function parse(config) {
  let settings = { }
  VARS.commonOptions.forEach(commonKey => {
    settings[commonKey] = config[commonKey] || VARS[commonKey]
  })
  return { settings: settings, config: config }
}

function createCallbacks(job) {
  return {
    onerror: error => {
      onerror(error, 'creation')
    },
    onresponse: response => {
      job.id = response.body.id
      job.endpoint = job.processed.settings.host + VARS.jobApiEndpoint + '/' + job.id
      log.info('created with id %s, endpoint %s, for settings %s browser config %s', job.id, job.endpoint, JSON.stringify(job.processed.settings), JSON.stringify(job.processed.config))
    }
  }
}

function startJob(job) {
  log.debug('attempt to create with settings %s browser config %s', JSON.stringify(job.processed.settings), JSON.stringify(job.processed.config))
  let callbacks = createCallbacks(job)
  let req = new Request()
  return req.request(
    job.processed.settings.host + VARS.jobApiEndpoint,
    'POST',
    {
      body: job.processed.config,
      json: true,
      resolveWithFullResponse: true,
      auth: auth(job)
    }
  )
  .then(response => {
    callbacks.onresponse(response)
    return job
  })
  .catch(err => {
    callbacks.onerror(err)
  })
}

function termCallbacks(job) {
  return {
    onerror: error => {
      onerror(error, 'termination')
    },
    onresponse: response => {
      log.debug('%s delete call response status %d', job.id, response.statusCode)
    }
  }
}

function onerror(error, op) {
  if('creation' === op) {
    log.error('creating job failed with status %d and response %s', error.statusCode, JSON.stringify(error.response.body))
    throw new InputError(error.message)
  }
  else {
    log.warn('%s failed with status %d and response %s', op, error.statusCode, JSON.stringify(error.response.body))
    throw error
  }
}

function apiReq(job, method, callbacks) {
  let req = new Request()
  return req.request(
    job.endpoint,
    method,
    {
      json: true,
      resolveWithFullResponse: true,
      auth: auth(job)
    }
  )
  .then(callbacks.onresponse)
  .catch(callbacks.onerror)
}

function auth(job) {
  return {
    user: job.processed.settings.username,
    pass: job.processed.settings.accessKey
  }
}

function safeScreenshot(job) {
  let max = 7, minTimeout = 500, factor = 2
  const check = () => {
    let req = new Request()
    return req.request(
      job.endpoint + '/screenshot.json',
      'GET', {
        json: true,
        auth: auth(job)
      }
    )
    .then(res => {
      log.info('screenshot for id ' + job.id + ' created with response', res)
      return res.url
    })
    .catch(err => {
      if(err.message && err.message.match(/Worker not found/)) {
        throw new retry.AbortError(err.message)
      }
      log.error('error while creating screenshot %s', err)
      throw err
    })
  }
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
}

function safeTerminate(job, callbacks) {
  return waitForRunningRetries(job)
  .then(() => {
    return safeTerminateRetries(job, callbacks)
  })
}

function waitForRunningRetries(job) {
  let max = 6, minTimeout = 500, factor = 2
  const check = () => {
    return job.status()
    .then(status => {
      if('running' === status || 'stopped' === status) {
        log.debug('job %s status is "%s", wait for non-queue status is over', job.id, status)
        return true
      }
      log.debug('job %s status is "%s", waiting till it becomes "running"', job.id, status)
      throw new Error('Platforms.BrowserStack.Job: job status is not "running" yet')
    })
  }
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
}

function safeTerminateRetries(job, callbacks) {
  let max = 12, minTimeout = 5000, factor = 1
  const check = () => {
    return apiReq(job, 'DELETE', callbacks)
    .then(() => {
      return job.status()
    })
    .catch(() => {
      return job.status()
    })
    .then(status => {
      if('stopped' === status) {
        log.debug('job %s is stopped', job.id)
        return true
      }
      log.debug('job %s not stopped yet, with status reported "%s", trying to stop again..', job.id, status)
      throw new Error('Platforms.BrowserStack.Job: not done yet')
    })
  }
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
}

exports.Job = Job
exports.JobVars = VARS
