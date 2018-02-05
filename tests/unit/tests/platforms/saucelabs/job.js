'use strict';

var
  chai = require('chai'),
  Bluebird = require('bluebird'),
  job = require('./../../../../../lib/platforms/saucelabs/job'),
  Job = job.Job,
  utils = require('./utils')

var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
var
  expect = chai.expect,
  should = chai.should()

if(process.version > 'v6') {

  describe('Job', function() {

    describe('create', function() {

      var job
      this.timeout(0)

      it('should fail to create a test job with invalid browser info provided', function() {
        expect(()=>{Job.create('http://piaxis.tech', {
          os: 'Windows',
          osVersion: '10',
          browser: 'Chrome',
          browserVersion: '1.0'
        })})
        .to.throw('invalid version "1.0" for browser "Chrome" for osVersion "10" for os "Windows"')
      })

      it('should fail to create a test job if unsupported os is provided', function() {
        expect(()=>{ Job.create('http://google.com', {
          os: 'OS X ABC',
          osVersion: 'ABC',
          browser: 'chrome',
          browserVersion: '43.0'
        })})
        .to.throw('invalid os "OS X ABC"')
      })

      it('should fail to create a test job if unsupported browser is provided', function() {
        expect(()=>{ Job.create('http://piaxis.tech', {
          os: 'Windows',
          osVersion: '10',
          browser: 'ABC',
          browserVersion: '40.0'
        })})
        .to.throw('invalid browser "ABC" for osVersion "10" for os "Windows"')
      })

      it('should fail to create a test job if unsupported browser version is provided', function() {
        expect(()=>{ Job.create('http://www.piaxis.tech', {
          os: 'Windows',
          osVersion: '10',
          browser: 'Chrome',
          browserVersion: '1.0'
        })})
        .to.throw('invalid version "1.0" for browser "Chrome" for osVersion "10" for os "Windows"')
      })

      it('should create a test job if a remote url and valid values for all mandatory parameters are provided', function() {
        var build = utils.buildDetails()
        return Job.create('http://www.piaxis.tech',{
          os: 'OS X',
          osVersion: 'El Capitan',
          browser: 'Chrome',
          browserVersion: '41.0'
        }, {
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

      it('should create a test job if a remote url and valid values for all mandatory parameters are provided with browser being an android emulator', function() {
        var build = utils.buildDetails()
        return Job.create('http://www.piaxis.tech',{
          os: 'Android',
          osVersion: '4.4',
          browser: 'Android Browser',
          browserVersion: null,
          device: "Samsung Galaxy Nexus Emulator"
        }, {
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

      it('should create a test job if a remote url and valid values for all mandatory parameters are provided with browser being an iphone simulator', function() {
        var build = utils.buildDetails()
        return Job.create('http://www.piaxis.tech',{
          os: 'iOS',
          osVersion: '10.3',
          browser: 'Mobile Safari',
          browserVersion: null,
          device: "iPhone 6s Plus Simulator"
        }, {
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

      it('should create a test job if a local url and valid values for all mandatory parameters are provided', function() {
        var build = utils.buildDetails()
        return Job.create('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
          os: 'Windows',
          osVersion: '8.1',
          browser: 'Firefox',
          browserVersion: '38.0'
        }, {
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

      it('should create a test job if a local url, valid values for all mandatory parameters, and few optional capabilities are provided', function() {
        var build = utils.buildDetails()
        return Job.create('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
          os: 'OS X',
          osVersion: 'Yosemite',
          browser: 'Chrome',
          browserVersion: '41.0'
        }, {
          build: build.build,
          project: build.project,
          test: build.test,
          video: true,
          screenshots: false,
          captureLogs: false,
          captureHtml: true,
          priority: 0
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

      it('should create a test job for native runner case if a local url and valid values for all mandatory parameters are provided', function() {
        var build = utils.buildDetails()
        return Job.create('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
          os: 'OS X',
          osVersion: 'Yosemite',
          browser: 'Firefox',
          browserVersion: '42.0'
        }, {
          build: build.build,
          project: build.project,
          test: build.test
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

      it('should fail to create test jobs if no browsers are provided', function() {
        expect(()=>{Job.createMultiple('http://google.com', [ ])}).to.throw('no browsers specified for createMultiple')
      })

      it('should throw an error if required keys are not provided', function() {
        expect(()=>{return Job.createMultiple('http://google.com', [
          undefined
        ])})
        .to.throw('required option browser missing')
      })

      it('should create test jobs if a remote url and valid values for all mandatory parameters are provided', function() {
        var build = utils.buildDetails()
        return Job.createMultiple('http://www.piaxis.tech', [{
          os: 'OS X',
          osVersion: 'Yosemite',
          browser: 'Chrome',
          browserVersion: '45.0'
        }, {
          os: 'Windows',
          osVersion: '7',
          browser: 'Firefox',
          browserVersion: '37.0'
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

      it('should create test jobs if a local url and valid values for all mandatory parameters are provided', function() {
        var build = utils.buildDetails()
        return Job.createMultiple('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', [{
          os: 'OS X',
          osVersion: 'El Capitan',
          browser: 'Firefox',
          browserVersion: '41.0'
        }, {
          os: 'Windows',
          osVersion: '8.1',
          browser: 'Chrome',
          browserVersion: '37.0'
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

    })

    describe('status', function() {

      var job
      this.timeout(0)

      it('should say "running" for a running test job', function() {
        var build = utils.buildDetails()
        return Job.create('http://www.piaxis.tech', {
          os: 'Windows',
          osVersion: '7',
          browser: 'Chrome',
          browserVersion: '35.0'
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

      it('should say "stopped" for a stopped test job', function() {
        var build = utils.buildDetails()
        return Job.create('http://www.piaxis.tech', {
          os: 'Windows',
          osVersion: '7',
          browser: 'Chrome',
          browserVersion: '35.0'
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
          return true
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
          os: 'Windows',
          osVersion: '10',
          browser: 'Firefox',
          browserVersion: '43.0'
        }, {
          build: build.build,
          project: build.project,
          test: build.test
        })
        .then(j => {
          job = j
          saveId = job.scriptJob.session
          job.scriptJob.session = 'XXXXXXXX'
          return job.status()
        })
        .then(status => {
          expect(status).to.equal('stopped')
          job.scriptJob.session = saveId
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

      it('should successfully stop a running test job and set passed status', function() {
        var build = utils.buildDetails()
        return Job.create('http://www.piaxis.tech', {
          os: 'OS X',
          osVersion: 'El Capitan',
          browser: 'Chrome',
          browserVersion: '47.0'
        }, {
          build: build.build,
          project: build.project,
          test: build.test
        })
        .then(job => {
          return job.stop(true)
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should successfully stop a test job running on android emulator and marked failed status', function() {
        var build = utils.buildDetails()
        return Job.create('http://www.piaxis.tech', {
          os: 'Android',
          osVersion: '4.4',
          browser: 'Android Browser',
          browserVersion: null,
          device: "Samsung Galaxy Nexus Emulator"
        }, {
          build: build.build,
          project: build.project,
          test: build.test
        })
        .then(job => {
          return job.stop(false)
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
          os: 'OS X',
          osVersion: 'Sierra',
          browser: 'Firefox',
          browserVersion: '48.0'
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
          return job.stop(true)
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
          os: 'OS X',
          osVersion: 'Mavericks',
          browser: 'Chrome',
          browserVersion: '35.0'
        }, {
          build: build.build,
          project: build.project,
          test: build.test
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

}
