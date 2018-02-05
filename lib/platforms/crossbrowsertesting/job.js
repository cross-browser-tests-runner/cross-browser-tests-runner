'use strict';

let
  retry = require('p-retry'),
  Bluebird = require('bluebird'),
  Log = require('./../../core/log').Log,
  InputError = require('./../../core/errors').InputError,
  Request = require('./../../core/request').Request,
  JobBase = require('./../core/job').Job,
  Values = require('./values').Values

let log = new Log('Platforms.CrossBrowserTesting.Job')

const VARS = {
  baseUrl: 'http://crossbrowsertesting.com/api/v3/livetests',
  username: process.env.CROSSBROWSERTESTING_USERNAME,
  accessKey: process.env.CROSSBROWSERTESTING_ACCESS_KEY
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
      throw new InputError('Platforms.CrossBrowserTesting.Job: no browsers specified for createMultiple')
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
    return readRequest(VARS.baseUrl + '/' + this.id, 'GET')
    .then(response => {
      if(!response.body.active && 'stopped' === response.body.state) {
        return 'stopped'
      }
      return 'running'
    })
  }

  stop() {
    return writeRequest(VARS.baseUrl + '/' + this.id, 'DELETE')
    .then(() => {
      return ensureStopped(this)
    })
  }

  screenshot() {
    return writeRequest(VARS.baseUrl + '/' + this.id + '/snapshots', 'POST')
    .then(response => {
      log.info('screenshot for id ' + this.id + ' created with response', response.body)
      return response.body.show_result_web_url
    })
  }
}

function startJob(job) {
  log.debug('attempt to create with url %s browser %s capabilities %s', job.url, JSON.stringify(job.browser), JSON.stringify(job.capabilities))
  let callbacks = createCallbacks(job)
  return writeRequest(VARS.baseUrl, 'POST', getLiveTestParams(job), false)
  .then(response => {
    callbacks.onresponse(response)
    return job
  })
  .catch(err => {
    callbacks.onerror(err)
  })
}

function createCallbacks(job) {
  return {
    onerror: error => {
      log.error('creating job failed with status %d and response %s', error.statusCode, JSON.stringify(error.response.body))
      throw new InputError(error.message)
    },
    onresponse: response => {
      job.id = response.body.live_test_id
      log.info('created with id %s, for url %s browser %s capabilities %s', job.id, job.url, JSON.stringify(job.browser), JSON.stringify(job.capabilities))
    }
  }
}

function getLiveTestParams(job) {
  let ret = { browser: getBrowserString(job.browser), url: job.url }
  job.capabilities.api_timeout = job.capabilities.max_duration
  delete job.capabilities.max_duration
  return Object.assign(ret, job.capabilities)
}

function getBrowserString(browser) {
  let details = [ browser.os_api_name, browser.browser_api_name ]
  if(browser.screen_resolution) {
    details.push(browser.screen_resolution)
  }
  return details.join("|")
}

function ensureStopped(job) {
  let max = 7, minTimeout = 200, factor = 2
  const check = () => {
    return job.status()
    .then(status => {
      if('stopped' === status) {
        log.debug('job %s is stopped', job.id)
        return true
      }
      log.debug('job %s not stopped yet, with status reported "%s"', job.id, status)
      throw new Error('Platforms.CrossBrowserTesting.Job: not done yet')
    })
  }
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
}

function writeRequest(url, method, data) {
  let req = new Request()
  return req.request(url, method, {
    resolveWithFullResponse: true,
    auth: auth(),
    json: true,
    body: data || { },
    headers: {
      'User-agent': 'curl/7.54.0'
    }
  })
}

function readRequest(url, method, data) {
  let req = new Request()
  return req.request(url, method, {
    resolveWithFullResponse: true,
    auth: auth(),
    json: true
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
