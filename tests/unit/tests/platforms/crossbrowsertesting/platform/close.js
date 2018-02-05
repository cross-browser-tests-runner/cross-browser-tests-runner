'use strict';

var
  chai = require('chai'),
  spies = require('chai-spies'),
  chaiAsPromised = require('chai-as-promised'),
  platform = require('./../../../../../../lib/platforms/crossbrowsertesting/platform'),
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

  it('should successfully stop an ongoing run of test jobs that access a remote url and close the platform', function() {
    var build = utils.buildDetails()
    return platform.runMultiple('http://www.piaxis.tech', [{
      os: 'iOS',
      osVersion: '10.2',
      browser: 'Chrome for iOS',
      browserVersion: '57.0',
      device: 'iPad Pro'
    }, {
      os: 'Android',
      osVersion: '4.1',
      browser: 'Maxthon Mobile HD',
      browserVersion: '4.3',
      device: 'Android Galaxy Tab 2'
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
        osVersion: 'Mavericks',
        browser: 'Firefox',
        browserVersion: '26.0'
      }, {
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
      os: 'Android',
      osVersion: '5.0',
      browser: 'Maxthon Mobile',
      browserVersion: '4.3',
      device: 'Android Nexus 9'
    }, {
      os: 'Windows',
      osVersion: 'XP Service Pack 2',
      browser: 'Mozilla',
      browserVersion: '1.7.13'
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
        osVersion: '8 Preview',
        browser: 'Internet Explorer',
        browserVersion: '10.0'
      }, {
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
      osVersion: 'Vista Home',
      browser: 'Netscape',
      browserVersion: '9.0.0.5'
    }, {
      os: 'iOS',
      osVersion: '10.2',
      browser: 'Opera Mini for iOS',
      browserVersion: '14.0',
      device: 'iPad Pro'
    }], {
      local: true,
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
        os: 'OS X',
        osVersion: 'Sierra',
        browser: 'Safari',
        browserVersion: '10.0'
      }, {
        local: true,
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
      os: 'Android',
      osVersion: '6.0',
      browser: 'Opera Mini',
      browserVersion: '27.0',
      device: 'Android Nexus 9'
    }, {
      os: 'Android',
      osVersion: '5.0',
      browser: 'Opera Mobile',
      browserVersion: '43.0',
      device: 'Android Nexus 6'
    }], {
      local: true,
      localIdentifier: 'close-test-tunnel',
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
        osVersion: '10',
        browser: 'Edge',
        browserVersion: '14.0'
      }, {
        local: true,
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
      browser: 'Opera',
      browserVersion: '40.0'
    }, {
      os: 'OS X',
      osVersion: 'El Capitan',
      browser: 'Opera',
      browserVersion: '34.0'
    }], {
      local: true,
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
        browser: 'Chrome x64',
        browserVersion: '46.0'
      }, {
        local: true,
        localIdentifier: 'close-script-run-tunnel',
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
