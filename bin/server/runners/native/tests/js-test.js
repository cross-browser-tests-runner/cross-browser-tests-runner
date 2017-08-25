'use strict'

let
  Log = require('./../../../../../lib/core/log').Log,
  log = new Log('Server.Runners.Native.Tests.JsTest'),
  coreUtils = require('./../../../../../lib/core/utils'),
  Test = require('./test').Test

class JsTest extends Test {

  constructor(name, host, testFile, run, browser, capabilities, retries) {
    super(name, testFile, run, browser, capabilities, retries)
    this.url = host + '/' + testFile.replace(/^\//, '') + '?cbtr_run=' + run + '&cbtr_test=' + this.id
  }

  runFunction() {
    return this.platform.run(this.url, this.browser, this.capabilities)
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

exports.JsTest = JsTest
