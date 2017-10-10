'use strict'

let
  Bluebird = require('bluebird'),
  Log = require('./../../core/log').Log,
  utils = require('./../../core/utils'),
  ScriptJobInterface = require('./../interfaces/scriptjob').ScriptJob,
  Request = require('./../../core/request').Request,
  webdriver = null

if(process.version > 'v6') {
  /* eslint-disable global-require */
  webdriver = require('selenium-webdriver')
  /* eslint-enable global-require */
}

let
  log = new Log('Platforms.Core.ScriptJob')

class ScriptJob extends ScriptJobInterface {

  constructor(server, url, options) {
    super()
    this.server = server
    this.url = url
    this.options = Object.assign({ }, options)
    this.wd = webdriver
    utils.buildParams(this.options)
  }

  create() {
    let driver = new webdriver.Builder()
    .usingServer(this.server)
    .withCapabilities(this.options)
    .build()
    log.debug('creating webdriver %s for url %s with options', this.server, this.url, this.options)
    return driver
    .then(() => {
      this.driver = driver
      return driver.getSession()
    })
    .then(session => {
      this.session = session.getId()
      log.info('created script session %s with hub %s for url %s with options', this.session, this.server, this.url, this.options)
      return Bluebird.resolve(true)
    })
  }

  run(script) {
    if(!this.driver) {
      throw new Error('Platforms.Core.ScriptJob: Driver not created yet')
    }
    return this.driver.get(this.url)
    .then(() => {
      log.info('opened url "%s" for script', this.url)
      return script(this.driver, this.wd)
    })
  }

  stop() {
    if(this.driver) {
      log.debug('closing session %s and quitting', this.session)
      return this.driver.quit()
    }
    else {
      return Bluebird.resolve(true)
    }
  }

  markStatus(decider, url, method, dataAdapter) {
    if(!this.session) {
      throw new Error('Platforms.Core.ScriptJob: session not created yet to mark')
    }
    return decide(this.driver, this.wd, decider)
    .then(status => {
      log.debug('Marking status of %s as %s', this.session, status)
      let req = new Request()
      return req.request(url, method, dataAdapter(status))
    })
  }

  screenshot() {
    if(!this.session) {
      throw new Error('Platforms.Core.ScriptJob: session not created yet to take screenshot')
    }
    log.debug('Taking screenshot for %s', this.session)
    return this.driver.takeScreenshot()
  }

  status(url, optionsCreator, statusDecider) {
    if(!this.session) {
      throw new Error('Platforms.Core.ScriptJob: session not created yet to get status')
    }
    let req = new Request()
    return req.request(url, 'GET', optionsCreator())
    .then(response => {
      log.debug('status response', response)
      return statusDecider(response)
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

exports.ScriptJob = ScriptJob
