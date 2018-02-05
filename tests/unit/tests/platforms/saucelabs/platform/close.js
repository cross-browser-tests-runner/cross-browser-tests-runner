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

describe('close', function() {

  var platform = new Platform()
  this.timeout(0)

  it('should silently complete in case there are no ongoing runs', function() {
    return platform.close()
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  if(process.version > 'v6') {

    it('should successfully close the platform after stopping an ongoing run of test jobs that access a remote url', function() {
      var build = utils.buildDetails()
      return platform.runMultiple('http://www.piaxis.tech', [{
        os: 'Windows',
        osVersion: '7',
        browser: 'Firefox',
        browserVersion: '32.0'
      }, {
        os: 'OS X',
        osVersion: 'Sierra',
        browser: 'Chrome',
        browserVersion: '39.0'
      }], {
        build: build.build,
        test: build.test,
        project: build.project
      })
      .then(run => {
        checkRun(run)
        return platform.close()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should silently close the platform if called after stopping an ongoing run of test jobs that access a remote url manually by calling "stop" method', function() {
      var build = utils.buildDetails()
      return platform.runMultiple('http://www.piaxis.tech', [{
        os: 'Windows',
        osVersion: '10',
        browser: 'Firefox',
        browserVersion: '45.0'
      }, {
        os: 'OS X',
        osVersion: 'Yosemite',
        browser: 'Chrome',
        browserVersion: '39.0'
      }], {
        build: build.build,
        test: build.test,
        project: build.project
      })
      .then(run => {
        checkRun(run)
        return platform.stop(run.id)
      })
      .then(() => {
        return platform.close()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should successfully close the platform after stopping an ongoing run of test jobs that access a local url', function() {
      var build = utils.buildDetails()
      return platform.runMultiple('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', [{
        os: 'Windows',
        osVersion: '7',
        browser: 'Firefox',
        browserVersion: '32.0'
      }, {
        os: 'OS X',
        osVersion: 'El Capitan',
        browser: 'Chrome',
        browserVersion: '48.0'
      }], {
        local: true,
        localIdentifier: 'platform-run-mult-1',
        build: build.build,
        test: build.test,
        project: build.project
      })
      .then(run => {
        checkRun(run)
        return platform.close()
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
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should successfully shutdown the tunnel process and close the platform if called after manually stopping an ongoing run of test jobs that access a local url by calling the "stop" method', function() {
      var build = utils.buildDetails()
      return platform.runMultiple('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', [{
        os: 'Windows',
        osVersion: '8.1',
        browser: 'Chrome',
        browserVersion: '47.0'
      }, {
        os: 'OS X',
        osVersion: 'Mavericks',
        browser: 'Chrome',
        browserVersion: '39.0'
      }], {
        local: true,
        localIdentifier: 'platform-run-mult-1',
        build: build.build,
        test: build.test,
        project: build.project
      })
      .then(run => {
        checkRun(run)
        return platform.stop(run.id)
      })
      .then(() => {
        return platform.close()
      })
      .catch(err => {
        if(err.message && err.message.match(/Process: already stopped/)) {
          utils.log.warn('did not expect tunnels to be stopped already')
          return true
        }
        else {
          throw err
        }
      })
      .then(() => {
        return utils.tunnels()
      })
      .then(tunnels => {
        expect(tunnels.length).to.equal(0)
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should successfully stop remaining test jobs of an ongoing run that access a local url, shutdown the associated tunnel with identifier process, and close the platform if called after one of the test jobs of the run was manually stopped', function() {
      var runId
      var build = utils.buildDetails()
      return platform.runMultiple('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', [{
        os: 'OS X',
        osVersion: 'Yosemite',
        browser: 'Chrome',
        browserVersion: '51.0'
      }, {
        os: 'Windows',
        osVersion: '7',
        browser: 'Firefox',
        browserVersion: '37.0'
      }], {
        local: true,
        localIdentifier: 'my-test-id',
        build: build.build,
        test: build.test,
        project: build.project
      })
      .then(run => {
        checkRun(run)
        runId = run.id
        return platform.runs[runId].jobs[0].stop()
      })
      .then(() => {
        return platform.close()
      })
      .catch(err => {
        if(err && err.message && err.message.match(/Process: already stopped/)) {
          utils.log.warn('did not expect tunnels to be stopped already')
          return true
        }
        else {
          throw err
        }
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

    it('should stop test jobs of an ongoing run of test jobs that access a local url and close the platform if called after manually stopping associated tunnels', function() {
      var build = utils.buildDetails()
      return platform.runMultiple('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', [{
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '53.0'
      }, {
        os: 'Windows',
        osVersion: '8',
        browser: 'Firefox',
        browserVersion: '40.0'
      }], {
        local: true,
        localIdentifier: 'platform-run-mult-1',
        build: build.build,
        test: build.test,
        project: build.project
      })
      .then(run => {
        checkRun(run)
        platform.stopMonitoring = true
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        if(err.message && err.message.match(/Process: already stopped/)) {
          utils.log.warn('did not expect tunnels to be stopped already')
          return true
        }
        throw err
      })
      .then(() => {
        return platform.close()
      })
      .then(() => {
        return utils.tunnels()
      })
      .then(tunnels => {
        expect(tunnels.length).to.equal(0)
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should successfully stop an ongoing run of a script test that accesses a remote url and close the platform', function() {
      var build = utils.buildDetails()
      return platform.runScript('http://www.piaxis.tech', {
        os: 'OS X',
        osVersion: 'Sierra',
        browser: 'Chrome',
        browserVersion: '53.0'
      }, {
        screenshots: true,
        build: build.build,
        test: build.test,
        project: build.project
      },
      script)
      .then(run => {
        checkRun(run)
        return platform.close()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should silently close the platform if called after manually stopping an ongoing run of a script test that accesses a remote url by calling "stop" method', function() {
      var build = utils.buildDetails()
      return platform.runScript('http://www.piaxis.tech', {
        os: 'Windows',
        osVersion: '10',
        browser: 'Firefox',
        browserVersion: '38.0'
      }, {
        screenshots: true,
        build: build.build,
        test: build.test,
        project: build.project
      },
      script)
      .then(run => {
        checkRun(run)
        return platform.stop(run.id)
      })
      .then(() => {
        return platform.close()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should shutdown the associated tunnel processes and close the platform if called after manually stopping an ongoing run of a script test that accesses a local url by calling the "stop" method', function() {
      var build = utils.buildDetails()
      return platform.runScript('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
        os: 'Windows',
        osVersion: '8.1',
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
        return platform.stop(run.id)
      })
      .then(() => {
        return platform.close()
      })
      .catch(err => {
        if(err.message && err.message.match(/Process: already stopped/)) {
          utils.log.warn('did not expect tunnels to be stopped already')
          return true
        }
        else {
          throw err
        }
      })
      .then(() => {
        return utils.tunnels()
      })
      .then(tunnels => {
        expect(tunnels.length).to.equal(0)
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should shutdown the associated tunnel process and close the platform if called after stopping a script test of an ongoing run that accesses a local url manually', function() {
      var runId
      var build = utils.buildDetails()
      return platform.runScript('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
        os: 'Windows',
        osVersion: '7',
        browser: 'Firefox',
        browserVersion: '36.0'
      }, {
        local: true,
        localIdentifier: 'my-test-id',
        screenshots: true,
        build: build.build,
        test: build.test,
        project: build.project
      },
      script)
      .then(run => {
        checkRun(run)
        runId = run.id
        return platform.runs[runId].scriptJobs[0].stop()
      })
      .then(() => {
        return platform.close()
      })
      .catch(err => {
        if(err && err.message && err.message.match(/Process: already stopped/)) {
          utils.log.warn('did not expect tunnels to be stopped already')
          return true
        }
        else {
          throw err
        }
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

    it('should stop scripts jobs of an ongoing run of script jobs that access a local url and close the platform if called after manually stopping associated tunnels', function() {
      var runId
      var build = utils.buildDetails()
      return platform.runScript('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
        os: 'OS X',
        osVersion: 'El Capitan',
        browser: 'Chrome',
        browserVersion: '42.0'
      }, {
        local: true,
        localIdentifier: 'my-test-id',
        screenshots: true,
        build: build.build,
        test: build.test,
        project: build.project
      },
      script)
      .then(run => {
        checkRun(run)
        platform.stopMonitoring = true
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        if(err.message && err.message.match(/Process: already stopped/)) {
          utils.log.warn('did not expect tunnels to be stopped already')
          return true
        }
        throw err
      })
      .then(() => {
        return platform.close()
      })
      .then(() => {
        return utils.tunnels()
      })
      .then(tunnels => {
        expect(tunnels.length).to.equal(0)
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })
  }

})
