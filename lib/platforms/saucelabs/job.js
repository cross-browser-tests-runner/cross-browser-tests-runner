'use strict';

let
  retry = require('p-retry'),
  Bluebird = require('bluebird'),
  Log = require('./../../core/log').Log,
  InputError = require('./../../core/errors').InputError,
  Request = require('./../../core/request').Request,
  JobBase = require('./../core/job').Job

let log = new Log('Platforms.SauceLabs.Job')

const VARS = {
  host: 'https://saucelabs.com/rest/v1',
  username: process.env.SAUCE_USERNAME,
  accessKey: process.env.SAUCE_ACCESS_KEY,
  timeout: 60,
  JobStatusMap: {
    'complete': 'stopped',
    'in progress': 'running'
  },
  JsTestStatusMap: {
    'test queued': 'queue',
    'test new': 'queue',
    'test session in progress': 'running',
    'test error': 'stopped',
    'test complete': 'stopped',
    'not found': 'stopped'
  }
}

class Job extends JobBase {

  constructor(id, jsTestId, serverId) {
    super()
    this.jsTestId = jsTestId
    this.serverId = serverId
    this.setId(id)
    log.debug('created with id %s, js-test id %s, server id %s', this.id, this.jsTestId, this.serverId)
  }

  static create(url, browser, capabilities, runId, isNative) {
    let
      bRes = JobBase.create(url, browser, capabilities, runId, isNative),
      data = createData(bRes)
    return startJob(data, bRes.serverId)
  }

  static createMultiple(url, browsers, capabilities, runId, isNative) {
    if(!browsers || !browsers.length) {
      throw new Error('Platforms.SauceLabs.Job: no browsers specified for createMultiple')
    }
    let
      bResAll = JobBase.createMultiple(url, browsers, capabilities || { }, runId, isNative),
      promises = [ ]
    bResAll.forEach(bRes => {
      let data = createData(bRes)
      promises.push(startJob(data, bRes.serverId))
    })
    return Bluebird.all(promises)
  }

  status() {
    if(!this.id) {
      return jsTestStatus(this)
    }
    else {
      return jobStatus(this)
    }
  }

  stop() {
    return waitUntilRunning(this)
    .then(() => {
      return stopJob(this)
    })
  }

  screenshot() {
    return Promise.resolve(true)
  }

  setId(id) {
    this.id = id
    this.endpoint = VARS.host + '/' + VARS.username + '/jobs/' + this.id
  }
}

function createData(bRes) {
  bRes.browser = bRes.browser || { }
  bRes.capabilities = bRes.capabilities || { }
  let data = {
    url: bRes.url,
    platforms: [[bRes.browser.platform, bRes.browser.browserName, bRes.browser.version]],
    framework: bRes.capabilities.framework || 'jasmine'
  }
  if('framework' in bRes.capabilities) {
    delete bRes.capabilities.framework
  }
  /* eslint-disable guard-for-in */
  for(let key in bRes.capabilities) {
    data[key] = bRes.capabilities[key]
  }
  /* eslint-enable guard-for-in */
  return data
}

function startJob(data, serverId) {
  log.debug('attempt to create js-test with settings %s, server id %s', JSON.stringify(data), serverId)
  let jsTestId
  return writeReq(VARS.host + '/' + VARS.username + '/js-tests', 'POST', data)
  .then(response => {
    jsTestId = response.body['js tests'][0]
    return writeReq(VARS.host + '/' + VARS.username + '/js-tests/status', 'POST', response.body)
  })
  .then(response => {
    let details = response.body['js tests'][0]
    if('test error' === details.status && 'job not ready' === details.job_id) {
      throw new InputError('Platforms.SauceLabs.Job: job could not be created due to bad input, response is ' + JSON.stringify(response.body))
    }
    return new Job(null, jsTestId, serverId)
  })
}

function waitUntilRunning(job) {
  if(job.id) {
    log.debug('have an id %s already', job.id)
    return Promise.resolve(true)
  }
  log.debug('have only js-test id %s and not a job id, so would wait for getting one', job.jsTestId)
  var max = 120, minTimeout = 2000, factor = 1
  const check = () => {
    return jsTestStatus(job)
    .then(status => {
      if(-1 !== ['stopped', 'running'].indexOf(status)) {
        return true
      }
      throw new Error('did not get a job id yet')
    })
  }
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
}

function stopJob(job) {
  if(!job.id) {
    return Promise.resolve(true)
  }
  return writeReq(job.endpoint + '/stop', 'PUT')
  .then(response => {
    log.debug('id %s stopping response %s', job.id, JSON.stringify(response.body))
    return waitUntilStopped(job)
  })
  .then(() => {
    if(null === job.passed) {
      return markAsPassed(job)
    }
    else {
      return Promise.resolve(true)
    }
  })
}

function waitUntilStopped(job) {
  var max = 7, minTimeout = 400, factor = 2
  const check = () => {
    return job.status()
    .then(status => {
      log.debug('id %s status is %s', job.id, status)
      if('stopped' === status) {
        return true
      }
      throw new Error('job is still running')
    })
  }
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
}

function markAsPassed(job) {
  return writeReq(job.endpoint, 'PUT', { passed: true })
}

function jsTestStatus(job) {
  let details = {'js tests':[job.jsTestId]}
  return writeReq(VARS.host + '/' + VARS.username + '/js-tests/status', 'POST', details)
  .then(response => {
    let details = response.body['js tests'][0]
    log.debug('js-test status response %s', JSON.stringify(details))
    if(details.job_id && 'job not ready' !== details.job_id) {
      job.setId(details.job_id)
      return jobStatus(job)
    }
    return VARS.JsTestStatusMap[details.status]
  })
}

function jobStatus(job) {
  return readReq(job.endpoint, 'GET')
  .then(response => {
    log.debug('id %s status api response %s', job.id, JSON.stringify(response.body))
    job.passed = response.body.passed
    return VARS.JobStatusMap[response.body.status]
  })
  .catch(err => {
    log.warn('id %s error response for status api %s', job.id, err)
    return 'stopped'
  })
}

function writeReq(url, method, body) {
  let req = new Request()
  let options = {
    json: true,
    resolveWithFullResponse: true,
    auth: {
      user: VARS.username,
      pass: VARS.accessKey
    }
  }
  if(body) {
    options.body = body
  }
  return req.request(url, method, options)
}

function readReq(url, method) {
  let req = new Request()
  return req.request(
    url,
    method,
    {
      json: true,
      resolveWithFullResponse: true,
      auth: {
        user: VARS.username,
        pass: VARS.accessKey
      }
    }
  )
}

exports.Job = Job
exports.JobVars = VARS
