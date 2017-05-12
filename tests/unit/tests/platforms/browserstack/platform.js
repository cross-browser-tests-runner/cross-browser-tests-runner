var
  expect = require('chai').expect,
  platform = require('./../../../../../lib/platforms/browserstack/platform'),
  Platform = platform.Platform,
  PlatformVars = platform.PlatformVars,
  Manager = require('./../../../../../lib/platforms/browserstack/manager').Manager,
  PlatformKeys = require('./../../../../../lib/platforms/interfaces/platform').PlatformKeys,
  utils = require('./utils')

describe('browserKeys', function() {

  var platform = new Platform()

  it('should return all standard keys', function() {
    keys = platform.browserKeys(PlatformKeys.browser)
    PlatformKeys.browser.forEach(function(key) {
      expect(keys[key]).to.be.defined
    })
  })

})

describe('capabilitiesKeys', function() {

  var platform = new Platform()

  it('should return all standard keys', function() {
    keys = platform.capabilitiesKeys(PlatformKeys.capabilities)
    PlatformKeys.capabilities.forEach(function(key) {
      expect(keys[key]).to.be.defined
    })
  })

})

describe('required', function() {

  var platform = new Platform()

  it('should return well formed set of required keys', function() {
    required = platform.required
    expect(required.browser).to.be.defined
    expect(required.browser).to.be.an('Array')
    expect(required.capabilities).to.be.defined
    expect(required.capabilities).to.be.an('Array')
  })

})

describe('run', function() {

  var platform = new Platform(), timer

  function done() {
  }

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

  it('should create a run for valid remote test', function(done) {
    this.timeout(40000)
    timer = setTimeout(done, 39000)
    platform.run('http://www.piaxis.tech', {
      os: 'Windows',
      osVersion: '10',
      browser: 'Chrome',
      browserVersion: '45.0'
    }, { }
    )
    .then(run => {
      clearTimeout(timer)
      expect(run).to.be.defined
      expect(run.id).to.be.defined
      expect(run.id).to.be.a('string')
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should create a run for valid local test', function(done) {
    this.timeout(40000)
    timer = setTimeout(done, 39000)
    platform.run('http://localhost:3000/tests/pages/tests.html', {
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
      expect(run).to.be.defined
      expect(run.id).to.be.defined
      expect(run.id).to.be.a('string')
      return Manager.running()
    })
    .then(procs => {
      procs.forEach(proc => {
        utils.stopProc(proc.pid)
      })
      return utils.awaitZeroTunnels()
    })
    .then(num => {
      clearTimeout(timer)
      expect(num).to.equal(0)
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

})

describe('runMultiple', function() {

  var platform = new Platform(), timer

  function done() {
  }

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

  it('should create a run for two valid remote tests', function(done) {
    this.timeout(40000)
    timer = setTimeout(done, 39000)
    platform.runMultiple('http://www.piaxis.tech', [{
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
      clearTimeout(timer)
      expect(run).to.be.defined
      expect(run.id).to.be.defined
      expect(run.id).to.be.a('string')
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should create a run for two valid local tests', function(done) {
    this.timeout(40000)
    timer = setTimeout(done, 39000)
    platform.runMultiple('http://localhost:3000/tests/pages/tests.html', [{
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
      expect(run).to.be.defined
      expect(run.id).to.be.defined
      expect(run.id).to.be.a('string')
      return Manager.running()
    })
    .then(procs => {
      procs.forEach(proc => {
        utils.stopProc(proc.pid)
      })
      return utils.awaitZeroTunnels()
    })
    .then(num => {
      clearTimeout(timer)
      expect(num).to.equal(0)
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should create a run for two valid local tests with tunnel id', function(done) {
    this.timeout(40000)
    timer = setTimeout(done, 39000)
    platform.runMultiple('http://localhost:3000/tests/pages/tests.html', [{
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
      expect(run).to.be.defined
      expect(run.id).to.be.defined
      expect(run.id).to.be.a('string')
      return Manager.running()
    })
    .then(procs => {
      procs.forEach(proc => {
        utils.stopProc(proc.pid)
      })
      return utils.awaitZeroTunnels()
    })
    .then(num => {
      clearTimeout(timer)
      expect(num).to.equal(0)
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

})
