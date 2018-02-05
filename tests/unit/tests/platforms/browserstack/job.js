'use strict';

var
  chai = require('chai'),
  Bluebird = require('bluebird'),
  job = require('./../../../../../lib/platforms/browserstack/job'),
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
      .should.be.rejectedWith('422 - {"message":"Validation Failed","errors":[{"field":"url","code":"can\'t be blank"}]}')
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

    it('should create a remote url test job if valid values are provided for all mandatory capabilities', function() {
      var build = utils.buildDetails()
      return Job.create('http://www.piaxis.tech',{
        os: 'Windows',
        osVersion : '10',
        browser : 'Chrome',
        browserVersion : '45.0'
      }, {
        timeout: 60,
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
        browser : 'Chrome',
        browserVersion : '51.0'
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
        os: 'Windows',
        osVersion : 'XP',
        browser : 'Firefox',
        browserVersion : '30.0'
      }, {
        build: build.build,
        project: build.project,
        test: build.test,
        local: true,
        screenshots: true,
        video: true
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

    it('should create a local url test job for native runner case with valid values for all mandatory capabilities and few optional capabilities are provided', function() {
      var build = utils.buildDetails()
      return Job.create('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
        os: 'OS X',
        osVersion : 'Snow Leopard',
        browser : 'Chrome',
        browserVersion : '28.0'
      }, {
        build: build.build,
        project: build.project,
        test: build.test,
        local: true,
        screenshots: true,
        video: true
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

    it('should create a local url test job for native runner case with the url ending in ? when valid values for all mandatory capabilities are provided', function() {
      var build = utils.buildDetails()
      return Job.create('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html?', {
        os: 'Windows',
        osVersion : '8.1',
        browser : 'Firefox',
        browserVersion : '42.0'
      }, {
        build: build.build,
        project: build.project,
        test: build.test,
        local: true
      },
      'some-other-run-id',
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
        os: 'Windows',
        osVersion : '10',
        browser : 'Chrome',
        browserVersion : '49.0'
      }, {
        os: 'Windows',
        osVersion : '8.1',
        browser : 'Firefox',
        browserVersion : '39.0'
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
        browser : 'Chrome',
        browserVersion : '39.0'
      }, {
        os: 'Windows',
        osVersion : '7',
        browser : 'Firefox',
        browserVersion : '33.0'
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
        os: 'Windows',
        osVersion : 'XP',
        browser : 'Firefox',
        browserVersion : '29.0'
      }, {
        os: 'OS X',
        osVersion : 'El Capitan',
        browser : 'Chrome',
        browserVersion : '47.0'
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
        browserVersion : '52.0'
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
        expect(status).to.be.oneOf(['running', 'queue'])
        return utils.safeKillJob(job)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should say "stopped" for an invalid job (chracterized by an invalid job id)', function() {
      var build = utils.buildDetails(), saveId
      return Job.create('http://www.piaxis.tech', {
        os: 'Windows',
        osVersion : '8',
        browser : 'Firefox',
        browserVersion : '43.0'
      }, {
        build: build.build,
        project: build.project,
        test: build.test
      })
      .then(j => {
        job = j
        saveId = job.id
        job.id = 'xxxxxxxxxxxx'
        job.endpoint = job.processed.settings.host + JobVars.jobApiEndpoint + '/' + job.id
        return job.status()
      })
      .then(status => {
        expect(status).to.equal('stopped')
        job.id = saveId
        job.endpoint = job.processed.settings.host + JobVars.jobApiEndpoint + '/' + job.id
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
        os: 'OS X',
        osVersion : 'Lion',
        browser : 'Firefox',
        browserVersion : '37.0'
      }, {
        build: build.build,
        project: build.project,
        test: build.test
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

    it('should tolerate when called for a job that is stopped already, and return silently', function() {
      var build = utils.buildDetails()
      return Job.create('http://www.piaxis.tech', {
        os: 'OS X',
        osVersion : 'Mountain Lion',
        browser : 'Chrome',
        browserVersion : '39.0'
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

    it('should create a screenshot for a valid running job', function() {
      var job
      var build = utils.buildDetails()
      return Job.create('http://www.piaxis.tech', {
        os: 'OS X',
        osVersion : 'Snow Leopard',
        browser : 'Chrome',
        browserVersion : '28.0'
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
        expect(url).to.contain('https://s3.amazonaws.com/testautomation')
        expect(url).to.contain('js-screenshot')
        expect(url).to.contain('.png')
      })
      .catch(err => {
        if(err.message && err.message.match(/Terminal not alloted yet, cannot process screenshot at the moment/)) {
          return true
        }
        utils.log.error('error: ', err)
        throw err
      })
      .then(() => {
        return utils.safeKillJob(job)
      })
      .should.be.fulfilled
    })

    it('should fail for an invalid job (chracterized by an invalid job id)', function() {
      var job, saveId
      var build = utils.buildDetails()
      return Job.create('http://www.piaxis.tech', {
        os: 'Windows',
        osVersion : 'XP',
        browser : 'Firefox',
        browserVersion : '27.0'
      }, {
        build: build.build,
        project: build.project,
        test: build.test
      })
      .then(j => {
        job = j
        saveId = job.id
        job.id = 'xxxxxxxxxxxx'
        job.endpoint = job.processed.settings.host + JobVars.jobApiEndpoint + '/' + job.id
        return job.screenshot()
      })
      .catch(err => {
        if(err.message && err.message.match(/{"message":"Worker not found","errors":\[{"field":"id","code":"invalid"}\]}/))
        {
          utils.log.debug('taking screenshot failed expectedly for invalid job - %s', err)
          return true
        }
        else {
          utils.log.error('error: ', err)
          throw err
        }
      })
      .then(() => {
        job.id = saveId
        job.endpoint = job.processed.settings.host + JobVars.jobApiEndpoint + '/' + job.id
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
        if(err.message && err.message.match(/{"message":"Worker not found","errors":\[{"field":"id","code":"invalid"}\]}/))
        {
          utils.log.debug('taking screenshot failed expectedly for invalid job - %s', err)
          return true
        }
        else {
          utils.log.error('error: ', err)
          throw err
        }
      })
      .should.be.fulfilled
    })

  })

})
