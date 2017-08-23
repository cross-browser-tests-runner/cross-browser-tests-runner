'use strict';

var
  chai = require('chai'),
  spies = require('chai-spies'),
  chaiAsPromised = require('chai-as-promised'),
  platform = require('./../../../../../lib/platforms/browserstack/platform'),
  Platform = platform.Platform,
  PlatformVars = platform.PlatformVars,
  PlatformKeys = require('./../../../../../lib/platforms/interfaces/platform').PlatformKeys,
  Tunnel = require('./../../../../../lib/platforms/browserstack/tunnel').Tunnel,
  Manager = require('./../../../../../lib/platforms/browserstack/manager').Manager,
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

describe('browserKeys', function() {

  it('should return all standard keys', function() {
    var keys = Platform.browserKeys(PlatformKeys.browser)
    PlatformKeys.browser.forEach(function(key) {
      expect(keys[key]).to.not.be.undefined
    })
  })

})

describe('capabilitiesKeys', function() {

  it('should return all standard keys', function() {
    var keys = Platform.capabilitiesKeys(PlatformKeys.capabilities)
    PlatformKeys.capabilities.forEach(function(key) {
      expect(keys[key]).to.not.be.undefined
    })
  })

})

describe('required', function() {

  it('should return well formed set of required keys', function() {
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

  it('should silently return if no input is provided', function() {
    return platform.open()
    .should.be.fulfilled
  })

  it('should fail for non-array capabilities', function() {
    function tester() {
      platform.open({ local: true })
    }
    expect(tester).to.throw(Error)
  })

  it('should fail for bad capability key', function() {
    function tester() {
      platform.open([{
        abc: 123
      }])
    }
    expect(tester).to.throw(Error)
  })

  it('should create tunnel without id', function() {
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
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should create tunnel and monitor', function() {
    var spy = chai.spy.on(platform, 'monitor')
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
      return new Promise(resolve => {
        setTimeout(() => {resolve(true)}, PlatformVars.monitorInterval + 500)
      })
    })
    .then(() => {
      spy.should.have.been.called.min(1)
      return platform.tunnels[0].stop()
    })
    .then(() => {
      return new Promise(resolve => {
        setTimeout(() => {resolve(true)}, PlatformVars.monitorInterval + 4000)
      })
    })
    .then(() => {
      spy.should.have.been.called.min(2)
      platform.stopMonitoring = true
      return utils.ensureZeroTunnels()
    })
    .catch(err => {
      if(err && err.message && err.message.match(/Process: already stopped/)) {
        utils.log.warn('did not expect tunnels to be stopped already')
        return true
      }
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should create tunnels with id', function() {
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
      utils.log.error(err)
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

  it('should fail if required browser keys are not provided', function() {
    function tester() {
      platform.run('http://www.piaxis.tech', { }, { })
    }
    expect(tester).to.throw(Error)
  })

  it('should fail for bad browser key', function() {
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

  it('should fail for bad capability key', function() {
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

  it('should create a run for valid remote test', function() {
    return platform.run('http://www.piaxis.tech', {
      os: 'Windows',
      osVersion: '10',
      browser: 'Chrome',
      browserVersion: '45.0'
    }, { }
    )
    .then(run => {
      checkRun(run)
      return utils.safeKillWorker(platform.runs[run.id].workers[0])
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should create a run for valid local test', function() {
    return platform.run('http://localhost:3000/tests/pages/tests.html', {
      os: 'Windows',
      osVersion: '10',
      browser: 'Chrome',
      browserVersion: '45.0'
    }, {
      timeout: 60,
      project: 'cross-browser-test-runner',
      test: 'my-test',
      build: 'my-test-build',
      local: true,
      screenshots: false,
      video: true
    })
    .then(run => {
      checkRun(run)
      return utils.safeKillWorker(platform.runs[run.id].workers[0])
    })
    .then(() => {
      return utils.ensureZeroTunnels()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should create a run for valid local test while reusing running tunnel', function() {
    var existing, tunnel = new Tunnel()
    return tunnel.start()
    .then(() => {
      existing = tunnel.process.pid
      return platform.run('http://localhost:3000/tests/pages/tests.html', {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0'
      }, {
        timeout: 60,
        project: 'cross-browser-test-runner',
        test: 'my-test',
        build: 'my-test-build',
        local: true,
        screenshots: false,
        video: true
      })
    })
    .then(run => {
      checkRun(run)
      expect(platform.runs[run.id].tunnel.process.pid).to.equal(existing)
      return utils.safeKillWorker(platform.runs[run.id].workers[0])
    })
    .then(() => {
      return utils.ensureZeroTunnels()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should create a run for valid local test with tunnel id', function() {
    return platform.run('http://localhost:3000/tests/pages/tests.html', {
      os: 'Windows',
      osVersion: '10',
      browser: 'Chrome',
      browserVersion: '45.0'
    }, {
      timeout: 60,
      project: 'cross-browser-test-runner',
      test: 'my-test',
      build: 'my-test-build',
      local: true,
      localIdentifier: 'tunnel-1',
      screenshots: false,
      video: true
    })
    .then(run => {
      checkRun(run)
      return utils.safeKillWorker(platform.runs[run.id].workers[0])
    })
    .then(() => {
      return utils.ensureZeroTunnels()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should create a run for valid local test with id while reusing running tunnel', function() {
    var existing, tunnel = new Tunnel({ localIdentifier: 'tunnel-1'})
    return tunnel.start()
    .then(() => {
      existing = tunnel.process.pid
      return platform.run('http://localhost:3000/tests/pages/tests.html', {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0'
      }, {
        timeout: 60,
        project: 'cross-browser-test-runner',
        test: 'my-test',
        build: 'my-test-build',
        local: true,
        localIdentifier: 'tunnel-1',
        screenshots: false,
        video: true
      })
    })
    .then(run => {
      checkRun(run)
      expect(platform.runs[run.id].tunnel.process.pid).to.equal(existing)
      return utils.safeKillWorker(platform.runs[run.id].workers[0])
    })
    .then(() => {
      return utils.ensureZeroTunnels()
    })
    .catch(err => {
      utils.log.error(err)
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

  it('should fail if required browser keys are not provided for even one test', function() {
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

  it('should fail for bad browser key', function() {
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

  it('should fail for bad capability key', function() {
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

  it('should create a run for two valid remote tests', function() {
    var runId
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
    }], { }
    )
    .then(run => {
      checkRun(run)
      runId = run.id
      return Promise.all([
        utils.safeKillWorker(platform.runs[runId].workers[0]),
        utils.safeKillWorker(platform.runs[runId].workers[1])
      ])
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should create a run for two valid local tests', function() {
    var runId
    return platform.runMultiple('http://localhost:3000/tests/pages/tests.html', [{
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
      local: true
    })
    .then(run => {
      checkRun(run)
      runId = run.id
      return Promise.all([
        utils.safeKillWorker(platform.runs[runId].workers[0]),
        utils.safeKillWorker(platform.runs[runId].workers[1])
      ])
    })
    .then(() => {
      return utils.ensureZeroTunnels()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should create a run for two valid local tests while using existing tunnel', function() {
    var runId, existing, tunnel = new Tunnel()
    return tunnel.start()
    .then(() => {
      existing = tunnel.process.pid
      return platform.runMultiple('http://localhost:3000/tests/pages/tests.html', [{
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
        local: true
      })
    })
    .then(run => {
      checkRun(run)
      runId = run.id
      expect(platform.runs[runId].tunnel.process.pid).to.equal(existing)
      return Promise.all([
        utils.safeKillWorker(platform.runs[runId].workers[0]),
        utils.safeKillWorker(platform.runs[runId].workers[1])
      ])
    })
    .then(() => {
      return utils.ensureZeroTunnels()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should create a run for two valid local tests with tunnel id', function() {
    var runId
    return platform.runMultiple('http://localhost:3000/tests/pages/tests.html', [{
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
      localIdentifier: 'my-test-id'
    })
    .then(run => {
      checkRun(run)
      runId = run.id
      return Promise.all([
        utils.safeKillWorker(platform.runs[runId].workers[0]),
        utils.safeKillWorker(platform.runs[runId].workers[1])
      ])
    })
    .then(() => {
      return utils.ensureZeroTunnels()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should create a run for two valid local tests with tunnel id while using existing tunnel', function() {
    var runId, existing, tunnel = new Tunnel({localIdentifier: 'my-test-id'})
    return tunnel.start()
    .then(() => {
      existing = tunnel.process.pid
      return platform.runMultiple('http://localhost:3000/tests/pages/tests.html', [{
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
        localIdentifier: 'my-test-id'
      })
    })
    .then(run => {
      checkRun(run)
      runId = run.id
      expect(platform.runs[runId].tunnel.process.pid).to.equal(existing)
      return Promise.all([
        utils.safeKillWorker(platform.runs[runId].workers[0]),
        utils.safeKillWorker(platform.runs[runId].workers[1])
      ])
    })
    .then(() => {
      return utils.ensureZeroTunnels()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

})

describe('stop', function() {

  var platform = new Platform()
  platform.stopMonitoring = true
  this.timeout(0)

  it('should fail for an invalid run id', function() {
    function tester() {
      platform.stop('1909aoopopo=oioid')
    }
    expect(tester).to.throw(Error)
  })

  it('should stop an ongoing run of remote tests', function() {
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
    })
    .then(run => {
      checkRun(run)
      return platform.stop(run.id)
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should stop an ongoing run of remote tests and take screenshots', function() {
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
    })
    .then(run => {
      checkRun(run)
      return platform.stop(run.id, true)
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should stop an ongoing run of local tests', function() {
    return platform.runMultiple('http://localhost:3000/tests/pages/tests.html', [{
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
      local: true
    })
    .then(run => {
      checkRun(run)
      return platform.stop(run.id)
    })
    .then(() => {
      return utils.ensureZeroTunnels()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should stop an ongoing run of local tests and take screenshots', function() {
    return platform.runMultiple('http://localhost:3000/tests/pages/tests.html', [{
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
      local: true
    })
    .then(run => {
      checkRun(run)
      return platform.stop(run.id, true)
    })
    .then(() => {
      return utils.ensureZeroTunnels()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should stop an ongoing run of local tests with id with one test already stopped/completed', function() {
    var runId
    return platform.runMultiple('http://localhost:3000/tests/pages/tests.html', [{
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
      localIdentifier: 'my-test-id'
    })
    .then(run => {
      checkRun(run)
      runId = run.id
      return platform.runs[runId].workers[0].terminate()
    })
    .then(() => {
      return platform.stop(runId)
    })
    .then(() => {
      return utils.ensureZeroTunnels()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

})

describe('status', function() {

  var platform = new Platform()
  platform.stopMonitoring = true
  this.timeout(0)

  it('should fail for an invalid run id', function() {
    function tester() {
      platform.status('1909aoopopo=oioid')
    }
    expect(tester).to.throw(Error)
  })

  it('should say running for an ongoing remote test', function() {
    var runId
    return platform.run('http://www.piaxis.tech', {
      os: 'Windows',
      osVersion: '10',
      browser: 'Chrome',
      browserVersion: '45.0',
    }, {
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
      expect(results.workers).to.not.be.undefined
      expect(results.workers).to.have.lengthOf(1)
      expect(results.workers[0]).to.be.oneOf(['running', 'queue'])
      expect(results.tunnel).to.equal('none')
      return platform.stop(runId)
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should say stopped for a stopped remote test', function() {
    var runId
    return platform.run('http://www.piaxis.tech', {
      os: 'Windows',
      osVersion: '10',
      browser: 'Chrome',
      browserVersion: '45.0',
    }, {
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
      expect(results.workers).to.not.be.undefined
      expect(results.workers).to.have.lengthOf(1)
      if('terminated' !== results.workers[0]) {
        utils.log.warn('expected worker status to be terminated')
      }
      expect(results.tunnel).to.equal('none')
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should say running for an ongoing local test', function() {
    var runId
    return platform.run('http://localhost:3000/tests/pages/tests.html', {
      os: 'Windows',
      osVersion: '10',
      browser: 'Chrome',
      browserVersion: '45.0',
    }, {
      local: true
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
      expect(results.workers).to.not.be.undefined
      expect(results.workers).to.have.lengthOf(1)
      expect(results.workers[0]).to.be.oneOf(['running', 'queue'])
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
        utils.log.error(err)
        throw err
      }
    })
    .should.be.fulfilled
  })

  it('should say stopped for a stopped local test', function() {
    var runId
    return platform.run('http://localhost:3000/tests/pages/tests.html', {
      os: 'Windows',
      osVersion: '10',
      browser: 'Chrome',
      browserVersion: '45.0',
    }, {
      local: true
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
      expect(results.workers).to.not.be.undefined
      expect(results.workers).to.have.lengthOf(1)
      if('terminated' !== results.workers[0]) {
        utils.log.warn('expected worker status to be terminated')
      }
      expect(results.tunnel).to.not.be.undefined
      if('running' !== results.tunnel) {
        utils.log.warn('expected tunnel to be running')
      }
      return utils.ensureZeroTunnels()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should say messy for a local test with its tunnel stopped', function() {
    var runId
    return platform.run('http://localhost:3000/tests/pages/tests.html', {
      os: 'Windows',
      osVersion: '10',
      browser: 'Chrome',
      browserVersion: '45.0',
    }, {
      local: true
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
      expect(results.workers).to.not.be.undefined
      expect(results.workers).to.have.lengthOf(1)
      expect(results.tunnel).to.not.be.undefined
      expect(results.tunnel).to.equal('stopped')
      return platform.stop(runId)
    })
    .then(() => {
      return utils.ensureZeroTunnels()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

})

describe('close', function() {

  var platform = new Platform()
  this.timeout(0)

  it('should silently close in case of no runs', function() {
    return platform.close()
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should stop an ongoing run of remote tests', function() {
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
    })
    .then(run => {
      checkRun(run)
      return platform.close()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should stop an ongoing run of remote tests and take screenshots', function() {
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
    })
    .then(run => {
      checkRun(run)
      return platform.close(true)
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should close silently after stopping an ongoing run of remote tests', function() {
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
    })
    .then(run => {
      checkRun(run)
      return platform.stop(run.id)
    })
    .then(() => {
      return platform.close()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should stop an ongoing run of local tests', function() {
    return platform.runMultiple('http://localhost:3000/tests/pages/tests.html', [{
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
      local: true
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
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should stop an ongoing run of local tests and take screenshots', function() {
    return platform.runMultiple('http://localhost:3000/tests/pages/tests.html', [{
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
      local: true
    })
    .then(run => {
      checkRun(run)
      return platform.close(true)
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
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should stop tunnels after stopping an ongoing run of local tests', function() {
    return platform.runMultiple('http://localhost:3000/tests/pages/tests.html', [{
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
      local: true
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
      return utils.ensureZeroTunnels()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should stop an ongoing run of local tests with id with one test already stopped/completed', function() {
    var runId
    return platform.runMultiple('http://localhost:3000/tests/pages/tests.html', [{
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
      localIdentifier: 'my-test-id'
    })
    .then(run => {
      checkRun(run)
      runId = run.id
      return platform.runs[runId].workers[0].terminate()
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
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

})
