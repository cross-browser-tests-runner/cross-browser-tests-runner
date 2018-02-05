'use strict';

var
  chai = require('chai'),
  Bluebird = require('bluebird'),
  Tunnel = require('./../../../../../lib/platforms/crossbrowsertesting/tunnel').Tunnel,
  job = require('./../../../../../lib/platforms/crossbrowsertesting/job'),
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

    it('should throw an error if required input is not provided', function() {
      expect(()=>{Job.create('')}).to.throw('required option browser missing')
    })

    it('should fail to create a job if the url to open is empty', function() {
      return Job.create('', {
        os: 'Windows',
        osVersion : '10',
        browser: 'Firefox',
        browserVersion: '44.0'
      })
      .should.be.rejectedWith('{"status":500,"message":"Url parameter was empty or missing"}')
    })

    it('should fail to create a job if unsupported os is provided', function() {
      expect(()=>{Job.create('http://google.com', {
        os: 'Linux',
        osVersion : '10',
        browser: 'Firefox',
        browserVersion: '44.0'
      })})
      .to.throw('invalid os "Linux"')
    })

    it('should fail to create a job if unsupported os version is provided', function() {
      expect(()=>{Job.create('http://google.com', {
        os: 'Windows',
        osVersion : '6',
        browser: 'Firefox',
        browserVersion: '44.0'
      })})
      .to.throw('invalid osVersion "6" for os "Windows"')
    })

    it('should fail to create a job if unsupported browser is provided', function() {
      expect(()=>{Job.create('http://google.com', {
        os: 'Windows',
        osVersion : '10',
        browser: 'ABC',
        browserVersion: '45.0'
      })})
      .to.throw('invalid browser "ABC" for osVersion "10" for os "Windows"')
    })

    it('should fail to create a job if unsupported browser version is provided', function() {
      expect(()=>{Job.create('http://www.piaxis.tech',{
        os: 'Windows',
        osVersion : '10',
        browser : 'Chrome',
        browserVersion : '10.0'
      })})
      .to.throw('invalid version "10.0" for browser "Chrome" for osVersion "10" for os "Windows"')
    })

    it('should fail to create a local url job if a non-existent tunnel is provided', function() {
      var build = utils.buildDetails()
      return Job.create('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
        os: 'Windows',
        osVersion : '10',
        browser : 'Firefox',
        browserVersion : '44.0',
        resolution: '1600x1200'
      }, {
        timeout: 60,
        video: true,
        local: true,
        localIdentifier: 'my-tunnel',
        build: build.build,
        project: build.project,
        test: build.test
      })
      .should.be.rejectedWith('The named tunnel you have specified does not appear to exist')
    })

    it('should create a remote url test job if valid values are provided for all mandatory capabilities', function() {
      var build = utils.buildDetails()
      return Job.create('http://www.google.com',{
        os: 'Windows',
        osVersion : '10',
        browser : 'Firefox',
        browserVersion : '44.0',
        resolution: '1600x1200'
      }, {
        timeout: 60,
        video: true,
        build: build.build,
        project: build.project,
        test: build.test
      })
      .then(job => {
        expect(job.id).to.not.be.undefined
        return utils.safeKillJob(job)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should create a local url test job if valid values are provided for all mandatory capabilities', function() {
      var build = utils.buildDetails()
      return Job.create('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
        os: 'OS X',
        osVersion : 'Sierra',
        browser : 'Chrome x64',
        browserVersion : '55.0'
      }, {
        build: build.build,
        project: build.project,
        test: build.test,
        local: true
      })
      .then(job => {
        expect(job.id).to.not.be.undefined
        return utils.safeKillJob(job)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should create a local url test job when optional capabilities are provided along with valid values for all mandatory capabilities', function() {
      var build = utils.buildDetails()
      return Job.create('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
        os: 'Ubuntu',
        osVersion : 'Vivid',
        browser : 'Chromium',
        browserVersion : '43.0'
      }, {
        build: build.build,
        project: build.project,
        test: build.test,
        local: true,
        video: true,
        captureNetwork: true
      })
      .then(job => {
        expect(job.id).to.not.be.undefined
        return utils.safeKillJob(job)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should create a local url test job when an existing named tunnel is provided', function() {
      var build = utils.buildDetails(), tunnel = new Tunnel({ tunnelname: 'my-tunnel'})
      return tunnel.start()
      .then(() => {
        return Job.create('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
          os: 'Windows',
          osVersion : '8.1',
          browser : 'Chrome x64',
          browserVersion : '51.0'
        }, {
          build: build.build,
          project: build.project,
          test: build.test,
          local: true,
          localIdentifier: 'my-tunnel',
          video: true,
          captureNetwork: true
        })
      })
      .then(job => {
        expect(job.id).to.not.be.undefined
        return utils.safeKillJob(job)
      })
      .then(() => {
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should create a local url test job for native runner case with valid values for all mandatory capabilities and few optional capabilities are provided', function() {
      var build = utils.buildDetails()
      return Job.create('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
        os: 'OS X',
        osVersion : 'Mountain Lion',
        browser : 'Camino',
        browserVersion : '2.1'
      }, {
        build: build.build,
        project: build.project,
        test: build.test,
        local: true,
        video: true,
        captureNetwork: true
      },
      'some-run-id',
      true)
      .then(job => {
        expect(job.id).to.not.be.undefined
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

    it('should throw error if no browsers are input', function() {
      expect(()=>{Job.createMultiple('http://google.com', [ ])}).to.throw('no browsers specified for createMultiple')
    })

    it('should throw an error if required keys are not provided', function() {
      expect(()=>{return Job.createMultiple('http://google.com', [
        undefined
      ])})
      .to.throw('required option browser missing')
    })

    it('should create multiple test jobs for a valid remote url with valid values for all mandatory capabilities provided', function() {
      var build = utils.buildDetails()
      return Job.createMultiple('http://www.piaxis.tech', [{
        os: 'OS X',
        osVersion : 'Mavericks',
        browser : 'Safari',
        browserVersion : '7.0'
      }, {
        os: 'Windows',
        osVersion : '8.1',
        browser : 'Opera',
        browserVersion : '29.0'
      }], {
        build: build.build,
        project: build.project,
        test: build.test
      })
      .then(jobs => {
        expect(jobs.length).to.equal(2)
        expect(jobs[0].id).to.not.be.undefined
        expect(jobs[1].id).to.not.be.undefined
        let promises = [ utils.safeKillJob(jobs[0]), utils.safeKillJob(jobs[1]) ]
        return Bluebird.all(promises)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should create multiple test jobs for a valid local url with valid values for all mandatory capabilities provided', function() {
      var build = utils.buildDetails()
      return Job.createMultiple('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', [{
        os: 'OS X',
        osVersion : 'Yosemite',
        browser : 'Opera',
        browserVersion : '30.0'
      }, {
        os: 'Windows',
        osVersion : '10',
        browser : 'Firefox',
        browserVersion : '56.0'
      }], {
        build: build.build,
        project: build.project,
        test: build.test
      })
      .then(jobs => {
        expect(jobs.length).to.equal(2)
        expect(jobs[0].id).to.not.be.undefined
        expect(jobs[1].id).to.not.be.undefined
        let promises = [ utils.safeKillJob(jobs[0]), utils.safeKillJob(jobs[1]) ]
        return Bluebird.all(promises)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should create multiple test jobs for native runner case with a local url including query params and valid values for all mandatory capabilities provided', function() {
      var build = utils.buildDetails()
      return Job.createMultiple('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html?_=89141414', [{
        os: 'Ubuntu',
        osVersion : 'Trusty',
        browser : 'Firefox',
        browserVersion : '30.0'
      }, {
        os: 'OS X',
        osVersion : 'El Capitan',
        browser : 'Safari',
        browserVersion : '9.0'
      }], {
        build: build.build,
        project: build.project,
        test: build.test
      },
      'some-mult-run-id',
      true)
      .then(jobs => {
        expect(jobs.length).to.equal(2)
        expect(jobs[0].id).to.not.be.undefined
        expect(jobs[1].id).to.not.be.undefined
        let promises = [ utils.safeKillJob(jobs[0]), utils.safeKillJob(jobs[1]) ]
        return Bluebird.all(promises)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should tolerate failure of jobs and return them as failed', function() {
      var build = utils.buildDetails()
      return Job.createMultiple('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', [{
        os: 'OS X',
        osVersion : 'El Capitan',
        browser : 'Opera',
        browserVersion : '35.0'
      }, {
        os: 'Windows',
        osVersion : '8.1',
        browser : 'Chrome',
        browserVersion : '49.0'
      }], {
        build: build.build,
        project: build.project,
        test: build.test,
        local: true,
        localIdentifier: 'non-existent-tunnel'
      })
      .then(jobs => {
        expect(jobs.length).to.equal(2)
        expect(jobs[0].id).to.be.undefined
        expect(jobs[0].failed).to.be.true
        expect(jobs[1].id).to.be.undefined
        expect(jobs[1].failed).to.be.true
        return true
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
        os: 'Windows',
        osVersion : '10',
        browser : 'Chrome',
        browserVersion : '62.0'
      }, {
        build: build.build,
        project: build.project,
        test: build.test
      })
      .then(j => {
        job = j
        return job.status()
      })
      .then(status => {
        expect(status).to.equal('running')
        return utils.safeKillJob(job)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should say "stopped" for a stopped job', function() {
      var build = utils.buildDetails(), saveId
      return Job.create('http://www.piaxis.tech', {
        os: 'Windows',
        osVersion : '8.1',
        browser : 'Firefox',
        browserVersion : '53.0'
      }, {
        build: build.build,
        project: build.project,
        test: build.test
      })
      .then(j => {
        job = j
        return utils.safeKillJob(job)
      })
      .then(() => {
        return job.status()
      })
      .then(status => {
        expect(status).to.equal('stopped')
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
        os: 'OS X',
        osVersion : 'Mountain Lion',
        browser : 'Firefox',
        browserVersion : '37.0'
      }, {
        build: build.build,
        project: build.project,
        test: build.test
      })
      .then(j => {
        job = j
        return job.stop(true)
      })
      .then(() => {
        return job.status()
      })
      .then(status => {
        expect(status).to.equal('stopped')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should tolerate when called for a job that is stopped already, and return silently', function() {
      var build = utils.buildDetails()
      return Job.create('http://www.piaxis.tech', {
        os: 'Ubuntu',
        osVersion : 'Oneiric',
        browser : 'Firefox',
        browserVersion : '20.0'
      }, {
        build: build.build,
        project: build.project,
        test: build.test
      })
      .then(j => {
        job = j
        return job.stop(false)
      })
      .then(() => {
        return job.stop(false)
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

    it('should create a screenshot for a valid running job', function() {
      var job
      var build = utils.buildDetails()
      return Job.create('http://www.piaxis.tech', {
        os: 'OS X',
        osVersion : 'High Sierra',
        browser : 'Chrome x64',
        browserVersion : '62.0'
      }, {
        build: build.build,
        project: build.project,
        test: build.test
      })
      .then(j => {
        job = j
        return job.screenshot()
      })
      .then(url => {
        expect(url).to.match(/https:\/\/app\.crossbrowsertesting\.com\/livetests\//)
        expect(url).to.match(/\/snapshots\//)
        return utils.safeKillJob(job)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail for an invalid job (chracterized by an invalid job id)', function() {
      var job, saveId
      var build = utils.buildDetails()
      return Job.create('http://www.piaxis.tech', {
        os: 'Windows',
        osVersion : '8 Preview',
        browser : 'Internet Explorer',
        browserVersion : '10.0'
      }, {
        build: build.build,
        project: build.project,
        test: build.test
      })
      .then(j => {
        job = j
        saveId = job.id
        job.id = 'xxxxxxxxxxxx'
        return job.screenshot()
      })
      .catch(err => {
        if(err.message && err.message.match(/{"status":404,"message":"Not found!"}/)) {
          utils.log.debug('taking screenshot failed expectedly for invalid job - %s', err)
          return true
        }
        utils.log.error('error: ', err)
        throw err
      })
      .then(() => {
        job.id = saveId
        return utils.safeKillJob(job)
      })
      .should.be.fulfilled
    })

    it('should fail for a job that is stopped already', function() {
      var job
      var build = utils.buildDetails()
      return Job.create('http://www.piaxis.tech', {
        os: 'Windows',
        osVersion : '10',
        browser : 'Firefox',
        browserVersion : '44.0'
      }, {
        build: build.build,
        project: build.project,
        test: build.test
      })
      .then(j => {
        job = j
        return job.stop()
      })
      .then(() => {
        return job.screenshot()
      })
      .catch(err => {
        if(err.message && err.message.match(/{"status":404,"message":"Not found!"}/)) {
          utils.log.debug('taking screenshot failed expectedly for invalid job - %s', err)
          return true
        }
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  })

})
