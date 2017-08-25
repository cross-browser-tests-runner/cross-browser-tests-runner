'use strict'

let
  Bluebird = require('bluebird'),
  Log = require('./../../core/log').Log,
  webdriver = null

if(process.version > 'v6') {
  /* eslint-disable global-require */
  webdriver = require('selenium-webdriver')
  /* eslint-enable global-require */
}

let
  log = new Log('Platforms.WebDriver')

class WebDriver {

  constructor(server, url, options) {
    this.server = server
    this.url = url
    this.options = options
    this.wd = webdriver
  }

  create() {
    var startTime = (new Date()).getTime()
    var driver = new webdriver.Builder()
    .usingServer(this.server)
    .withCapabilities(this.options)
    .build()
    var endTime = (new Date()).getTime()
    if((endTime - startTime) > 40000) {
      log.warn('it took %d seconds to create the session', parseInt((endTime - startTime)/1000, 10))
    }
    startTime = endTime
    return driver
    .then(() => {
      endTime = (new Date()).getTime()
      if((endTime - startTime) > 40000) {
        log.warn('it took %d seconds to resolve session thenable', parseInt((endTime - startTime)/1000, 10))
      }
      startTime = endTime
      this.driver = driver
      return driver.getSession()
    })
    .then(session => {
      endTime = (new Date()).getTime()
      if((endTime - startTime) > 40000) {
        log.warn('it took %d seconds to get session id', parseInt((endTime - startTime)/1000, 10))
      }
      startTime = endTime
      this.session = session.getId()
      log.debug('webdriver session id %s', this.session)
      return Bluebird.resolve(true)
    })
  }

  run(script) {
    if(!this.driver) {
      throw new Error('Platforms.Core.WebDriver: Driver not created yet')
    }
    return this.driver.get(this.url)
    .then(() => {
      log.info('opened url "%s" for script', this.url)
      return script(this.driver, this.wd)
    })
  }

  close() {
    if(this.driver) {
      log.debug('closing session %s and quitting', this.session)
      return this.driver.quit()
    }
    else {
      return Bluebird.resolve(true)
    }
  }

}

exports.WebDriver = WebDriver
