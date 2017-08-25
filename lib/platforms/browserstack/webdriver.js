'use strict'

let
  Bluebird = require('bluebird'),
  retry = require('p-retry'),
  WebDriverBase = require('./../core/webdriver').WebDriver,
  Request = require('./../../core/request').Request,
  Log = require('./../../core/log').Log

let log = new Log('Platforms.BrowserStack.WebDriver')

const VARS = {
  server: 'http://hub-cloud.browserstack.com/wd/hub',
  sessionApiUrl: 'https://www.browserstack.com/automate/sessions/{session}.json',
  username: process.env.BROWSERSTACK_USERNAME,
  accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
  status: {
    done: 'stopped',
    running: 'running',
    passed: 'stopped',
    failed: 'stopped'
  }
}

class WebDriver extends WebDriverBase {

  constructor(url, options) {
    options = options || { }
    options['browserstack.user'] = VARS.username
    options['browserstack.key'] = VARS.accessKey
    options['browserName'] = options['browser']
    super(VARS.server, url, options)
  }

  markStatus(decider) {
    if(!this.session) {
      throw new Error('Platforms.BrowserStack.WebDriver: session not created yet to mark')
    }
    return decide(this.driver, this.wd, decider)
    .then(status => {
      log.debug('Marking status of %s as %s', this.session, status)
      return markRetries(this.session, status)
    })
  }

  screenshot() {
    if(!this.session) {
      throw new Error('Platforms.BrowserStack.WebDriver: session not created yet to take screenshot')
    }
    log.debug('Taking screenshot for %s', this.session)
    return this.driver.takeScreenshot()
  }

  status() {
    if(!this.session) {
      throw new Error('Platforms.BrowserStack.WebDriver: session not created yet to get status')
    }
    let req = new Request()
    return req.request(
      VARS.sessionApiUrl.replace(/{session}/, this.session),
      'GET',
      getOptions()
    )
    .then(response => {
      log.debug('status response', response)
      return VARS.status[response.automation_session.status]
    })
    .catch(err => {
      log.warn('status api error', err)
      return 'stopped'
    })
  }

}

function decide(driver, wd, decider) {
  return new Bluebird(resolve => {
    if('function' === typeof(decider)) {
      try {
        callDecider(driver, wd, decider, resolve)
      } catch(err) {
        resolve("failed")
      }
    }
    else {
      resolve("passed")
    }
  })
}

function callDecider(driver, wd, decider, resolve) {
  decider(driver, wd)
  .then(result => {
    resolve(result ? "passed" : "failed")
  })
  .catch(() => {
    resolve("failed")
  })
}

function markRetries(session, status) {
  const maxRetries = 5, factor = 2, minTimeout = 2000
  const check = () => {
    let req = new Request()
    return req.request(
      VARS.sessionApiUrl.replace(/{session}/, session),
      'PUT',
      markReqOptions(status)
    )
    .then(() => {
      return true
    })
  }
  return retry(check, { retries: maxRetries, minTimeout: minTimeout, factor: factor })
}

function markReqOptions(status) {
  return {
    json: true,
    resolveWithFullResponse: true,
    body: {
      status: status
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

exports.WebDriver = WebDriver
exports.WebDriverVars = VARS
