'use strict';

var
  chai = require('chai'),
  ScriptJob = require('./../../../../../lib/platforms/core/scriptjob').ScriptJob,
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

describe('ScriptJob', function() {

  describe('create', function() {

    this.timeout(0)

    it('should fail with a bad server and only browser name specified', function() {
      var scriptJob = new ScriptJob('http://google.com', 'http://google.com', {
        browserName: 'Chrome'
      })
      return scriptJob.create()
      .should.be.rejectedWith(Error)
    })

    it('should fail without authorization and only browser name specified', function() {
      var scriptJob = new ScriptJob(SERVER, 'http://google.com', {
        browserName: 'Chrome'
      })
      return scriptJob.create()
      .should.be.rejectedWith('Authorization required')
    })

    it('should fail with bad authorization and only a browser name specified', function() {
      var scriptJob = new ScriptJob(SERVER, 'http://google.com', {
        browserName: 'Chrome',
        'browserstack.user': 'abc',
        'browserstack.key': 'abc'
      })
      return scriptJob.create()
      .should.be.rejectedWith('Invalid username or password')
    })

  })

  describe('stop', function() {

    this.timeout(0)

    it('should silently stop even if "create()" was not called', function() {
      var scriptJob = new ScriptJob()
      return scriptJob.stop()
      .catch(err => {
        coreUtils.log.error(err)
        throw err
      })
      should.be.fulfilled
    })

    it('should work after successfully creating the session', function() {
      var build = coreUtils.buildDetails()
      var scriptJob = new ScriptJob(SERVER, 'http://google.com', {
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
      return scriptJob.create()
      .then(() => {
        return scriptJob.stop()
      })
      .catch(err => {
        coreUtils.log.error(err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should work after creating the session and running a script', function() {
      var build = coreUtils.buildDetails()
      var scriptJob = new ScriptJob(SERVER, 'http://www.google.com', {
        build: build.build,
        name: build.name,
        project: build.project,
        browserName: 'Chrome',
        'browserstack.user': USERNAME,
        'browserstack.key': ACCESS_KEY
      })
      return scriptJob.create()
      .then(() => {
        return scriptJob.run(script)
      })
      .then(() => {
        return scriptJob.stop()
      })
      .catch(err => {
        coreUtils.log.error(err)
        throw err
      })
      .should.be.fulfilled
    })

  })

})
