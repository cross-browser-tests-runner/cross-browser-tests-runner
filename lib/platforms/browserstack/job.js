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
  baseUrl: 'https://api.browserstack.com/4/worker',
  username: process.env.BROWSERSTACK_USERNAME,
  accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
  timeout: 60
}

class Job extends JobBase {

  constructor(url, browser, capabilities, serverId) {
    super()
    this.url = url
    this.browser = browser
    this.capabilities = capabilities
    this.serverId = serverId
  }

  static create(url, browser, capabilities, runId, isNative) {
    let
      bRet = JobBase.create(url, browser, capabilities, runId, isNative),
      vRet = Values.js(bRet.browser || { }, bRet.capabilities)
    return startJob(new Job(bRet.url, vRet.browser, vRet.capabilities, bRet.serverId))
  }

  static createMultiple(url, browsers, capabilities, runId, isNative) {
    if(!browsers || !browsers.length) {
      throw new InputError('Platforms.BrowserStack.Job: no browsers specified for createMultiple')
    }
    let bRetAll = JobBase.createMultiple(url, browsers, capabilities || { }, runId, isNative),
      promises = [ ]
    bRetAll.forEach(bRet => {
      let
        vRet = Values.js(bRet.browser || { }, bRet.capabilities)
      promises.push(startJob(new Job(bRet.url, vRet.browser, vRet.capabilities, bRet.serverId)))
    })
    return Bluebird.all(promises)
  }

  status() {
    return readRequest(this.endpoint, 'GET')
    .then(response => {
      let status = (response.body && response.body.status || 'stopped')
      return status
    })
  }

  screenshot() {
    return safeScreenshot(this)
  }

  stop(passed) {
    return waitForRunning(this)
    .then(() => {
      return writeRequest('https://www.browserstack.com/automate/sessions/' + this.session + '.json', 'PUT', {
        status: false !== passed ? 'passed' : 'failed'
      })
    })
    .then(() => {
      return terminateRetries(this)
    })
  }
}

function startJob(job) {
  log.debug('attempt to create with browser %s capabilities %s url %s', JSON.stringify(job.browser), JSON.stringify(job.capabilities), job.url)
  return writeRequest(VARS.baseUrl, 'POST', Object.assign({url: job.url}, job.browser, job.capabilities))
  .catch(error => {
    log.error('creating job failed with status %d and response %s', error.statusCode, JSON.stringify(error.response.body))
    throw new InputError(error.message)
  })
  .then(response => {
    job.id = response.body.id
    job.endpoint = VARS.baseUrl + '/' + job.id
    return readRequest(job.endpoint, 'GET')
  })
  .then(response => {
    job.session = response.body.browser_url.replace(/^.*sessions\//, '')
    log.info('created with id %s, endpoint %s, session %s, for browser %s capabilities %s url %s', job.id, job.endpoint, job.session, JSON.stringify(job.browser), JSON.stringify(job.capabilities), job.url)
    return job
  })
}

function safeScreenshot(job) {
  let max = 7, minTimeout = 500, factor = 2
  const check = () => {
    return readRequest(job.endpoint + '/screenshot.json', 'GET')
    .then(res => {
      log.info('screenshot for id ' + job.id + ' created with response', res.body)
      return res.body.url
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

function waitForRunning(job) {
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

function terminateRetries(job) {
  let max = 12, minTimeout = 5000, factor = 1
  const check = () => {
    return writeRequest(job.endpoint, 'DELETE')
    .then(response => {
      log.debug('%s delete call response status %d', job.id, response.statusCode)
      return job.status()
    })
    .catch(error => {
      log.warn('termination failed with status %d and response %s', error.statusCode, JSON.stringify(error.response.body))
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

function writeRequest(url, method, data) {
  let req = new Request()
  return req.request(url, method, {
    body: data || { },
    json: true,
    resolveWithFullResponse: true,
    auth: auth()
  })
}

function readRequest(url, method) {
  let req = new Request()
  return req.request(url, method, {
    json: true,
    resolveWithFullResponse: true,
    auth: auth()
  })
}

function auth() {
  return {
    user: VARS.username,
    pass: VARS.accessKey
  }
}

exports.Job = Job
exports.JobVars = VARS
