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

    it('should fail to create a job in case of invalid authorization', function() {
      return Job.create('http://google.com', undefined, {
        username: 'abc',
        password: 'abc'
      })
      .should.be.rejectedWith('Basic: Access denied')
    })

    it('should fail to create a job if no capabilities are provided', function() {
      return Job.create('http://google.com')
      .should.be.rejectedWith('422 - {"message":"Validation Failed"')
    })

    it('should fail to create a job if unsupported os capability is provided', function() {
      return Job.create('', {
        os : 'Linux'
      })
      .should.be.rejectedWith('422 - {"message":"Validation Failed","errors":[{"field":"os_version","code":"can\'t be blank"},{"field":"url","code":"can\'t be blank"},{"field":"os","code":"invalid"}]}')
    })

    it('should fail to create a job if unsupported os version capability is provided', function() {
      return Job.create('', {
        os : 'Windows',
        os_version : '6.0'
      })
      .should.be.rejectedWith('422 - {"message":"Validation Failed","errors":[{"field":"url","code":"can\'t be blank"},{"field":"os_version","code":"invalid"}]}')
    })

    it('should fail to create a job if the url to open is empty', function() {
      return Job.create('', {
        os : 'Windows',
        os_version : '10'
      })
      .should.be.rejectedWith('422 - {"message":"Validation Failed","errors":[{"field":"url","code":"can\'t be blank"},{"field":"browser","code":"required"}]}')
    })

    it('should fail to create a job if browser capability is not provided', function() {
      return Job.create('http://piaxis.tech', {
        os : 'Windows',
        os_version : '10',
      })
      .should.be.rejectedWith('422 - {"message":"Validation Failed","errors":[{"field":"browser","code":"required"}]}')
    })

    it('should fail to create a job if unsupported browser capability is provided', function() {
      return Job.create('http://www.piaxis.tech', {
        os : 'Windows',
        os_version : '10',
        browser : 'Ubuntu'
      })
      .should.be.rejectedWith('422 - {"message":"Validation Failed","errors":[{"field":"browser","code":"invalid"},{"field":"browser_version","code":"invalid"}]}')
    })

    it('should fail to create a job if browser version capability is not provided', function() {
      return Job.create('http://www.piaxis.tech', {
        os : 'Windows',
        os_version : '10',
        browser : 'chrome'
      })
      .should.be.rejectedWith('422 - {"message":"Validation Failed","errors":[{"field":"browser_version","code":"invalid"}]}')
    })

    it('should fail to create a job if unsupported browser version capability is provided', function() {
      return Job.create('http://www.piaxis.tech',{
        os : 'Windows',
        os_version : '10',
        browser : 'chrome',
        browser_version : '10.0'
      })
      .should.be.rejectedWith('422 - {"message":"Validation Failed","errors":[{"field":"browser_version","code":"invalid"}]}')
    })

    it('should create a remote url test job if valid values are provided for all mandatory capabilities', function() {
      var build = utils.buildDetails()
      return Job.create('http://www.piaxis.tech',{
        os : 'Windows',
        os_version : '10',
        browser : 'chrome',
        browser_version : '45.0'
      }, {
        build: build.build,
        project: build.project,
        name: build.name
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
      return Job.create('http://localhost:3000/tests/pages/tests.html', {
        os : 'Windows',
        os_version : '10',
        browser : 'chrome',
        browser_version : '45.0'
      }, {
        build: build.build,
        project: build.project,
        name: build.name,
        'browserstack.local' : true
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
      return Job.create('http://localhost:3000/tests/pages/tests.html', {
        os : 'Windows',
        os_version : '10',
        browser : 'chrome',
        browser_version : '45.0'
      }, {
        build: build.build,
        project: build.project,
        name: build.name,
        'browserstack.local' : true,
        'browserstack.debug' : true,
        'browserstack.video' : true
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
      return Job.create('http://localhost:3000/tests/pages/tests.html', {
        os : 'Windows',
        os_version : '10',
        browser : 'chrome',
        browser_version : '45.0'
      }, {
        build: build.build,
        project: build.project,
        name: build.name,
        'browserstack.local' : true,
        'browserstack.debug' : true,
        'browserstack.video' : true
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
      return Job.create('http://localhost:3000/tests/pages/tests.html?', {
        os : 'Windows',
        os_version : '10',
        browser : 'chrome',
        browser_version : '45.0'
      }, {
        build: build.build,
        project: build.project,
        name: build.name,
        'browserstack.local' : true
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

    it('should fail to create jobs if no browsers are input', function() {
      expect(()=>{Job.createMultiple('http://google.com', [ ])}).to.throw('no browsers specified for createMultiple')
    })

    it('should fail to create jobs if no capabilities are input', function() {
      return Job.createMultiple('http://google.com', [
        { }
      ])
      .should.be.rejectedWith('422 - {"message":"Validation Failed"')
    })

    it('should create multiple test jobs for a valid remote url with valid values for all mandatory capabilities provided', function() {
      var build = utils.buildDetails()
      return Job.createMultiple('http://www.piaxis.tech', [{
        os : 'Windows',
        os_version : '10',
        browser : 'chrome',
        browser_version : '45.0'
      }, {
        os : 'Windows',
        os_version : '8.1',
        browser : 'firefox',
        browser_version : '39.0'
      }], {
        build: build.build,
        project: build.project,
        name: build.name
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
      return Job.createMultiple('http://localhost:3000/tests/pages/tests.html', [{
        os : 'Windows',
        os_version : '10',
        browser : 'chrome',
        browser_version : '45.0'
      }, {
        os : 'Windows',
        os_version : '8.1',
        browser : 'firefox',
        browser_version : '39.0'
      }], {
        build: build.build,
        project: build.project,
        name: build.name
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
      return Job.createMultiple('http://localhost:3000/tests/pages/tests.html?_=89141414', [{
        os : 'Windows',
        os_version : '10',
        browser : 'chrome',
        browser_version : '45.0'
      }, {
        os : 'Windows',
        os_version : '8.1',
        browser : 'firefox',
        browser_version : '39.0'
      }], {
        build: build.build,
        project: build.project,
        name: build.name
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
        os : 'Windows',
        os_version : '10',
        browser : 'chrome',
        browser_version : '45.0'
      }, {
        build: build.build,
        project: build.project,
        name: build.name
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
        os : 'Windows',
        os_version : '10',
        browser : 'chrome',
        browser_version : '45.0'
      }, {
        build: build.build,
        project: build.project,
        name: build.name
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
        os : 'Windows',
        os_version : '10',
        browser : 'chrome',
        browser_version : '45.0'
      }, {
        build: build.build,
        project: build.project,
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

    it('should tolerate when called for a job that is stopped already, and return silently', function() {
      var build = utils.buildDetails()
      return Job.create('http://www.piaxis.tech', {
        os : 'Windows',
        os_version : '10',
        browser : 'chrome',
        browser_version : '45.0'
      }, {
        build: build.build,
        project: build.project,
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

    it('should create a screenshot for a valid running job', function() {
      var job
      var build = utils.buildDetails()
      return Job.create('http://www.piaxis.tech', {
        os : 'Windows',
        os_version : '10',
        browser : 'chrome',
        browser_version : '45.0'
      }, {
        build: build.build,
        project: build.project,
        name: build.name
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
        os : 'Windows',
        os_version : '10',
        browser : 'chrome',
        browser_version : '45.0'
      }, {
        build: build.build,
        project: build.project,
        name: build.name
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
        os : 'Windows',
        os_version : '10',
        browser : 'chrome',
        browser_version : '45.0'
      }, {
        build: build.build,
        project: build.project,
        name: build.name
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
