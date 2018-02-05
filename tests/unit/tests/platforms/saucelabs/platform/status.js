'use strict';

var
  chai = require('chai'),
  spies = require('chai-spies'),
  chaiAsPromised = require('chai-as-promised'),
  platform = require('./../../../../../../lib/platforms/saucelabs/platform'),
  Platform = platform.Platform,
  utils = require('./../utils')

chai.use(spies)
chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

function checkRun(run) {
  expect(run).to.not.be.undefined
  expect(run.id).to.not.be.undefined
  expect(run.id).to.be.a('string')
}

const
  script = (driver, webdriver) => {
    return driver.getTitle()
    .then(function(title) {
      utils.log.debug(title)
      return true
    })
  }

describe('status', function() {

  var platform = new Platform()
  platform.stopMonitoring = true
  this.timeout(0)

  it('should fail if a non-existent run id is provided', function() {
    function tester() {
      platform.status('1909aoopopo=oioid')
    }
    expect(tester).to.throw('no such run 1909aoopopo=oioid found')
  })

  if(process.version > 'v6') {

    it('should say "running" for an ongoing run of a test job that accesses a remote url', function() {
      var runId
      var build = utils.buildDetails()
      return platform.run('http://www.piaxis.tech', {
        os: 'Windows',
        osVersion: '8.1',
        browser: 'Firefox',
        browserVersion: '42.0'
      }, {
        build: build.build,
        test: build.test,
        project: build.project
      })
      .then(run => {
        checkRun(run)
        runId = run.id
        return platform.status(runId)
      })
      .then(results => {
        expect(results).to.not.be.undefined
        expect(results.status).to.not.be.undefined
        expect(results.status).to.equal('running')
        expect(results.jobs).to.not.be.undefined
        expect(results.jobs).to.have.lengthOf(1)
        expect(results.jobs[0]).to.be.oneOf(['running', 'queue'])
        expect(results.tunnel).to.equal('none')
        return platform.stop(runId)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should say "stopped" for a stopped run of test jobs that accessed a remote url', function() {
      var runId
      var build = utils.buildDetails()
      return platform.run('http://www.piaxis.tech', {
        os: 'OS X',
        osVersion: 'El Capitan',
        browser: 'Firefox',
        browserVersion: '43.0'
      }, {
        build: build.build,
        test: build.test,
        project: build.project
      })
      .then(run => {
        checkRun(run)
        runId = run.id
        return platform.stop(runId)
      })
      .then(() => {
        return platform.status(runId)
      })
      .then(results => {
        expect(results).to.not.be.undefined
        expect(results.status).to.not.be.undefined
        expect(results.status).to.equal('stopped')
        expect(results.jobs).to.not.be.undefined
        expect(results.jobs).to.have.lengthOf(1)
        if('stopped' !== results.jobs[0]) {
          utils.log.warn('expected job status to be stopped')
        }
        expect(results.tunnel).to.equal('none')
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should say "stopped" for a stopped run of test jobs that accessed a remote url having one failed job', function() {
      var runId
      var build = utils.buildDetails()
      return platform.runMultiple('http://www.piaxis.tech', [{
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '54.0'
      },{
        os: 'Android',
        osVersion: '7.0',
        browser: 'Android Browser',
        browserVersion: null,
        device: 'Android GoogleAPI Emulator'
      }], {
        build: build.build,
        test: build.test,
        project: build.project
      })
      .then(run => {
        checkRun(run)
        runId = run.id
        return platform.stop(runId, true)
      })
      .then(() => {
        return platform.status(runId)
      })
      .then(results => {
        expect(results).to.not.be.undefined
        expect(results.status).to.not.be.undefined
        expect(results.status).to.equal('stopped')
        expect(results.jobs).to.not.be.undefined
        expect(results.jobs).to.have.lengthOf(2)
        if('stopped' !== results.jobs[0]) {
          utils.log.warn('expected job status to be stopped')
        }
        if('stopped' !== results.jobs[1]) {
          utils.log.warn('expected job status to be stopped')
        }
        expect(results.tunnel).to.equal('none')
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should say "running" for an ongoing run of a test job that accesses a local url', function() {
      var runId
      var build = utils.buildDetails()
      return platform.run('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
        os: 'Windows',
        osVersion: '8',
        browser: 'Chrome',
        browserVersion: '32.0'
      }, {
        local: true,
        build: build.build,
        test: build.test,
        project: build.project
      })
      .then(run => {
        checkRun(run)
        runId = run.id
        return platform.status(runId)
      })
      .then(results => {
        expect(results).to.not.be.undefined
        expect(results.status).to.not.be.undefined
        if('running' !== results.status) {
          utils.log.warn('expected status to be running, not %s', results.status)
        }
        expect(results.jobs).to.not.be.undefined
        expect(results.jobs).to.have.lengthOf(1)
        expect(results.jobs[0]).to.be.oneOf(['running', 'queue'])
        expect(results.tunnel).to.not.be.undefined
        if('running' !== results.tunnel) {
          utils.log.warn('expected tunnel to keep running')
        }
        return platform.stop(runId)
      })
      .then(() => {
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        if(err && err.message && err.message.match(/Process: already stopped/)) {
          utils.log.warn('did not expect tunnels to be stopped already')
          return true
        }
        else {
          utils.log.error('error: ', err)
          throw err
        }
      })
      .should.be.fulfilled
    })

    it('should say "stopped" for a stopped run of a test job that accessed a local url', function() {
      var runId
      var build = utils.buildDetails()
      return platform.run('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
        os: 'Windows',
        osVersion: '8.1',
        browser: 'Firefox',
        browserVersion: '46.0'
      }, {
        local: true,
        localIdentifier: 'platform-run-1',
        build: build.build,
        test: build.test,
        project: build.project
      })
      .then(run => {
        checkRun(run)
        runId = run.id
        return platform.stop(runId)
      })
      .then(() => {
        return platform.status(runId)
      })
      .then(results => {
        expect(results).to.not.be.undefined
        expect(results.status).to.not.be.undefined
        if('stopped' !== results.status) {
          utils.log.warn('expected test status to be stopped, not %s', results.status)
        }
        expect(results.jobs).to.not.be.undefined
        expect(results.jobs).to.have.lengthOf(1)
        if('stopped' !== results.jobs[0]) {
          utils.log.warn('expected job status to be stopped')
        }
        expect(results.tunnel).to.not.be.undefined
        if('running' !== results.tunnel) {
          utils.log.warn('expected tunnel to be running')
        }
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should say "messy" for an ongoing run of a test job that accesses a local url after the tunnel process is manually stopped before the test completes', function() {
      var runId
      var build = utils.buildDetails()
      return platform.run('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
        os: 'OS X',
        osVersion: 'Mavericks',
        browser: 'Chrome',
        browserVersion: '31.0'
      }, {
        local: true,
        localIdentifier: 'platform-run-1',
        build: build.build,
        test: build.test,
        project: build.project
      })
      .then(run => {
        checkRun(run)
        runId = run.id
        return platform.runs[runId].tunnel.stop()
      })
      .catch(err => {
        if(err.message && err.message.match(/Process: already stopped/)) {
          utils.log.warn('did not expect tunnel to be stopped already')
          return true
        }
        else {
          throw err
        }
      })
      .then(() => {
        return platform.status(runId)
      })
      .then(results => {
        expect(results).to.not.be.undefined
        expect(results.status).to.not.be.undefined
        expect(results.status).to.be.oneOf(['messy', 'stopped'])
        expect(results.jobs).to.not.be.undefined
        expect(results.jobs).to.have.lengthOf(1)
        expect(results.tunnel).to.not.be.undefined
        expect(results.tunnel).to.equal('stopped')
        return platform.stop(runId)
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

    it('should say "running" for an ongoing run of a script job that accesses a remote url', function() {
      var runId
      var build = utils.buildDetails()
      return platform.runScript('http://www.piaxis.tech', {
        os: 'OS X',
        osVersion: 'Sierra',
        browser: 'Chrome',
        browserVersion: '52.0'
      }, {
        screenshots: true,
        build: build.build,
        test: build.test,
        project: build.project
      },
      script)
      .then(run => {
        checkRun(run)
        runId = run.id
        return platform.status(runId)
      })
      .then(results => {
        expect(results).to.not.be.undefined
        expect(results.status).to.not.be.undefined
        expect(results.status).to.equal('running')
        expect(results.scriptJobs).to.not.be.undefined
        expect(results.scriptJobs).to.have.lengthOf(1)
        expect(results.scriptJobs[0]).to.be.oneOf(['running', 'queue'])
        expect(results.tunnel).to.equal('none')
        return platform.stop(runId)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should say "stopped" for a stopped run of a script job that accesses a remote url', function() {
      var runId
      var build = utils.buildDetails()
      return platform.runScript('http://www.piaxis.tech', {
        os: 'Windows',
        osVersion: '10',
        browser: 'Firefox',
        browserVersion: '45.0'
      }, {
        screenshots: true,
        build: build.build,
        test: build.test,
        project: build.project
      },
      script,
      () => {
        return Promise.resolve(false)
      })
      .then(run => {
        checkRun(run)
        runId = run.id
        return platform.stop(runId)
      })
      .then(() => {
        return platform.status(runId)
      })
      .then(results => {
        expect(results).to.not.be.undefined
        expect(results.status).to.not.be.undefined
        expect(results.status).to.equal('stopped')
        expect(results.scriptJobs).to.not.be.undefined
        expect(results.scriptJobs).to.have.lengthOf(1)
        expect(results.scriptJobs[0]).to.equal('stopped')
        expect(results.tunnel).to.equal('none')
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should say "running" for an ongoing run of a script job that accesses a local url', function() {
      var runId
      var build = utils.buildDetails()
      return platform.runScript('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '48.0'
      }, {
        local: true,
        localIdentifier: 'platform-run-scr-1',
        screenshots: true,
        build: build.build,
        test: build.test,
        project: build.project
      },
      script)
      .then(run => {
        checkRun(run)
        runId = run.id
        return platform.status(runId)
      })
      .then(results => {
        expect(results).to.not.be.undefined
        expect(results.status).to.not.be.undefined
        if('running' !== results.status) {
          utils.log.warn('expected status to be running, not %s', results.status)
        }
        expect(results.scriptJobs).to.not.be.undefined
        expect(results.scriptJobs).to.have.lengthOf(1)
        expect(results.scriptJobs[0]).to.be.oneOf(['running', 'queue'])
        expect(results.tunnel).to.not.be.undefined
        if('running' !== results.tunnel) {
          utils.log.warn('expected tunnel to keep running')
        }
        return platform.stop(runId)
      })
      .catch(err => {
        if(err && err.message && err.message.match(/Process: already stopped/)) {
          utils.log.warn('did not expect tunnels to be stopped already')
          return true
        }
        else {
          utils.log.error('error: ', err)
          throw err
        }
      })
      .should.be.fulfilled
    })

    it('should say "stopped" for a stopped run of a script job that accesses a local url', function() {
      var runId
      var build = utils.buildDetails()
      return platform.runScript('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
        os: 'OS X',
        osVersion: 'Yosemite',
        browser: 'Chrome',
        browserVersion: '41.0'
      }, {
        local: true,
        localIdentifier: 'platform-run-scr-1',
        screenshots: true,
        build: build.build,
        test: build.test,
        project: build.project
      },
      script)
      .then(run => {
        checkRun(run)
        runId = run.id
        return platform.stop(runId)
      })
      .then(() => {
        return platform.status(runId)
      })
      .then(results => {
        expect(results).to.not.be.undefined
        expect(results.status).to.not.be.undefined
        expect(results.status).to.equal('stopped')
        expect(results.scriptJobs).to.not.be.undefined
        expect(results.scriptJobs).to.have.lengthOf(1)
        expect(results.scriptJobs[0]).to.equal('stopped')
        expect(results.tunnel).to.not.be.undefined
        if('running' !== results.tunnel) {
          utils.log.warn('expected tunnel to be running')
        }
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should say "messy" for an ongoing run of a script job that accesses a local url after the tunnel process is stopped manually before the test completes', function() {
      var runId
      var build = utils.buildDetails()
      return platform.runScript('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
        os: 'OS X',
        osVersion: 'Mavericks',
        browser: 'Firefox',
        browserVersion: '35.0'
      }, {
        local: true,
        localIdentifier: 'platform-run-scr-1',
        screenshots: true,
        build: build.build,
        test: build.test,
        project: build.project
      },
      script)
      .then(run => {
        checkRun(run)
        runId = run.id
        return platform.runs[runId].tunnel.stop()
      })
      .catch(err => {
        if(err.message && err.message.match(/Process: already stopped/)) {
          utils.log.warn('did not expect tunnel to be stopped already')
          return true
        }
        else {
          throw err
        }
      })
      .then(() => {
        return platform.status(runId)
      })
      .then(results => {
        expect(results).to.not.be.undefined
        expect(results.status).to.not.be.undefined
        if('messy' !== results.status) {
          utils.log.warn('expected results status to be messy')
        }
        expect(results.scriptJobs).to.not.be.undefined
        expect(results.scriptJobs).to.have.lengthOf(1)
        expect(results.tunnel).to.not.be.undefined
        expect(results.tunnel).to.equal('stopped')
        return platform.stop(runId)
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
  }

})
