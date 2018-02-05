'use strict';

var
  Bluebird = require('bluebird'),
  retry = require('p-retry'),
  fs = require('fs'),
  chai = require('chai'),
  spies = require('chai-spies'),
  chaiAsPromised = require('chai-as-promised'),
  Env = require('./../../../../../lib/core/env').Env,
  platform = require('./../../../../../lib/platforms/saucelabs/platform'),
  Platform = platform.Platform,
  Manager = require('./../../../../../lib/platforms/saucelabs/manager').Manager,
  ArchiveVars = require('./../../../../../lib/platforms/saucelabs/tunnel/archive').ArchiveVars,
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

  describe('open', function() {

    var platform = new Platform()
    this.timeout(0)

    it('should silently complete if no input is provided', function() {
      return platform.open()
      .should.be.fulfilled
    })

    it('should fail if capabilities input parameter is not of array type', function() {
      function tester() {
        platform.open({ local: true })
      }
      expect(tester).to.throw('capabilitiesArr.forEach is not a function')
    })

    it('should fail if an unsupported capabilities key is provided', function() {
      function tester() {
        platform.open([{
          abc: 123
        }])
      }
      expect(tester).to.throw('option abc is not allowed')
    })

    it('should open the platform by creating a tunnel process without identifier if local capability key is provided', function() {
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

    it('should open the plaform by creating a tunnel process without identifier if local capability key is specified and then monitor and restart the tunnel process if it dies', function() {
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

  })

  if(process.version > 'v6') {

    describe('run', function() {

      var platform = new Platform()
      platform.stopMonitoring = true
      this.timeout(0)

      it('should fail to create a run of a test job if no input is provided', function() {
        return platform.run(undefined, undefined, undefined)
        .should.be.rejectedWith('required option browser missing')
      })

      it('should fail to create a run of a test job if required browser keys are not provided', function() {
        return platform.run('http://www.piaxis.tech', { }, { })
        .should.be.rejectedWith('required option browser missing')
      })

      it('should fail to create a run of a test job if an supported browser key is provided', function() {
        return platform.run('http://www.piaxis.tech', {
          abc: 123,
          os: 'Windows',
          osVersion: '10',
          browser: 'Chrome',
          browserVersion: '31.0'
        }, { })
        .should.be.rejectedWith('option abc is not allowed')
      })

      it('should fail to create a run of a test job if an unspported capabilities key is provided', function() {
        return platform.run('http://www.piaxis.tech', {
          os: 'Windows',
          osVersion: '10',
          browser: 'Chrome',
          browserVersion: '31.0'
        }, {
          abc: 123
        })
        .should.be.rejectedWith('option abc is not allowed')
      })

      it('should create a run of a test job if a remote url and valid values for all mandatory parameters are provided', function() {
        var build = utils.buildDetails()
        return platform.run('http://www.piaxis.tech', {
          os: 'Windows',
          osVersion: '7',
          browser: 'Chrome',
          browserVersion: '32.0'
        }, {
          build: build.build,
          test: build.test,
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

      it('should create a run of a test job if a local url and valid values for all mandatory parameters are provided', function() {
        var build = utils.buildDetails()
        return platform.run('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
          os: 'Windows',
          osVersion: '10',
          browser: 'Firefox',
          browserVersion: '45.0'
        }, {
          timeout: 60,
          local: true,
          localIdentifier: 'platform-run-1',
          screenshots: false,
          video: true,
          build: build.build,
          test: build.test,
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

      it('should create a run of a test job for native runner case if a local url and valid values for all mandatory parameters are provided', function() {
        var build = utils.buildDetails()
        return platform.run('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
          os: 'OS X',
          osVersion: 'Mavericks',
          browser: 'Firefox',
          browserVersion: '39.0'
        }, {
          timeout: 60,
          local: true,
          build: build.build,
          test: build.test,
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

      it('should fail to create a run of test jobs if no input is provided', function() {
        return platform.runMultiple(undefined, undefined, undefined)
        .should.be.rejectedWith('no browsers specified for createMultiple')
      })

      it('should fail to create a run of test jobs if required browser keys are not provided for even one browser', function() {
        return platform.runMultiple('http://www.piaxis.tech', [{
          os: 'Windows',
          osVersion: '10',
          browser: 'Chrome',
          browserVersion: '45.0'
        }, {
          os: 'Windows'
        }], { })
        .should.be.rejectedWith('required option browser missing')
      })

      it('should fail to create a run of test jobs if an unsupported browser key is provided for even one browser', function() {
        return platform.runMultiple('http://www.piaxis.tech', [{
          os: 'Windows',
          osVersion: '7',
          browser: 'Chrome',
          browserVersion: '31.0'
        }, {
          os: 'Windows',
          osVersion: '8',
          browser: 'Chrome',
          browserVersion: '31.0'
          abc: 123
        }], { })
        .should.be.rejectedWith('option abc is not allowed')
      })

      it('should fail to create a run of test jobs if an unsupported capabilities key is provided', function() {
        return platform.runMultiple('http://www.piaxis.tech', [{
          os: 'Windows',
          osVersion: '8',
          browser: 'Chrome',
          browserVersion: '41.0'
        }], {
          abc: 123
        })
        .should.be.rejectedWith('option abc is not allowed')
      })

      it('should create a run of test jobs if a remote url and valid values for all mandatory parameters are provided', function() {
        var runId
        var build = utils.buildDetails()
        return platform.runMultiple('http://www.piaxis.tech', [{
          os: 'OS X',
          osVersion: 'Sierra',
          browser: 'Chrome',
          browserVersion: '45.0'
        }, {
          os: 'Windows',
          osVersion: '8',
          browser: 'Firefox',
          browserVersion: '40.0'
        }], {
          build: build.build,
          test: build.test,
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

      it('should create a run of test jobs if a local url and valid values for all mandatory parameters are provided', function() {
        var runId
        var build = utils.buildDetails()
        return platform.runMultiple('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', [{
          os: 'OS X',
          osVersion: 'Yosemite',
          browser: 'Firefox',
          browserVersion: '39.0'
        }, {
          os: 'Windows',
          osVersion: '7',
          browser: 'Chrome',
          browserVersion: '41.0'
        }], {
          local: true,
          build: build.build,
          test: build.test,
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

      it('should create a run of test jobs for native runner case if a local url and valid values for all mandatory parameters are provided', function() {
        var runId
        var build = utils.buildDetails()
        return platform.runMultiple('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html?_=1414190941', [{
          os: 'Windows',
          osVersion: '10',
          browser: 'Chrome',
          browserVersion: '45.0'
        }, {
          os: 'OS X',
          osVersion: 'Mavericks',
          browser: 'Firefox',
          browserVersion: '37.0'
        }], {
          local: true,
          localIdentifier: 'platform-run-mult-1',
          build: build.build,
          test: build.test,
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

    describe('runScript', function() {

      var platform = new Platform()
      platform.stopMonitoring = true
      this.timeout(0)

      it('should fail to create a run of a script session if no input is provided', function() {
        return platform.runScript(undefined, undefined, undefined, script)
        .should.be.rejectedWith('required option browser missing')
      })

      it('should fail to create a run of a script session if required browser keys are not provided', function() {
        return platform.runScript('http://www.piaxis.tech', { }, { }, script)
        .should.be.rejectedWith('required option browser missing')
      })

      it('should fail to create a run of a script session if an unsupported browser key is provided', function() {
        return platform.runScript('http://www.piaxis.tech', {
          abc: 123,
          os: 'Windows',
          osVersion: '7',
          browser: 'Chrome',
          browserVersion: '31.0'
        }, { }, script)
        .should.be.rejectedWith('option abc is not allowed')
      })

      it('should fail to create a run of a script session if an unsupported capabilities key is provided', function() {
        return platform.runScript('http://www.piaxis.tech', {
          os: 'Windows',
          osVersion: '10',
          browser: 'Chrome',
          browserVersion: '51.0'
        }, {
          abc: 123
        }, script)
        .should.be.rejectedWith('option abc is not allowed')
      })

      it('should fail to create a run of a script session if the script parameter is not of function type', function() {
        expect(()=>{ platform.runScript('http://www.piaxis.tech', {
          os: 'Windows',
          osVersion: '10',
          browser: 'Chrome',
          browserVersion: '45.0'
        }, {
        })})
        .to.throw('invalid script')
      })

      it('should create a run of a script session if a remote url and valid values for all mandatory parameters are provided', function() {
        var saveRun
        var build = utils.buildDetails()
        return platform.runScript('http://www.piaxis.tech', {
          os: 'Android',
          osVersion: '4.4',
          browser: 'Android Browser',
          browserVersion: null,
          device: 'LG Nexus 4 GoogleAPI Emulator'
        }, {
          build: build.build,
          test: build.test,
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

      it('should create a run of a script session and tolerate errors thrown by the script if a remote url and valid values for all mandatory parameters are provided', function() {
        var saveRun
        var build = utils.buildDetails()
        return platform.runScript('http://www.piaxis.tech', {
          os: 'iOS',
          osVersion: '9.3',
          browser: 'Mobile Safari',
          browserVersion: null,
          device: 'iPhone 6s Plus Simulator'
        }, {
          screenshots: true,
          build: build.build,
          test: build.test,
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

      it('should create a run of a script session if a local url and valid values for all mandatory parameters are provided', function() {
        var build = utils.buildDetails()
        return platform.runScript('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
          os: 'Windows',
          osVersion: '8',
          browser: 'Firefox',
          browserVersion: '35.0'
        }, {
          timeout: 60,
          build: build.build,
          test: build.test,
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

      it('should fail to create a run of script sessions if no input is provided', function() {
        expect(()=>{platform.runScriptMultiple(undefined, undefined, undefined, script)})
        .to.throw('no browsers specified for runScriptMultiple')
      })

      it('should fail to create a run of script sessions if required browser keys are not provided', function() {
        return platform.runScriptMultiple('http://www.piaxis.tech', [{ }], { }, script)
        .should.be.rejectedWith('required option browser missing')
      })

      it('should fail to create a run of script sessions if script parameter is not of function type', function() {
        expect(()=>{platform.runScriptMultiple('http://www.piaxis.tech', [{
          os: 'Windows',
          osVersion: '10',
          browser: 'Chrome',
          browserVersion: '45.0'
        }], {
        })})
        .to.throw('invalid script')
      })

      it('should create a run of script sessions if a remote url and valid values for all mandatory parameters are provided', function() {
        var saveRun
        var build = utils.buildDetails()
        return platform.runScriptMultiple('http://www.piaxis.tech', [{
          os: 'Windows',
          osVersion: '8',
          browser: 'Chrome',
          browserVersion: '35.0'
        }, {
          os: 'OS X',
          osVersion: 'Sierra',
          browser: 'Firefox',
          browserVersion: '47.0'
        }], {
          build: build.build,
          test: build.test,
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

      it('should create a run of script sessions and tolerate errors thrown by the script if a local url and valid values for all mandatory parameters are provided', function() {
        var saveRun
        var build = utils.buildDetails()
        return platform.runScriptMultiple('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', [{
          os: 'OS X',
          osVersion: 'Mavericks',
          browser: 'Chrome',
          browserVersion: '39.0'
        }, {
          os: 'Windows',
          osVersion: '7',
          browser: 'Firefox',
          browserVersion: '41.0'
        }], {
          build: build.build,
          test: build.test,
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

    it('should fail if an non-existent run id is provided', function() {
      function tester() {
        platform.stop('1909aoopopo=oioid')
      }
      expect(tester).to.throw('no such run 1909aoopopo=oioid found')
    })

    if(process.version > 'v6') {

      it('should successfully take screenshots of and stop an ongoing run of test jobs accessing a remote url', function() {
        var build = utils.buildDetails()
        return platform.runMultiple('http://www.piaxis.tech', [{
          os: 'Windows',
          osVersion: '10',
          browser: 'Firefox',
          browserVersion: '44.0'
        }, {
          os: 'OS X',
          osVersion: 'Mavericks',
          browser: 'Chrome',
          browserVersion: '34.0'
        }], {
          build: build.build,
          test: build.test,
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

      it('should successfully stop an ongoing run of test jobs that access a local url', function() {
        var build = utils.buildDetails()
        return platform.runMultiple('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', [{
          os: 'Windows',
          osVersion: '7',
          browser: 'Chrome',
          browserVersion: '34.0'
        }, {
          os: 'OS X',
          osVersion: 'El Capitan',
          browser: 'Firefox',
          browserVersion: '32.0'
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
          return utils.ensureZeroTunnels()
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should successfully stop remaining test jobs of an ongoing run that access a local url using a tunnel with identifier after one test job is manually stopped', function() {
        var runId
        var build = utils.buildDetails()
        return platform.runMultiple('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', [{
          os: 'OS X',
          osVersion: 'Sierra',
          browser: 'Firefox',
          browserVersion: '45.0'
        }, {
          os: 'Windows',
          osVersion: '8',
          browser: 'Firefox',
          browserVersion: '38.0'
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

      it('should successfully stop an ongoing run of a script job that accesses a remote url', function() {
        var build = utils.buildDetails()
        return platform.runScript('http://www.piaxis.tech', {
          os: 'Windows',
          osVersion: '10',
          browser: 'Chrome',
          browserVersion: '45.0'
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
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should successfully take screenshots of and stop an ongoing run of a script job that accesses a remote url', function() {
        var build = utils.buildDetails()
        return platform.runScript('http://www.piaxis.tech', {
          os: 'Windows',
          osVersion: '8',
          browser: 'Firefox',
          browserVersion: '35.0'
        }, {
          screenshots: true,
          build: build.build,
          test: build.test,
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

      it('should successfully stop an ongoing run of a script job that accesses a local url', function() {
        var build = utils.buildDetails()
        return platform.runScript('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
          os: 'OS X',
          osVersion: 'Yosemite',
          browser: 'Chrome',
          browserVersion: '45.0'
        }, {
          local: true,
          localIdentifier: 'tunnel-x',
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

})
