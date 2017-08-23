'use strict'

let
  uuidv4 = require('uuid/v4'),
  Log = require('./../../../../../lib/core/log').Log,
  log = new Log('Server.Runners.Native.Tests.Test'),
  coreUtils = require('./../../../../../lib/core/utils'),
  CiFactory = require('./../../../../../lib/ci/factory').Factory,
  aliases = {
    /* eslint-disable global-require */
    BrowserStack: require('./../../../../../conf/browserstack-conf.json').Aliases
    /* eslint-enable global-require */
  }

aliases.BrowserStack.Browsers = coreUtils.swapKV(aliases.BrowserStack.Browsers)
aliases.BrowserStack['Operating Systems'] = coreUtils.swapKV(aliases.BrowserStack['Operating Systems'])

class Test {

  constructor(name, host, testFile, run, browser, capabilities, retries) {
    this.id = uuidv4()
    this.status = 'pending'
    this.on = name
    this.url = host + '/' + testFile.replace(/^\//, '') + '?cbtr_run=' + run + '&cbtr_test=' + this.id
    if(aliases[name].Browsers[browser.browser]) {
      browser.browser = aliases[name].Browsers[browser.browser]
    }
    if(aliases[name]['Operating Systems'][browser.os]) {
      browser.os = aliases[name]['Operating Systems'][browser.os]
    }
    this.browser = browser
    ci(capabilities)
    this.capabilities = capabilities
    this.retries = retries
  }

  run(platform) {
    this.platform = platform
    return this.platform.run(this.url, this.browser, this.capabilities)
    .then(result => {
      this.runId = result.id
      this.status = 'started'
      this.checker = setInterval(() => { this.monitor() }, 30000)
      return this
    })
  }

  monitor() {
    if('stopped' === this.status) {
      clearInterval(this.checker)
      this.checker = null
      return
    }
    this.platform.status(this.runId)
    .then(results => {
      if('stopped' === results.status && !this._checkFirstStop()) {
        return this._onNoReports()
      }
      return Promise.resolve(true)
    })
  }

  stop(takeScreenshot) {
    return this.platform.stop(this.runId, takeScreenshot)
    .then(() => {
      this.status = 'stopped'
      return true
    })
    .catch(err => {
      log.warn('stopping test failed with %s, ignoring...', err)
      this.status = 'stopped'
      return true
    })
  }

  static checkUrl(req) {
    return (req.query.cbtr_run && req.query.cbtr_test)
  }

  static runParam(req) {
    return req.query.cbtr_run
  }

  static testParam(req) {
    return req.query.cbtr_test
  }

  _checkFirstStop() {
    if(!this.gotStoppedOnce) {
      this.gotStoppedOnce = true
      clearInterval(this.checker)
      this.checker = setInterval(() => { this.monitor() }, 5000)
      return true
    }
    return false
  }

  _onNoReports() {
    clearInterval(this.checker)
    this.checker = null
    console.log(coreUtils.COLORS.FAIL + 'browser %s %s %s %s for url %s did not respond with results', this.browser.browser, this.browser.browserVersion || this.browser.device, this.browser.os, this.browser.osVersion, this.url, coreUtils.COLORS.RESET, '\n')
    if(this.retries) {
      log.debug('test %s has %d retries left, retrying..', this.id, this.retries)
      --this.retries
      return this.run(this.platform)
    }
    else {
      this.status = 'stopped'
      return Promise.resolve(true)
    }
  }
}

function ci(capabilities) {
  try {
    let Ci = CiFactory.get()
    capabilities.project = Ci.project
    capabilities.test = Ci.session
    capabilities.build = Ci.commit
  }
  catch(err) {
    capabilities.project = 'anonymous/anonymous'
    capabilities.test = uuidv4()
    capabilities.build = 'unknown build'
  }
}

exports.Test = Test
