'use strict'

let
  path = require('path'),
  Test = require('./test').Test

class SeleniumTest extends Test {

  constructor(name, host, testFile, run, browser, capabilities, scriptFile) {
    super(name, testFile, run, browser, capabilities, 0)
    this.url = host + '/' + testFile.replace(/^\//, '')
    /* eslint-disable global-require */
    let script = require(path.resolve(process.cwd(), scriptFile))
    /* eslint-enable global-require */
    this.script = script.script
    this.decider = script.decider
  }

  runFunction() {
    return this.platform.runScript(this.url, this.browser, this.capabilities, this.script, this.decider)
  }

  monitor() {
    this.platform.status(this.runId)
    .then(results => {
      if('stopped' === results.status) {
        clearInterval(this.checker)
        this.checker = null
        this.status = 'stopped'
      }
      return Promise.resolve(true)
    })
  }
}

exports.SeleniumTest = SeleniumTest
