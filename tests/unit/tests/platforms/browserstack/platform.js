'use strict';

var
  Bluebird = require('bluebird'),
  retry = require('p-retry'),
  fs = require('fs'),
  chai = require('chai'),
  spies = require('chai-spies'),
  chaiAsPromised = require('chai-as-promised'),
  Env = require('./../../../../../lib/core/env').Env,
  platform = require('./../../../../../lib/platforms/browserstack/platform'),
  Platform = platform.Platform,
  PlatformVars = platform.PlatformVars,
  PlatformKeys = require('./../../../../../lib/platforms/interfaces/platform').PlatformKeys,
  Tunnel = require('./../../../../../lib/platforms/browserstack/tunnel').Tunnel,
  Manager = require('./../../../../../lib/platforms/browserstack/manager').Manager,
  BinaryVars = require('./../../../../../lib/platforms/browserstack/tunnel/binary').BinaryVars,
  utils = require('./utils')

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
  },
  badScript = (driver, webdriver) => {
    return driver.findElement({id : 'xyz'})
  }

describe('Platform', function() {

  describe('browserKeys', function() {
    it('should return all standard browser keys', function() {
      var keys = Platform.browserKeys(PlatformKeys.browser)
      PlatformKeys.browser.forEach(function(key) {
        expect(keys[key]).to.not.be.undefined
      })
    })

  })

  describe('capabilitiesKeys', function() {

    it('should return all standard capabilities keys', function() {
      var keys = Platform.capabilitiesKeys(PlatformKeys.capabilities)
      PlatformKeys.capabilities.forEach(function(key) {
        expect(keys[key]).to.not.be.undefined
      })
    })

  })

  describe('required', function() {

    it('should return well-formed set of the required keys', function() {
      var required = Platform.required
      expect(required.browser).to.not.be.undefined
      expect(required.browser).to.be.an('Array')
      expect(required.capabilities).to.not.be.undefined
      expect(required.capabilities).to.be.an('Array')
    })

  })

  describe('open', function() {

    var platform = new Platform()
    this.timeout(0)

    it('should silently complete if no capabilities are provided', function() {
      return platform.open()
      .should.be.fulfilled
    })

    it('should fail in case capabilities input is not an array', function() {
      function tester() {
        platform.open({ local: true })
      }
      expect(tester).to.throw(Error)
    })

    it('should fail if an invalid/unsupported capability key is provided', function() {
      function tester() {
        platform.open([{
          abc: 123
        }])
      }
      expect(tester).to.throw(Error)
    })

    it('should open the platform by creating a tunnel without an identifier if "local" capability is provided', function() {
      return platform.open([{
        local: true
      }])
      .then(() => {
        platform.stopMonitoring = true
        return Manager.withoutId()
      })
      .then(procs => {
        if(1 !== procs.length) {
          utils.log.warn('expected 1 tunnel to be running')
        }
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    function waitForTunnel() {
      const check = () => {
        return Manager.withoutId()
        .then(procs => {
          if(procs.length) {
            utils.log.debug('Got a tunnel process')
            return true
          }
          utils.log.debug('No tunnels running yet')
          throw new Error('no tunnels yet')
        })
      },
      minTimeout = 2000, factor = 1, max = 60
      return retry(check, {minTimeout: minTimeout, factor: factor, retries: max})
    }

    it('should open the platform by creating a tunnel process if "local" capability was provided, and then monitor the tunnel process availability and restart it if it dies', function() {
      platform.stopMonitoring = false
      platform.tunnels = [ ]
      return platform.open([{
        local: true
      }])
      .then(() => {
        return Manager.withoutId()
      })
      .then(procs => {
        if(1 !== procs.length) {
          utils.log.warn('expected 1 tunnel to be running')
        }
        return platform.tunnels[0].stop()
      })
      .catch(err => {
        if(err && err.message && err.message.match(/Process: already stopped/)) {
          utils.log.warn('did not expect tunnels to be stopped already')
          return true
        }
        utils.log.error('error: ', err)
        throw err
      })
      .then(() => {
        return waitForTunnel()
      })
      .then(() => {
        platform.stopMonitoring = true
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        if(err && err.message && err.message.match(/Process: already stopped/)) {
          utils.log.warn('did not expect tunnels to be stopped already')
          return true
        }
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should open the platform by creating multiple tunnel processes with identifiers if multiple "local" and "localIdentifier" capabilities were provided', function() {
      return platform.open([{
        local: true,
        localIdentifier: 'my-id-1'
      }, {
        local: true,
        localIdentifier: 'my-id-2'
      }])
      .then(() => {
        platform.stopMonitoring = true
        return Manager.withId()
      })
      .then(procs => {
        if(2 !== procs.length) {
          utils.log.warn('expected 2 tunnels to be running')
        }
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  })

  describe('run', function() {

    var platform = new Platform()
    platform.stopMonitoring = true
    this.timeout(0)

    it('should fail if no input is provided', function() {
      function tester() {
        platform.run(undefined, undefined, undefined)
      }
      expect(tester).to.throw(Error)
    })

    it('should fail to create a run of a test job if required browser keys are not provided', function() {
      function tester() {
        platform.run('http://www.piaxis.tech', { }, { })
      }
      expect(tester).to.throw(Error)
    })

    it('should fail to create a run of a test job if an unsupported browser key is provided', function() {
      function tester() {
        platform.run('http://www.piaxis.tech', {
          abc: 123,
          os: 'Windows',
          osVersion: 'Vista',
          browser: 'Chrome',
          browserVersion: '11.0'
        }, { })
      }
      expect(tester).to.throw(Error)
    })

    it('should fail to create a run of a test job if an unsupported capabilities key is provided', function() {
      function tester() {
        platform.run('http://www.piaxis.tech', {
          os: 'Windows',
          osVersion: 'Vista',
          browser: 'Chrome',
          browserVersion: '11.0'
        }, {
          abc: 123
        })
      }
      expect(tester).to.throw(Error)
    })

    it('should create a run of a test job if a valid remote url and valid values for all mandatory parameters are provided', function() {
      var build = utils.buildDetails()
      return platform.run('http://www.piaxis.tech', {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0'
      }, {
        build: build.build,
        test: build.name,
        project: build.project
      })
      .then(run => {
        checkRun(run)
        return utils.safeKillJob(platform.runs[run.id].jobs[0])
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should create a run of a test job if a valid local url, valid values for all mandatory parameters, and few optional capabilities are provided', function() {
      var build = utils.buildDetails()
      return platform.run('http://127.0.0.1:3000/tests/pages/tests.html', {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0'
      }, {
        timeout: 60,
        local: true,
        localIdentifier: 'platform-run-1',
        screenshots: false,
        video: true,
        build: build.build,
        test: build.name,
        project: build.project
      })
      .then(run => {
        checkRun(run)
        return utils.safeKillJob(platform.runs[run.id].jobs[0])
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

    it('should create a run of a test job for native runner case if a valid local url, valid values for all mandatory parameters, and few optional capabilities are provided', function() {
      var build = utils.buildDetails()
      return platform.run('http://127.0.0.1:3000/tests/pages/tests.html', {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0'
      }, {
        timeout: 60,
        local: true,
        localIdentifier: 'platform-run-1',
        screenshots: false,
        video: true,
        build: build.build,
        test: build.name,
        project: build.project
      },
      true)
      .then(run => {
        checkRun(run)
        return utils.safeKillJob(platform.runs[run.id].jobs[0])
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

    it('should create a run of a test job for native runner case if a valid local url ending in ?, valid values for all mandatory parameters, and few optional capabilities are provided', function() {
      var build = utils.buildDetails()
      return platform.run('http://127.0.0.1:3000/tests/pages/tests.html?', {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0'
      }, {
        timeout: 60,
        local: true,
        localIdentifier: 'platform-run-1',
        screenshots: false,
        video: true,
        build: build.build,
        test: build.name,
        project: build.project
      },
      true)
      .then(run => {
        checkRun(run)
        return utils.safeKillJob(platform.runs[run.id].jobs[0])
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

  })

  describe('runMultiple', function() {

    var platform = new Platform()
    platform.stopMonitoring = true
    this.timeout(0)

    it('should fail if no input is provided', function() {
      function tester() {
        platform.runMultiple(undefined, undefined, undefined)
      }
      expect(tester).to.throw(Error)
    })

    it('should fail to create a run of test jobs if required keys are not provided in even one of the input browsers', function() {
      function tester() {
        platform.runMultiple('http://www.piaxis.tech', [{
          os: 'Windows',
          osVersion: '10',
          browser: 'Chrome',
          browserVersion: '45.0'
        }, {
          os: 'Windows'
        }], { })
      }
      expect(tester).to.throw(Error)
    })

    it('should fail to create a run of test jobs if an unsupported key is provided in even one of the input browsers', function() {
      function tester() {
        platform.runMultiple('http://www.piaxis.tech', [{
          os: 'Windows',
          osVersion: 'Vista',
          browser: 'Chrome',
          browserVersion: '11.0'
        }, {
          os: 'Windows',
          osVersion: 'Vista',
          browser: 'Chrome',
          browserVersion: '11.0',
          abc: 123
        }], { })
      }
      expect(tester).to.throw(Error)
    })

    it('should fail to create a run of tests jobs if an unsupported capabilities key is provided', function() {
      function tester() {
        platform.runMultiple('http://www.piaxis.tech', [{
          os: 'Windows',
          osVersion: 'Vista',
          browser: 'Chrome',
          browserVersion: '11.0'
        }], {
          abc: 123
        })
      }
      expect(tester).to.throw(Error)
    })

    it('should create a run of test jobs if a valid remote url and valid values for all mandatory parameters are provided', function() {
      var runId
      var build = utils.buildDetails()
      return platform.runMultiple('http://www.piaxis.tech', [{
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0'
      }, {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '42.0'
      }], {
        build: build.build,
        test: build.name,
        project: build.project
      })
      .then(run => {
        checkRun(run)
        runId = run.id
        return Promise.all([
          utils.safeKillJob(platform.runs[runId].jobs[0]),
          utils.safeKillJob(platform.runs[runId].jobs[1])
        ])
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should create a run of test jobs if a valid local url and valid values for all mandatory parameters are provided', function() {
      var runId
      var build = utils.buildDetails()
      return platform.runMultiple('http://127.0.0.1:3000/tests/pages/tests.html', [{
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0',
      }, {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '42.0'
      }], {
        local: true,
        localIdentifier: 'platform-run-mult-1',
        build: build.build,
        test: build.name,
        project: build.project
      })
      .then(run => {
        checkRun(run)
        runId = run.id
        return Promise.all([
          utils.safeKillJob(platform.runs[runId].jobs[0]),
          utils.safeKillJob(platform.runs[runId].jobs[1])
        ])
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

    it('should create a run of test jobs for native runner case if a valid local url containing query parameters, and valid values for all mandatory parameters are provided', function() {
      var runId
      var build = utils.buildDetails()
      return platform.runMultiple('http://127.0.0.1:3000/tests/pages/tests.html?_=1414190941', [{
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0',
      }, {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '42.0'
      }], {
        local: true,
        localIdentifier: 'platform-run-mult-1',
        build: build.build,
        test: build.name,
        project: build.project
      },
      true)
      .then(run => {
        checkRun(run)
        runId = run.id
        return Promise.all([
          utils.safeKillJob(platform.runs[runId].jobs[0]),
          utils.safeKillJob(platform.runs[runId].jobs[1])
        ])
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

  })

  if(process.version > 'v6') {

    describe('runScript', function() {

      var platform = new Platform()
      platform.stopMonitoring = true
      this.timeout(0)

      it('should fail if no input is provided', function() {
        function tester() {
          platform.runScript(undefined)
        }
        expect(tester).to.throw(Error)
      })

      it('should fail to create a run of a script session if required browser keys are not provided', function() {
        function tester() {
          platform.runScript('http://www.piaxis.tech', { }, { })
        }
        expect(tester).to.throw(Error)
      })

      it('should fail to create a run of a script session if unsupported browser key is provided', function() {
        function tester() {
          platform.runScript('http://www.piaxis.tech', {
            abc: 123,
            os: 'Windows',
            osVersion: 'Vista',
            browser: 'Chrome',
            browserVersion: '11.0'
          }, { })
        }
        expect(tester).to.throw(Error)
      })

      it('should fail to create a run of a script session if unsupported capabilities key is provided', function() {
        function tester() {
          platform.runScript('http://www.piaxis.tech', {
            os: 'Windows',
            osVersion: 'Vista',
            browser: 'Chrome',
            browserVersion: '11.0'
          }, {
            abc: 123
          })
        }
        expect(tester).to.throw(Error)
      })

      it('should fail to create a run of a script session if script parameter is not a function', function() {
        function tester() {
          platform.runScript('http://www.piaxis.tech', {
            os: 'Windows',
            osVersion: '10',
            browser: 'Chrome',
            browserVersion: '45.0'
          }, {
          })
        }
        expect(tester).to.throw(': invalid script')
      })

      it('should create a run of a script session if a valid remote url and valid values for all mandatary parameters are provided', function() {
        var saveRun
        var build = utils.buildDetails()
        return platform.runScript('http://www.piaxis.tech', {
          os: 'Windows',
          osVersion: '8',
          browser: 'Chrome',
          browserVersion: '35.0'
        }, {
          build: build.build,
          test: build.name,
          project: build.project
        },
        script)
        .then(run => {
          checkRun(run)
          saveRun = run
          return new Promise(resolve => {
            setTimeout(()=>{resolve(true)}, 20000)
          })
        })
        .then(() => {
          return utils.safeStopScript(platform.runs[saveRun.id].scriptJobs[0])
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should create a run of a script session and tolerate the error thrown by the script if a valid remote url and valid values for all mandatory parameters are provided', function() {
        var saveRun
        var build = utils.buildDetails()
        return platform.runScript('http://www.piaxis.tech', {
          os: 'Windows',
          osVersion: '8',
          browser: 'Chrome',
          browserVersion: '35.0'
        }, {
          screenshots: true,
          build: build.build,
          test: build.name,
          project: build.project
        },
        badScript
        )
        .then(run => {
          checkRun(run)
          saveRun = run
          return new Promise(resolve => {
            setTimeout(()=>{resolve(true)}, 20000)
          })
        })
        .then(() => {
          return utils.safeStopScript(platform.runs[saveRun.id].scriptJobs[0])
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should create a run of a script session if a valid local url and valid values for all mandatory parameters are provided', function() {
        var build = utils.buildDetails()
        return platform.runScript('http://127.0.0.1:3000/tests/pages/tests.html', {
          os: 'Windows',
          osVersion: '8',
          browser: 'Chrome',
          browserVersion: '35.0'
        }, {
          timeout: 60,
          build: build.build,
          test: build.name,
          project: build.project,
          local: true,
          localIdentifier: 'platform-run-scr-1',
          screenshots: true,
          video: true
        },
        script)
        .then(run => {
          checkRun(run)
          return utils.safeStopScript(platform.runs[run.id].scriptJobs[0])
        })
        .then(() => {
          return utils.ensureZeroTunnels()
        })
        .catch(err => {
          if(err.message.match(/is set to true but local testing through BrowserStack is not connected/)) {
            utils.log.warn('tunnel got disconnected in the midst of the script run')
            return true
          }
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

    })

    describe('runScriptMultiple', function() {

      var platform = new Platform()
      platform.stopMonitoring = true
      this.timeout(0)

      it('should fail if no input is provided', function() {
        function tester() {
          platform.runScriptMultiple(undefined)
        }
        expect(tester).to.throw(Error)
      })

      it('should fail to create a run of script sessions if required browser keys are not provided', function() {
        function tester() {
          platform.runScriptMultiple('http://www.piaxis.tech', [{ }], { })
        }
        expect(tester).to.throw(Error)
      })

      it('should fail to create a run of script sessions if script parameter provided is not of function type', function() {
        function tester() {
          platform.runScriptMultiple('http://www.piaxis.tech', [{
            os: 'Windows',
            osVersion: '10',
            browser: 'Chrome',
            browserVersion: '45.0'
          }], {
          })
        }
        expect(tester).to.throw(': invalid script')
      })

      it('should create a run of script sessions if a valid remote url and valid values for all mandatory parameters are provided', function() {
        var saveRun
        var build = utils.buildDetails()
        return platform.runScriptMultiple('http://www.piaxis.tech', [{
          os: 'Windows',
          osVersion: '8',
          browser: 'Chrome',
          browserVersion: '35.0'
        }, {
          os: 'Windows',
          osVersion: '10',
          browser: 'Chrome',
          browserVersion: '40.0'
        }], {
          build: build.build,
          test: build.name,
          project: build.project
        },
        script)
        .then(run => {
          checkRun(run)
          saveRun = run
          return new Promise(resolve => {
            setTimeout(()=>{resolve(true)}, 20000)
          })
        })
        .then(() => {
          let promises = [
            utils.safeStopScript(platform.runs[saveRun.id].scriptJobs[0]),
            utils.safeStopScript(platform.runs[saveRun.id].scriptJobs[1])
          ]
          return Bluebird.all(promises)
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should create a run of script sessions and tolerate errors thrown by scripts run if a valid local url tests and valid values for all mandatory parameters are provided', function() {
        var saveRun
        var build = utils.buildDetails()
        return platform.runScriptMultiple('http://127.0.0.1:3000/tests/pages/tests.html', [{
          os: 'Windows',
          osVersion: '8',
          browser: 'Chrome',
          browserVersion: '35.0'
        }, {
          os: 'Windows',
          osVersion: '10',
          browser: 'Chrome',
          browserVersion: '40.0'
        }], {
          build: build.build,
          test: build.name,
          project: build.project
        },
        badScript
        )
        .then(run => {
          checkRun(run)
          saveRun = run
          return new Promise(resolve => {
            setTimeout(()=>{resolve(true)}, 20000)
          })
        })
        .then(() => {
          let promises = [
            utils.safeStopScript(platform.runs[saveRun.id].scriptJobs[0]),
            utils.safeStopScript(platform.runs[saveRun.id].scriptJobs[1])
          ]
          return Bluebird.all(promises)
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

    })
  }

  describe('stop', function() {

    var platform = new Platform()
    platform.stopMonitoring = true
    this.timeout(0)

    it('should fail for an non-existent run id', function() {
      function tester() {
        platform.stop('1909aoopopo=oioid')
      }
      expect(tester).to.throw(Error)
    })

    it('should successfully stop an ongoing run of test jobs that access a remote url', function() {
      var build = utils.buildDetails()
      return platform.runMultiple('http://www.piaxis.tech', [{
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0',
      }, {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '42.0'
      }], {
        build: build.build,
        test: build.name,
        project: build.project
      })
      .then(run => {
        checkRun(run)
        return platform.stop(run.id)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    if(process.version > 'v6') {
      it('should successfully stop an ongoing run of script jobs that access a remote url', function() {
        var build = utils.buildDetails()
        return platform.runScript('http://www.piaxis.tech', {
          os: 'Windows',
          osVersion: '10',
          browser: 'Chrome',
          browserVersion: '45.0',
        }, {
          screenshots: true,
          build: build.build,
          test: build.name,
          project: build.project
        },
        script)
        .then(run => {
          checkRun(run)
          return platform.stop(run.id)
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })
    }

    it('should successfully take screenshots and stop an ongoing run of test jobs that access a remote url', function() {
      var build = utils.buildDetails()
      return platform.runMultiple('http://www.piaxis.tech', [{
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0',
      }, {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '42.0'
      }], {
        build: build.build,
        test: build.name,
        project: build.project
      })
      .then(run => {
        checkRun(run)
        return platform.stop(run.id, true)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    if(process.version > 'v6') {
      it('should successfully take screenshots and stop an ongoing run of script jobs that access a remote url', function() {
        var build = utils.buildDetails()
        return platform.runScript('http://www.piaxis.tech', {
          os: 'Windows',
          osVersion: '8',
          browser: 'Chrome',
          browserVersion: '35.0',
        }, {
          screenshots: true,
          build: build.build,
          test: build.name,
          project: build.project
        },
        script)
        .then(run => {
          checkRun(run)
          return platform.stop(run.id, true)
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })
    }

    it('should successfully stop an ongoing run of test jobs that access a local url', function() {
      var build = utils.buildDetails()
      return platform.runMultiple('http://127.0.0.1:3000/tests/pages/tests.html', [{
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0',
      }, {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '42.0'
      }], {
        local: true,
        localIdentifier: 'platform-run-mult-1',
        build: build.build,
        test: build.name,
        project: build.project
      })
      .then(run => {
        checkRun(run)
        return platform.stop(run.id)
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
      it('should successfully stop an ongoing run of script jobs that access a local url', function() {
        var build = utils.buildDetails()
        return platform.runScript('http://127.0.0.1:3000/tests/pages/tests.html', {
          os: 'Windows',
          osVersion: '8',
          browser: 'Chrome',
          browserVersion: '35.0',
        }, {
          local: true,
          localIdentifier: 'tunnel-x',
          screenshots: true,
          build: build.build,
          test: build.name,
          project: build.project
        },
        script)
        .then(run => {
          checkRun(run)
          return platform.stop(run.id)
        })
        .then(() => {
          return utils.ensureZeroTunnels()
        })
        .catch(err => {
          if(err.message.match(/is set to true but local testing through BrowserStack is not connected/)) {
            utils.log.warn('tunnel got disconnected in the midst of the script run')
            return true
          }
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })
    }

    it('should successfully stop remaining running test jobs of a run that access a local url after one test job from the run is stopped manually', function() {
      var runId
      var build = utils.buildDetails()
      return platform.runMultiple('http://127.0.0.1:3000/tests/pages/tests.html', [{
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0',
      }, {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '42.0'
      }], {
        local: true,
        localIdentifier: 'my-test-id',
        build: build.build,
        test: build.name,
        project: build.project
      })
      .then(run => {
        checkRun(run)
        runId = run.id
        return platform.runs[runId].jobs[0].stop()
      })
      .then(() => {
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

  })

  describe('status', function() {

    var platform = new Platform()
    platform.stopMonitoring = true
    this.timeout(0)

    it('should fail for an non-existent run id', function() {
      function tester() {
        platform.status('1909aoopopo=oioid')
      }
      expect(tester).to.throw(Error)
    })

    it('should say "running" for an ongoing run of a test job that accesses a remote url', function() {
      var runId
      var build = utils.buildDetails()
      return platform.run('http://www.piaxis.tech', {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0',
      }, {
        build: build.build,
        test: build.name,
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

    if(process.version > 'v6') {
      it('should say "running" for an ongoing run of a script job that accesses a remote url', function() {
        var runId
        var build = utils.buildDetails()
        return platform.runScript('http://www.piaxis.tech', {
          os: 'Windows',
          osVersion: '8',
          browser: 'Chrome',
          browserVersion: '35.0',
        }, {
          screenshots: true,
          build: build.build,
          test: build.name,
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
    }

    it('should say "stopped" for a completed run of a test job that accessed a remote url', function() {
      var runId
      var build = utils.buildDetails()
      return platform.run('http://www.piaxis.tech', {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0',
      }, {
        build: build.build,
        test: build.name,
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

    if(process.version > 'v6') {
      it('should say "stopped" for a completed run of a script job that accessed a remote url', function() {
        var runId
        var build = utils.buildDetails()
        return platform.runScript('http://www.piaxis.tech', {
          os: 'Windows',
          osVersion: '8',
          browser: 'Chrome',
          browserVersion: '35.0',
        }, {
          screenshots: true,
          build: build.build,
          test: build.name,
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
    }

    it('should say "running" for an ongoing run of a test job that accesses a local url', function() {
      var runId
      var build = utils.buildDetails()
      return platform.run('http://127.0.0.1:3000/tests/pages/tests.html', {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0',
      }, {
        local: true,
        localIdentifier: 'platform-run-1',
        build: build.build,
        test: build.name,
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

    if(process.version > 'v6') {
      it('should say "running" for an ongoing run of a script job that accesses a local url', function() {
        var runId
        var build = utils.buildDetails()
        return platform.runScript('http://127.0.0.1:3000/tests/pages/tests.html', {
          os: 'Windows',
          osVersion: '10',
          browser: 'Chrome',
          browserVersion: '45.0',
        }, {
          local: true,
          localIdentifier: 'platform-run-scr-1',
          screenshots: true,
          build: build.build,
          test: build.name,
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
        .then(() => {
          return utils.ensureZeroTunnels()
        })
        .catch(err => {
          if(err.message.match(/is set to true but local testing through BrowserStack is not connected/) ||
            err.message.match(/Process: already stopped/))
          {
            utils.log.warn('tunnel got disconnected in the midst of the script run')
            return true
          }
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })
    }

    it('should say "stopped" for a completed run of a test job that accessed a local url', function() {
      var runId
      var build = utils.buildDetails()
      return platform.run('http://127.0.0.1:3000/tests/pages/tests.html', {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0',
      }, {
        local: true,
        localIdentifier: 'platform-run-1',
        build: build.build,
        test: build.name,
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

    if(process.version > 'v6') {
      it('should say "stopped" for a completed run of a script job that accessed a local url', function() {
        var runId
        var build = utils.buildDetails()
        return platform.runScript('http://127.0.0.1:3000/tests/pages/tests.html', {
          os: 'Windows',
          osVersion: '8',
          browser: 'Chrome',
          browserVersion: '35.0',
        }, {
          local: true,
          localIdentifier: 'platform-run-scr-1',
          screenshots: true,
          build: build.build,
          test: build.name,
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
    }

    it('should say "messy" for an ongoing run of a test job that accesses a local url after the tunnel is stopped manually', function() {
      var runId
      var build = utils.buildDetails()
      return platform.run('http://127.0.0.1:3000/tests/pages/tests.html', {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0',
      }, {
        local: true,
        localIdentifier: 'platform-run-1',
        build: build.build,
        test: build.name,
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
        expect(results.status).to.equal('messy')
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

    if(process.version > 'v6') {
      it('should say "messy" for an ongoing run of a script job that access a local url after the tunnel is stopped manually', function() {
        var runId
        var build = utils.buildDetails()
        return platform.runScript('http://127.0.0.1:3000/tests/pages/tests.html', {
          os: 'Windows',
          osVersion: '8',
          browser: 'Chrome',
          browserVersion: '35.0',
        }, {
          local: true,
          localIdentifier: 'platform-run-scr-1',
          screenshots: true,
          build: build.build,
          test: build.name,
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
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0',
      }, {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '42.0'
      }], {
        build: build.build,
        test: build.name,
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
          os: 'Windows',
          osVersion: '8',
          browser: 'Chrome',
          browserVersion: '36.0',
        }, {
          screenshots: true,
          build: build.build,
          test: build.name,
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
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0',
      }, {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '42.0'
      }], {
        build: build.build,
        test: build.name,
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
          osVersion: '8',
          browser: 'Chrome',
          browserVersion: '35.0',
        }, {
          screenshots: true,
          build: build.build,
          test: build.name,
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
      return platform.runMultiple('http://127.0.0.1:3000/tests/pages/tests.html', [{
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0',
      }, {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '42.0'
      }], {
        local: true,
        localIdentifier: 'platform-run-mult-1',
        build: build.build,
        test: build.name,
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
        return platform.runScript('http://127.0.0.1:3000/tests/pages/tests.html', {
          os: 'Windows',
          osVersion: '8',
          browser: 'Chrome',
          browserVersion: '35.0',
        }, {
          local: true,
          localIdentifier: 'platform-run-scr-1',
          screenshots: true,
          build: build.build,
          test: build.name,
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
      return platform.runMultiple('http://127.0.0.1:3000/tests/pages/tests.html', [{
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0',
      }, {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '42.0'
      }], {
        local: true,
        localIdentifier: 'my-test-id',
        build: build.build,
        test: build.name,
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
        return platform.runScript('http://127.0.0.1:3000/tests/pages/tests.html', {
          os: 'Windows',
          osVersion: '8',
          browser: 'Chrome',
          browserVersion: '35.0'
        }, {
          local: true,
          localIdentifier: 'my-test-id',
          screenshots: true,
          build: build.build,
          test: build.name,
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
      return platform.runMultiple('http://127.0.0.1:3000/tests/pages/tests.html', [{
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0',
      }, {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '42.0'
      }], {
        local: true,
        localIdentifier: 'platform-run-mult-1',
        build: build.build,
        test: build.name,
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
        return platform.runScript('http://127.0.0.1:3000/tests/pages/tests.html', {
          os: 'Windows',
          osVersion: '8',
          browser: 'Chrome',
          browserVersion: '35.0'
        }, {
          local: true,
          localIdentifier: 'my-test-id',
          screenshots: true,
          build: build.build,
          test: build.name,
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
        return platform.runMultiple('http://127.0.0.1:3000/tests/pages/tests.html', [{
          os: 'Windows',
          osVersion: '10',
          browser: 'Chrome',
          browserVersion: '45.0',
        }, {
          os: 'Windows',
          osVersion: '10',
          browser: 'Chrome',
          browserVersion: '42.0'
        }], {
          local: true,
          localIdentifier: 'platform-run-mult-1',
          build: build.build,
          test: build.name,
          project: build.project
        })
        .then(run => {
          checkRun(run)
          fs.chmodSync(BinaryVars.path, '0400')
          return platform.close()
        })
        .catch(err => {
          error = err
          fs.chmodSync(BinaryVars.path, '0755')
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
          return platform.runScriptMultiple('http://127.0.0.1:3000/tests/pages/tests.html', [{
            os: 'Windows',
            osVersion: '10',
            browser: 'Chrome',
            browserVersion: '45.0',
          }, {
            os: 'Windows',
            osVersion: '10',
            browser: 'Chrome',
            browserVersion: '42.0'
          }], {
            local: true,
            localIdentifier: 'platform-run-mult-1',
            build: build.build,
            test: build.name,
            project: build.project
          },
          script)
          .then(run => {
            checkRun(run)
            fs.chmodSync(BinaryVars.path, '0400')
            return platform.close()
          })
          .catch(err => {
            error = err
            fs.chmodSync(BinaryVars.path, '0755')
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

})
