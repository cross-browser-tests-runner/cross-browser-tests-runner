'use strict';

var
  chai = require('chai'),
  WebDriver = require('./../../../../../lib/platforms/core/webdriver').WebDriver,
  coreUtils = require('./../../core/utils')

var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
var
  expect = chai.expect,
  should = chai.should()

const
  SERVER = 'http://hub-cloud.browserstack.com/wd/hub',
  USERNAME = process.env.BROWSERSTACK_USERNAME,
  ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY,
  script = (driver, webdriver) => {
    return driver.getTitle()
    .then(function(title) {
      coreUtils.log.debug(title)
      return true
    })
  }

describe('create', function() {

  this.timeout(0)

  it('should fail in case of no capabilities', function() {
    var webDriver = new WebDriver(SERVER, 'http://google.com')
    expect(function(){
      return webDriver.create()
    }).to.throw('Target browser must be a string, but is \<undefined\>; did you forget to call forBrowser\(\)\?')
  })

  it('should fail with a bad server with just browser name specified', function() {
    var webDriver = new WebDriver('http://google.com', 'http://google.com', {
      browserName: 'Chrome'
    })
    return webDriver.create()
    .should.be.rejectedWith(Error)
  })

  it('should fail without authorization with just browser name specified', function() {
    var webDriver = new WebDriver(SERVER, 'http://google.com', {
      browserName: 'Chrome'
    })
    return webDriver.create()
    .should.be.rejectedWith('Authorization required')
  })

  it('should fail with bad authorization with a browser name specified', function() {
    var webDriver = new WebDriver(SERVER, 'http://google.com', {
      browserName: 'Chrome',
      'browserstack.user': 'abc',
      'browserstack.key': 'abc'
    })
    return webDriver.create()
    .should.be.rejectedWith('Invalid username or password')
  })

  it('should fail with valid authorization and an invalid browser name specified', function() {
    var webDriver = new WebDriver(SERVER, 'http://google.com', {
      browserName: 'SomeBrowser',
      'browserstack.user': USERNAME,
      'browserstack.key': ACCESS_KEY
    })
    return webDriver.create()
    .should.be.rejectedWith('OS/Browser combination invalid')
  })

  it('should fail with valid authorization, valid browser name, and unsupported browser version specified', function() {
    var webDriver = new WebDriver(SERVER, 'http://google.com', {
      browserName: 'Chrome',
      browser_version: '1.0',
      'browserstack.user': USERNAME,
      'browserstack.key': ACCESS_KEY
    })
    return webDriver.create()
    .should.be.rejectedWith('OS/Browser combination invalid')
  })

  it('should fail with valid authorization, valid browser name, and invalid OS details specified', function() {
    var webDriver = new WebDriver(SERVER, 'http://google.com', {
      browserName: 'Chrome',
      os: 'Linux',
      os_version: '10.0',
      'browserstack.user': USERNAME,
      'browserstack.key': ACCESS_KEY
    })
    return webDriver.create()
    .should.be.rejectedWith('OS and OS Version not supported')
  })

  it('should fail with valid authorization, valid browser, valid OS, and invalid OS version specified', function() {
    var webDriver = new WebDriver(SERVER, 'http://google.com', {
      browserName: 'Chrome',
      os: 'Windows',
      os_version: 'NT',
      'browserstack.user': USERNAME,
      'browserstack.key': ACCESS_KEY
    })
    return webDriver.create()
    .should.be.rejectedWith('OS and OS Version not supported')
  })

  it('should work with valid authorization and a browser name specified', function() {
    var build = coreUtils.buildDetails()
    var webDriver = new WebDriver(SERVER, 'http://google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browserName: 'Chrome',
      'browserstack.user': USERNAME,
      'browserstack.key': ACCESS_KEY
    })
    return webDriver.create()
    .then(() => {
      return webDriver.driver.quit()
    })
    .catch(err => {
      coreUtils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should work with valid authorization, browser name, and browser version specified', function() {
    var build = coreUtils.buildDetails()
    var webDriver = new WebDriver(SERVER, 'http://google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browserName: 'Chrome',
      browser_version: '41.0',
      'browserstack.user': USERNAME,
      'browserstack.key': ACCESS_KEY
    })
    return webDriver.create()
    .then(() => {
      return webDriver.driver.quit()
    })
    .catch(err => {
      coreUtils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should work with valid authorization, browser details, and os details specified', function() {
    var build = coreUtils.buildDetails()
    var webDriver = new WebDriver(SERVER, 'http://google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browserName: 'Chrome',
      browser_version: '41.0',
      os: 'Windows',
      os_version: '8',
      'browserstack.user': USERNAME,
      'browserstack.key': ACCESS_KEY
    })
    return webDriver.create()
    .then(() => {
      return webDriver.driver.quit()
    })
    .catch(err => {
      coreUtils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

})

describe('run', function() {

  this.timeout(0)

  it('should fail if create() was not called', function() {
    var webDriver = new WebDriver()
    expect(() => { return webDriver.run() }).to.throw('Platforms.Core.WebDriver: Driver not created yet')
  })

  it('should fail for an empty url', function() {
    var build = coreUtils.buildDetails()
    var webDriver = new WebDriver(SERVER, '', {
      build: build.build,
      name: build.name,
      project: build.project,
      browserName: 'Chrome',
      'browserstack.user': USERNAME,
      'browserstack.key': ACCESS_KEY
    })
    var error
    return webDriver.create()
    .then(() => {
      return webDriver.run(script)
    })
    .catch(err => {
      error = err
      return webDriver.driver.quit()
    }).
    then(() => {
      throw error
    })
    .should.be.rejectedWith('Cannot navigate to invalid URL')
  })

  it('should work for a valid remote url', function() {
    var build = coreUtils.buildDetails()
    var webDriver = new WebDriver(SERVER, 'http://www.google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browserName: 'Chrome',
      'browserstack.user': USERNAME,
      'browserstack.key': ACCESS_KEY
    })
    return webDriver.create()
    .then(() => {
      return webDriver.run(script)
    })
    .then(() => {
      return webDriver.driver.quit()
    })
    .catch(err => {
      coreUtils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should fail for a valid local url without local capabilities specified', function() {
    var build = coreUtils.buildDetails()
    var webDriver = new WebDriver(SERVER, 'http://localhost:3000/tests/pages/tests.html', {
      build: build.build,
      name: build.name,
      project: build.project,
      browserName: 'Chrome',
      'browserstack.user': USERNAME,
      'browserstack.key': ACCESS_KEY
    })
    var match
    return webDriver.create()
    .then(() => {
      return webDriver.run(script)
    })
    .then(() => {
      return webDriver.driver.getPageSource()
    })
    .then(source => {
      match = source.match(/localhost<\/strong> refused to connect./)
      return webDriver.driver.quit()
    })
    .then(() => {
      if(match) {
        return true
      }
      else {
        throw new Error('Did not get expected page source of failure to connect with localhost')
      }
    })
    .catch(err => {
      coreUtils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

})

describe('close', function() {

  this.timeout(0)

  it('should silently close even if create() was not called', function() {
    var webDriver = new WebDriver()
    return webDriver.close()
    .catch(err => {
      coreUtils.log.error(err)
      throw err
    })
    should.be.fulfilled
  })

  it('should close after successfully creating the session', function() {
    var build = coreUtils.buildDetails()
    var webDriver = new WebDriver(SERVER, 'http://google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browserName: 'Chrome',
      browser_version: '41.0',
      os: 'Windows',
      os_version: '8',
      'browserstack.user': USERNAME,
      'browserstack.key': ACCESS_KEY
    })
    return webDriver.create()
    .then(() => {
      return webDriver.close()
    })
    .catch(err => {
      coreUtils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should close after running the script', function() {
    var build = coreUtils.buildDetails()
    var webDriver = new WebDriver(SERVER, 'http://www.google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browserName: 'Chrome',
      'browserstack.user': USERNAME,
      'browserstack.key': ACCESS_KEY
    })
    return webDriver.create()
    .then(() => {
      return webDriver.run(script)
    })
    .then(() => {
      return webDriver.close()
    })
    .catch(err => {
      coreUtils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

})
