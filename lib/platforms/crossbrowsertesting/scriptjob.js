'use strict'

let
  retry = require('p-retry'),
  Log = require('./../../core/log').Log,
  Request = require('./../../core/request').Request,
  utils = require('./../../core/utils'),
  ScriptJobBase = require('./../core/scriptjob').ScriptJob,
  Values = require('./values').Values,
  log = new Log('Platforms.CrossBrowserTesting.ScriptJob')

const VARS = {
  server: 'http://hub.crossbrowsertesting.com:80/wd/hub',
  detailsUrl: 'https://crossbrowsertesting.com/api/v3/selenium?active=true&build={build}&name={name}',
  url: 'https://crossbrowsertesting.com/api/v3/selenium/{platformId}',
  username: process.env.CROSSBROWSERTESTING_USERNAME,
  accessKey: process.env.CROSSBROWSERTESTING_ACCESS_KEY
}

class ScriptJob extends ScriptJobBase {

  constructor(url, browser, capabilities) {
    capabilities = capabilities || { }
    utils.buildParams(capabilities)
    delete capabilities.project
    let vRet = Values.selenium(browser || { }, capabilities)
    vRet.capabilities['username'] = VARS.username
    vRet.capabilities['password'] = VARS.accessKey
    super(VARS.server, url, vRet.browser, vRet.capabilities)
  }

  create() {
    const iteration = () => {
      return ScriptJobBase.prototype.create.call(this)
      .catch(err => {
        if(err.message.match(/Socket timed out after/) ||
          err.message.match(/A new session could not be created/))
        {
          throw err
        }
        throw new retry.AbortError(err.message)
      })
    }
    return retry(iteration, { retries: 5, minTimeout: 1000, factor: 2 })
    .then(() => {
      return getPlatformId(this)
    })
  }

  markStatus(decider) {
    return ScriptJobBase.prototype.markStatus.apply(this, [
      decider,
      VARS.url.replace(/{platformId}/, this.platformId),
      'PUT',
      markReqOptions
    ])
  }

  screenshot() {
    if(!this.session) {
      throw new Error('Platforms.CrossBrowserTesting.ScriptJob: session not created yet to take screenshot')
    }
    // driver's screenshot method does not work with CBT and use their
    // Selenium screenshot API needs to be used instead
    return writeRequest(VARS.url.replace(/{platformId}/, this.platformId) + '/snapshots', 'POST')
  }

  status() {
    return ScriptJobBase.prototype.status.apply(this, [
      VARS.url.replace(/{platformId}/, this.platformId),
      getOptions,
      (response) => {
        if(!('active' in response) || !('state' in response)) {
          return 'stopped'
        }
        return (!response.active && 'stopped' === response.state ? 'stopped' : 'running')
      }
    ])
  }

  stop() {
    return ScriptJobBase.prototype.stop.call(this)
    .then(() => {
      return waitUntilStopped(this)
    })
  }

}

function getPlatformId(scriptJob) {
  let url = VARS.detailsUrl
    .replace(/{name}/, scriptJob.options.name)
    .replace(/{build}/, scriptJob.options.build)
  return readRequest(url, 'GET')
  .then(response => {
    scriptJob.platformId = response.selenium[0].selenium_test_id
    log.info('platform-id %d for session %s', scriptJob.platformId, scriptJob.session)
    return Promise.resolve(true)
  })
}

function markReqOptions(status) {
  return {
    json: true,
    resolveWithFullResponse: true,
    body: {
      action: 'set_score',
      score: 'passed' === status ? 'pass' : 'fail'
    },
    auth: {
      user: VARS.username,
      pass: VARS.accessKey
    }
  }
}

function getOptions() {
  return {
    json: true,
    auth: {
      user: VARS.username,
      pass: VARS.accessKey
    }
  }
}

function waitUntilStopped(scriptJob) {
  const check = () => {
    return readRequest(VARS.url.replace(/{platformId}/, scriptJob.platformId), 'GET')
    .then(response => {
      if(!response.active && 'stopped' === response.state) {
        return true
      }
      throw new Error('not done yet')
    })
  },
  max = 7, minTimeout = 200, factor = 2
  return retry(check, {retries: max, minTimeout: minTimeout, factor: factor})
}

function readRequest(url, method) {
  let req = new Request()
  return req.request(url, method, getOptions())
}

function writeRequest(url, method, data) {
  let req = new Request(), options = getOptions()
  options.body = data || { }
  return req.request(url, method, options)
}

exports.ScriptJob = ScriptJob
exports.ScriptJobVars = VARS
