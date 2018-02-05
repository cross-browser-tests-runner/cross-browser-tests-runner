'use strict';

var
  Bluebird = require('bluebird'),
  fs = Bluebird.promisifyAll(require('fs')),
  chai = require('chai'),
  spies = require('chai-spies'),
  chaiAsPromised = require('chai-as-promised'),
  Env = require('./../../../../../../lib/core/env').Env,
  platform = require('./../../../../../../lib/platforms/browserstack/platform'),
  Platform = platform.Platform,
  BinaryVars = require('./../../../../../../lib/platforms/browserstack/tunnel/binary').BinaryVars,
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

  it('should successfully stop an ongoing run of test jobs that access a remote url and close the platform', function() {
    var build = utils.buildDetails()
    return platform.runMultiple('http://www.piaxis.tech', [{
      os: 'Windows',
      osVersion: 'XP',
      browser: 'Opera',
      browserVersion: '30.0'
    }, {
      os: 'OS X',
      osVersion: 'Mountain Lion',
      browser: 'Chrome',
      browserVersion: '41.0'
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

  if(process.version > 'v6') {
    it('should successfully stop an ongoing run of script jobs that access a remote url and close the platform', function() {
      var build = utils.buildDetails()
      return platform.runScript('http://www.piaxis.tech', {
        os: 'OS X',
        osVersion: 'Lion',
        browser: 'Firefox',
        browserVersion: '36.0'
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
  }

  it('should complete closing the platform if an ongoing run of test jobs that access a remote url was stopped by calling "stop" method explicitly', function() {
    var build = utils.buildDetails()
    return platform.runMultiple('http://www.piaxis.tech', [{
      os: 'Windows',
      osVersion: '8',
      browser: 'Chrome',
      browserVersion: '45.0'
    }, {
      os: 'OS X',
      osVersion: 'Yosemite',
      browser: 'Firefox',
      browserVersion: '46.0'
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

  if(process.version > 'v6') {
    it('should complete closing the platform if an ongoing run of script jobs that access a remote url was stopped by calling the "stop" method manually', function() {
      var build = utils.buildDetails()
      return platform.runScript('http://www.piaxis.tech', {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '51.0'
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
  }

  it('should shutdown the tunnels and complete closing the platform if an ongoing run of test jobs that access a local url was stopped by calling "stop" method manually', function() {
    var build = utils.buildDetails()
    return platform.runMultiple('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', [{
      os: 'Windows',
      osVersion: '10',
      browser: 'Edge',
      browserVersion: '15.0'
    }, {
      os: 'OS X',
      osVersion: 'Sierra',
      browser: 'Chrome',
      browserVersion: '53.0'
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

  if(process.version > 'v6') {
    it('should shutdown the tunnels and complete closing the platform if an ongoing run of script jobs that access a local url was stopped by calling "stop" method manually', function() {
      var build = utils.buildDetails()
      return platform.runScript('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
        os: 'Windows',
        osVersion: '7',
        browser: 'Firefox',
        browserVersion: '36.0'
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
  }

  it('should stop remaining test jobs of an ongoing run, shutdown the tunnels, and complete closing the platform if one test from the run of test jobs that access a local url was manually stopped', function() {
    var runId
    var build = utils.buildDetails()
    return platform.runMultiple('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', [{
      os: 'Windows',
      osVersion: '7',
      browser: 'Chrome',
      browserVersion: '45.0'
    }, {
      os: 'OS X',
      osVersion: 'Snow Leopard',
      browser: 'Firefox',
      browserVersion: '32.0'
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

  if(process.version > 'v6') {
    it('should stop remaining script jobs of an ongoing run, shutdown the tunnels, and complete closing the platform if one of the script jobs from the run of script jobs that access a local url was manually stopped', function() {
      var runId
      var build = utils.buildDetails()
      return platform.runScript('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
        os: 'Windows',
        osVersion: '8',
        browser: 'Chrome',
        browserVersion: '45.0'
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
  }

  it('should stop test jobs of an ongoing run of test jobs that access a local url and complete closing the platform even if tunnels involved in the run were stopped manually in between', function() {
    var build = utils.buildDetails()
    return platform.runMultiple('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', [{
      os: 'Windows',
      osVersion: '10',
      browser: 'Edge',
      browserVersion: '14.0'
    }, {
      os: 'Windows',
      osVersion: 'XP',
      browser: 'Firefox',
      browserVersion: '34.0'
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

  if(process.version > 'v6') {
    it('should stop scripts jobs of an ongoing run of script jobs that access a local url and complete closing the platform even if tunnels involved in the run were stopped manually in between', function() {
      var runId
      var build = utils.buildDetails()
      return platform.runScript('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
        os: 'OS X',
        osVersion: 'Mountain Lion',
        browser: 'Chrome',
        browserVersion: '41.0'
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

  if(!Env.isWindows) {

    it('should fail if there is a failure in stopping the tunnels associated with a run of test jobs that access a local url (simulated with removing execute permissions for the tunnel binary)', function() {
      var build = utils.buildDetails(), error
      return platform.runMultiple('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', [{
        os: 'Windows',
        osVersion: '8.1',
        browser: 'Firefox',
        browserVersion: '41.0'
      }, {
        os: 'OS X',
        osVersion: 'Yosemite',
        browser: 'Firefox',
        browserVersion: '42.0'
      }], {
        local: true,
        localIdentifier: 'platform-run-mult-1',
        build: build.build,
        test: build.test,
        project: build.project
      })
      .then(run => {
        checkRun(run)
        return fs.chmodAsync(BinaryVars.path, '0400')
      })
      .then(() => {
        return platform.close()
      })
      .catch(err => {
        error = err
        return fs.chmodAsync(BinaryVars.path, '0755')
      })
      .then(() => {
        platform.stopMonitoring = true
        return utils.ensureZeroTunnels()
      })
      .then(() => {
        throw error
      })
      .should.be.rejectedWith('spawn EACCES')
    })

    if(process.version > 'v6') {
      it('should fail if there is a failure in stopping the tunnels associated with a run of script jobs that access a local url (simulated with removing execute permissions for the tunnel binary)', function() {
        var build = utils.buildDetails(), error
        return platform.runScriptMultiple('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', [{
          os: 'Windows',
          osVersion: 'XP',
          browser: 'Chrome',
          browserVersion: '30.0'
        }, {
          os: 'OS X',
          osVersion: 'El Capitan',
          browser: 'Firefox',
          browserVersion: '42.0'
        }], {
          local: true,
          localIdentifier: 'platform-run-mult-1',
          build: build.build,
          test: build.test,
          project: build.project
        },
        script)
        .then(run => {
          checkRun(run)
          return fs.chmodAsync(BinaryVars.path, '0400')
        })
        .then(() => {
          return platform.close()
        })
        .catch(err => {
          error = err
          return fs.chmodAsync(BinaryVars.path, '0755')
        })
        .then(() => {
          platform.stopMonitoring = true
          return utils.ensureZeroTunnels()
        })
        .then(() => {
          throw error
        })
        .should.be.rejectedWith('spawn EACCES')
      })
    }
  }
})
