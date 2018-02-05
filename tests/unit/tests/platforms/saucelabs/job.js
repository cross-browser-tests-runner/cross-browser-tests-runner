'use strict';

var
  chai = require('chai'),
  Bluebird = require('bluebird'),
  job = require('./../../../../../lib/platforms/saucelabs/job'),
  Job = job.Job,
  JobVars = job.JobVars,
  utils = require('./utils')

var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
var
  expect = chai.expect,
  should = chai.should()

describe('Job', function() {

  describe('create', function() {

    var job
    this.timeout(0)

    it('should fail to create a test job if no capabilities are provided', function() {
      return Job.create('http://google.com')
      .should.be.rejectedWith('Whoops, seems like we messed up!')
    })

    it('should fail to create a test job with undefined platform, browserName and version capabilities provided', function() {
      return Job.create('http://piaxis.tech', {
        platform: undefined,
        browserName: undefined,
        version: undefined
      })
      .should.be.rejectedWith('Whoops, seems like we messed up!')
    })

    it('should fail to create a test job if an empty url is provided', function() {
      return Job.create('')
      .should.be.rejectedWith("Parameter 'url' must be provided")
    })

    it('should fail to create a test job if unsupported platform is provided', function() {
      return Job.create('http://google.com', {
        platform: 'OS X ABC',
        browserName: 'chrome',
        version: '43.0'
      })
      .then(job => {
        return utils.waitUntilRunningRetries(job)
      })
      .should.be.rejectedWith('job could not be created due to bad input, response is {"completed":false,"js tests":[{"status":"test error","platform":["OS X ABC","chrome","43.0"],')
    })

    it('should fail to create a test job if unsupported browserName is provided', function() {
      return Job.create('http://piaxis.tech', {
        platform : 'Windows 10',
        browserName: 'abc',
        version: '40.0'
      })
      .then(job => {
        return utils.waitUntilRunningRetries(job)
      })
      .should.be.rejectedWith('job could not be created due to bad input, response is {"completed":false,"js tests":[{"status":"test error","platform":["Windows 10","abc","40.0"],')
    })

    it('should fail to create a test job if unsupported browser version is provided', function() {
      return Job.create('http://www.piaxis.tech', {
        platform : 'Windows 10',
        browserName: 'chrome',
        version: '1.0'
      })
      .then(job => {
        return utils.waitUntilRunningRetries(job)
      })
      .should.be.rejectedWith('job could not be created due to bad input, response is {"completed":false,"js tests":[{"status":"test error","platform":["Windows 10","chrome","1.0"],')
    })

    it('should fail to create a test job if platform is not provided', function() {
      return Job.create('http://www.piaxis.tech', {
        browserName : 'chrome',
        version: '40.0'
      })
      .should.be.rejectedWith('Whoops, seems like we messed up!')
    })

    it('should fail to create a test job if browserName is not provided', function() {
      return Job.create('http://www.piaxis.tech',{
        platform: 'Windows 8',
        version: '40.0'
      })
      .should.be.rejectedWith('Whoops, seems like we messed up!')
    })

    it('should create a test job if a remote url and valid values for all mandatory parameters are provided', function() {
      var build = utils.buildDetails()
      return Job.create('http://www.piaxis.tech',{
        platform: 'OS X 10.11',
        browserName: 'chrome',
        version : '41.0'
      }, {
        build: build.build,
        customData: { project: build.project },
        name: build.name
      })
      .then(job => {
        expect(job.id).to.not.be.undefined
        expect(job.jsTestId).to.not.be.undefined
        return utils.safeKillJob(job)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should create a test job if a remote url and valid values for all mandatory parameters are provided with browser being an android emulator', function() {
      var build = utils.buildDetails()
      return Job.create('http://www.piaxis.tech',{
        platform: 'Linux',
        browserName: 'android',
        version : '4.4'
      }, {
        build: build.build,
        customData: { project: build.project },
        name: build.name
      })
      .then(job => {
        expect(job.id).to.not.be.undefined
        expect(job.jsTestId).to.not.be.undefined
        return utils.safeKillJob(job)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should create a test job if a remote url and valid values for all mandatory parameters are provided with browser being an iphone simulator', function() {
      var build = utils.buildDetails()
      return Job.create('http://www.piaxis.tech',{
        platform: 'OS X 10.12',
        browserName: 'iphone',
        version : '10.3'
      }, {
        build: build.build,
        customData: { project: build.project },
        name: build.name
      })
      .then(job => {
        expect(job.id).to.not.be.undefined
        expect(job.jsTestId).to.not.be.undefined
        return utils.safeKillJob(job)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should create a test job if a local url and valid values for all mandatory parameters are provided', function() {
      var build = utils.buildDetails()
      return Job.create('http://127.0.0.1:3000/tests/pages/tests.html', {
        platform: 'OS X 10.11',
        browserName: 'chrome',
        version : '41.0'
      }, {
        framework: 'custom',
        build: build.build,
        customData: { project: build.project },
        name: build.name
      })
      .then(job => {
        expect(job.id).to.not.be.undefined
        expect(job.jsTestId).to.not.be.undefined
        return utils.safeKillJob(job)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should create a test job if a local url, valid values for all mandatory parameters, and few optional capabilities are provided', function() {
      var build = utils.buildDetails()
      return Job.create('http://127.0.0.1:3000/tests/pages/tests.html', {
        platform: 'OS X 10.11',
        browserName: 'chrome',
        version : '41.0'
      }, {
        framework: 'jasmine',
        build: build.build,
        customData: { project: build.project },
        name: build.name,
        recordVideo: false,
        recordScreenshots: false,
        recordLogs: false,
        captureHtml: true,
        priority: 0
      })
      .then(job => {
        expect(job.id).to.not.be.undefined
        expect(job.jsTestId).to.not.be.undefined
        return utils.safeKillJob(job)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should create a test job for native runner case if a local url and valid values for all mandatory parameters are provided', function() {
      var build = utils.buildDetails()
      return Job.create('http://127.0.0.1:3000/tests/pages/tests.html', {
        platform: 'OS X 10.11',
        browserName: 'chrome',
        version : '41.0'
      }, {
        build: build.build,
        customData: { project: build.project },
        name: build.name
      },
      'some-run-id',
      true)
      .then(job => {
        expect(job.id).to.not.be.undefined
        expect(job.jsTestId).to.not.be.undefined
        return utils.safeKillJob(job)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  })

  describe('createMultiple', function() {

    this.timeout(0)

    it('should fail to create test jobs if no browsers are provided', function() {
      expect(()=>{Job.createMultiple('http://google.com', [ ])}).to.throw('no browsers specified for createMultiple')
    })

    it('should fail to create test jobs if no capabilities are provided', function() {
      return Job.createMultiple('http://google.com', [
        { }
      ])
      .should.be.rejectedWith('Whoops, seems like we messed up!')
    })

    it('should create test jobs if a remote url and valid values for all mandatory parameters are provided', function() {
      var build = utils.buildDetails()
      return Job.createMultiple('http://www.piaxis.tech', [{
        platform: 'OS X 10.11',
        browserName: 'chrome',
        version : '41.0'
      }, {
        platform: 'Windows 10',
        browserName: 'chrome',
        version : '37.0'
      }], {
        build: build.build,
        customData: { project: build.project },
        name: build.name
      })
      .then(jobs => {
        expect(jobs.length).to.equal(2)
        expect(jobs[0].id).to.not.be.undefined
        expect(jobs[0].jsTestId).to.not.be.undefined
        expect(jobs[1].id).to.not.be.undefined
        expect(jobs[1].jsTestId).to.not.be.undefined
        let promises = [ utils.safeKillJob(jobs[0]), utils.safeKillJob(jobs[1]) ]
        return Bluebird.all(promises)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should create test jobs if a local url and valid values for all mandatory parameters are provided', function() {
      var build = utils.buildDetails()
      return Job.createMultiple('http://127.0.0.1:3000/tests/pages/tests.html', [{
        platform: 'OS X 10.11',
        browserName: 'chrome',
        version : '41.0'
      }, {
        platform: 'Windows 10',
        browserName: 'chrome',
        version : '37.0'
      }], {
        build: build.build,
        customData: { project: build.project },
        name: build.name
      })
      .then(jobs => {
        expect(jobs.length).to.equal(2)
        expect(jobs[0].id).to.not.be.undefined
        expect(jobs[0].jsTestId).to.not.be.undefined
        expect(jobs[1].id).to.not.be.undefined
        expect(jobs[1].jsTestId).to.not.be.undefined
        let promises = [ utils.safeKillJob(jobs[0]), utils.safeKillJob(jobs[1]) ]
        return Bluebird.all(promises)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  })

  describe('status', function() {

    var job
    this.timeout(0)

    it('should say "running" for a running test job', function() {
      var build = utils.buildDetails()
      return Job.create('http://www.piaxis.tech', {
        platform: 'OS X 10.11',
        browserName: 'chrome',
        version : '41.0'
      }, {
        build: build.build,
        customData: { project: build.project },
        name: build.name
      })
      .then(j => {
        job = j
        return job.status()
      })
      .then(status => {
        if('stopped' === status) {
          utils.log.info('did not expect the job to get done so soon')
        }
        else {
          expect(status).to.be.oneOf(['running', 'queue'])
        }
        return utils.safeKillJob(job)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should say "stopped" for a test job with an invalid js-test id', function() {
      var build = utils.buildDetails(), saveId, saveJsTestId
      return Job.create('http://www.piaxis.tech', {
        platform: 'OS X 10.11',
        browserName: 'chrome',
        version : '41.0'
      }, {
        build: build.build,
        customData: { project: build.project },
        name: build.name
      })
      .then(j => {
        job = j
        saveId = job.id
        saveJsTestId = job.jsTestId
        job.id = null // force js test status api
        job.jsTestId = 'XXXXXXXX'
        return job.status()
      })
      .then(status => {
        expect(status).to.equal('stopped')
        job.id = saveId
        job.jsTestId = saveJsTestId
        return utils.safeKillJob(job)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should say "stopped" for a test job with an invalid id', function() {
      var build = utils.buildDetails(), saveId, saveJsTestId
      return Job.create('http://www.piaxis.tech', {
        platform: 'OS X 10.11',
        browserName: 'chrome',
        version : '41.0'
      }, {
        build: build.build,
        customData: { project: build.project },
        name: build.name
      })
      .then(j => {
        job = j
        saveId = job.id
        job.setId('XXXXXXXX') // force lookup through job id
        return job.status()
      })
      .then(status => {
        expect(status).to.equal('stopped')
        job.setId(saveId)
        return utils.safeKillJob(job)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  })

  describe('stop', function() {

    var job
    this.timeout(0)

    it('should successfully stop a running test job', function() {
      var build = utils.buildDetails()
      return Job.create('http://www.piaxis.tech', {
        platform: 'OS X 10.11',
        browserName: 'chrome',
        version : '41.0'
      }, {
        build: build.build,
        customData: { project: build.project },
        name: build.name
      })
      .then(job => {
        return job.stop()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should successfully stop a test job running on android emulator', function() {
      var build = utils.buildDetails()
      return Job.create('http://www.piaxis.tech', {
        platform: 'Linux',
        browserName: 'android',
        version : '4.4'
      }, {
        build: build.build,
        customData: { project: build.project },
        name: build.name
      })
      .then(job => {
        return job.stop()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should silently complete if called for an already stopped test job', function() {
      var build = utils.buildDetails()
      return Job.create('http://www.piaxis.tech', {
        platform: 'OS X 10.11',
        browserName: 'chrome',
        version : '41.0'
      }, {
        build: build.build,
        customData: { project: build.project },
        name: build.name
      })
      .then(j => {
        job = j
        return job.stop()
      })
      .then(() => {
        return job.stop()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  })

  describe('screenshot', function() {

    this.timeout(0)

    it('should silently return without performing any operations', function() {
      var job, build = utils.buildDetails()
      return Job.create('http://www.piaxis.tech', {
        platform: 'OS X 10.11',
        browserName: 'chrome',
        version : '41.0'
      }, {
        build: build.build,
        customData: { project: build.project },
        name: build.name
      })
      .then(j => {
        job = j
        return job.screenshot()
      })
      .then(() => {
        return utils.safeKillJob(job)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  })

})
