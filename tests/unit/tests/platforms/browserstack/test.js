var
  expect = require('chai').expect,
  sleep = require('sleep'),
  Test = require('./../../../../../lib/platforms/browserstack/test').Test,
  Manager = require('./../../../../../lib/platforms/browserstack/manager').Manager,
  utils = require('./utils')

describe('create', function() {

  var test, timer

  function done() {
  }

  it('should fail in case of invalid authorization', function(done) {
    this.timeout(20000)
    timer = setTimeout(done, 19000)
    test = new Test()
    test.create({
      username: 'abc',
      accessKey: 'abc'
    })
    .catch(error => {
      clearTimeout(timer)
      expect(error.message).to.contain('Basic: Access denied')
      expect(test.tunnel).to.not.be.defined
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should fail with no capabilities provided', function(done) {
    this.timeout(20000)
    timer = setTimeout(done, 19000)
    test = new Test()
    test.create({ })
    .catch(error => {
      clearTimeout(timer)
      expect(error.message).to.contain('422 - {"message":"Validation Failed"')
      expect(test.tunnel).to.not.be.defined
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should create a remote url test', function(done) {
    this.timeout(20000)
    timer = setTimeout(done, 19000)
    test = new Test()
    test.create(
    {
      os : 'Windows',
      os_version : '10',
      url : 'http://www.piaxis.tech',
      browser : 'chrome',
      browser_version : '45.0',
    })
    .then(() => {
      clearTimeout(timer)
      expect(test.worker).to.be.defined
      expect(test.worker.id).to.be.defined
      expect(test.tunnel).to.not.be.defined
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should create a local url test and start a tunnel', function(done) {
    this.timeout(40000)
    timer = setTimeout(done, 39000)
    test = new Test()
    test.create(
    {
      os : 'Windows',
      os_version : '10',
      url : 'http://localhost:3000/tests/pages/tests.html',
      browser : 'chrome',
      browser_version : '45.0',
      'browserstack.local' : true
    })
    .then(() => {
      clearTimeout(timer)
      expect(test.worker).to.be.defined
      expect(test.worker.id).to.be.defined
      expect(test.tunnel).to.be.defined
      expect(test.tunnel.process).to.be.defined
      expect(test.tunnel.process.pid).to.be.defined
      expect(test.tunnel.tunnelId).to.not.be.defined
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should create a local url test and reuse existing tunnel', function(done) {
    this.timeout(40000)
    timer = setTimeout(done, 39000)
    var runningPid
    Manager.withoutId()
    .then(procs => {
      runningPid = procs[0].pid
      return true
    })
    .then(() => {
      test = new Test()
      return test.create(
      {
        os : 'Windows',
        os_version : '10',
        url : 'http://localhost:3000/tests/pages/tests.html',
        browser : 'chrome',
        browser_version : '45.0',
        'browserstack.local' : true,
        'browserstack.debug' : true,
        'browserstack.video' : true,
        project: 'cross-browser-test-runner',
        build: 'initial',
        name: 'my-js-test'
      })
    })
    .then(() => {
      clearTimeout(timer)
      expect(test.worker).to.be.defined
      expect(test.worker.id).to.be.defined
      expect(test.tunnel).to.be.defined
      expect(test.tunnel.process).to.be.defined
      expect(test.tunnel.process.pid).to.equal(runningPid)
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should create a local url test with identifier while killing existing tunnel', function(done) {
    this.timeout(40000)
    timer = setTimeout(done, 39000)
    var runningPid
    Manager.withoutId()
    .then(procs => {
      runningPid = procs[0].pid
      return true
    })
    .then(() => {
      test = new Test()
      return test.create(
      {
        os : 'Windows',
        os_version : '10',
        url : 'http://localhost:3000/tests/pages/tests.html',
        browser : 'chrome',
        browser_version : '45.0',
        'browserstack.local' : true,
        'browserstack.localIdentifier' : 'my-tunnel-1',
      })
    })
    .then(() => {
      expect(test.worker).to.be.defined
      expect(test.worker.id).to.be.defined
      expect(test.tunnel).to.be.defined
      expect(test.tunnel.process).to.be.defined
      expect(test.tunnel.process.pid).to.not.equal(runningPid)
      process.kill(runningPid, 0)
    })
    .catch(err => {
      clearTimeout(timer)
      expect(err.message).to.contain('kill ESRCH')
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should create a local url test with identifier reusing existing tunnel with same id', function(done) {
    this.timeout(40000)
    timer = setTimeout(done, 39000)
    var runningPid, runningTid
    Manager.withId()
    .then(procs => {
      runningPid = procs[0].pid
      runningTid = procs[0].tunnelId
      return true
    })
    .then(() => {
      test = new Test()
      return test.create(
      {
        os : 'Windows',
        os_version : '10',
        url : 'http://localhost:3000/tests/pages/tests.html',
        browser : 'chrome',
        browser_version : '45.0',
        'browserstack.local' : true,
        'browserstack.localIdentifier' : 'my-tunnel-1',
      })
    })
    .then(() => {
      clearTimeout(timer)
      expect(test.worker).to.be.defined
      expect(test.worker.id).to.be.defined
      expect(test.tunnel).to.be.defined
      expect(test.tunnel.process).to.be.defined
      expect(test.tunnel.process.pid).to.equal(runningPid)
      expect(test.tunnel.process.tunnelId).to.equal(runningTid)
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should create a local url test with identifier keeping existing tunnel with different id', function(done) {
    this.timeout(40000)
    timer = setTimeout(done, 39000)
    var runningPid, runningTid
    Manager.withId()
    .then(procs => {
      runningPid = procs[0].pid
      runningTid = procs[0].tunnelId
      return true
    })
    .then(() => {
      test = new Test()
      return test.create(
      {
        os : 'Windows',
        os_version : '10',
        url : 'http://localhost:3000/tests/pages/tests.html',
        browser : 'chrome',
        browser_version : '45.0',
        'browserstack.local' : true,
        'browserstack.localIdentifier' : 'my-tunnel-2',
      })
    })
    .then(() => {
      expect(test.worker).to.be.defined
      expect(test.worker.id).to.be.defined
      expect(test.tunnel).to.be.defined
      expect(test.tunnel.process).to.be.defined
      expect(test.tunnel.process.pid).to.not.equal(runningPid)
      expect(test.tunnel.process.tunnelId).to.not.equal(runningTid)
      utils.stopProc(runningPid)
      utils.stopProc(test.tunnel.process.pid)
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

describe('status', function() {

  var test, timer

  function done() {
  }

  it('should give running status for a valid remote test', function(done) {
    this.timeout(20000)
    timer = setTimeout(done, 19000)
    test = new Test()
    test.create(
    {
      os : 'Windows',
      os_version : '10',
      url : 'http://www.piaxis.tech',
      browser : 'chrome',
      browser_version : '45.0',
    })
    .then(() => {
      return test.status()
    })
    .then(results => {
      clearTimeout(timer)
      expect(results).to.be.defined
      expect(results.worker).to.be.defined
      expect(results.worker).to.be.oneOf(['running','queue'])
      expect(results.tunnel).to.be.undefined
      expect(results.status).to.be.defined
      expect(results.status).to.equal('running')
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should give running status for a valid local test without tunnel id', function(done) {
    this.timeout(40000)
    timer = setTimeout(done, 39000)
    test = new Test()
    test.create(
    {
      os : 'Windows',
      os_version : '10',
      url : 'http://localhost:3000/tests/pages/tests.html',
      browser : 'chrome',
      browser_version : '45.0',
      'browserstack.local': true
    })
    .then(() => {
      return test.status()
    })
    .then(results => {
      clearTimeout(timer)
      expect(results).to.be.defined
      expect(results.worker).to.be.defined
      expect(results.worker).to.be.oneOf(['running','queue'])
      expect(results.tunnel).to.be.defined
      expect(results.tunnel).to.equal('running')
      expect(results.status).to.be.defined
      expect(results.status).to.equal('running')
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should give running status for a valid local test with tunnel id', function(done) {
    this.timeout(40000)
    timer = setTimeout(done, 39000)
    test = new Test()
    test.create(
    {
      os : 'Windows',
      os_version : '10',
      url : 'http://localhost:3000/tests/pages/tests.html',
      browser : 'chrome',
      browser_version : '45.0',
      'browserstack.local': true,
      'browserstack.localIdentifier': 'my-tunnel-id'
    })
    .then(() => {
      return test.status()
    })
    .then(results => {
      expect(results).to.be.defined
      expect(results.worker).to.be.defined
      expect(results.worker).to.be.oneOf(['running','queue'])
      expect(results.tunnel).to.be.defined
      expect(results.tunnel).to.equal('running')
      expect(results.status).to.be.defined
      expect(results.status).to.equal('running')
      utils.stopProc(test.tunnel.process.pid)
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

  it('should give stopped status for a valid remote test once worker is stopped', function(done) {
    this.timeout(40000)
    timer = setTimeout(done, 39000)
    test = new Test()
    test.create(
    {
      os : 'Windows',
      os_version : '10',
      url : 'http://www.piaxis.tech',
      browser : 'chrome',
      browser_version : '45.0',
    })
    .then(() => {
      return test.worker.terminate()
    })
    .then(() => {
      return test.status()
    })
    .then(results => {
      clearTimeout(timer)
      expect(results).to.be.defined
      expect(results.worker).to.be.defined
      expect(results.worker).to.equal('terminated')
      expect(results.tunnel).to.be.undefined
      expect(results.status).to.be.defined
      expect(results.status).to.equal('stopped')
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should give stopped status for a local test once worker is stopped', function(done) {
    this.timeout(40000)
    timer = setTimeout(done, 39000)
    test = new Test()
    test.create(
    {
      os : 'Windows',
      os_version : '10',
      url : 'http://www.piaxis.tech',
      browser : 'chrome',
      browser_version : '45.0',
      'browserstack.local': true
    })
    .then(() => {
      return test.worker.terminate()
    })
    .then(() => {
      return test.status()
    })
    .then(results => {
      expect(results).to.be.defined
      expect(results.worker).to.be.defined
      expect(results.worker).to.equal('terminated')
      expect(results.tunnel).to.be.defined
      expect(results.tunnel).to.equal('running')
      expect(results.status).to.be.defined
      expect(results.status).to.equal('stopped')
      utils.stopProc(test.tunnel.process.pid)
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

  it('should give messy status for a local test once tunnel is stopped', function(done) {
    this.timeout(40000)
    timer = setTimeout(done, 39000)
    test = new Test()
    test.create(
    {
      os : 'Windows',
      os_version : '10',
      url : 'http://www.piaxis.tech',
      browser : 'chrome',
      browser_version : '45.0',
      'browserstack.local': true
    })
    .then(() => {
      return test.tunnel.stop()
    })
    .then(() => {
      return test.status()
    })
    .then(results => {
      expect(results).to.be.defined
      expect(results.worker).to.be.defined
      expect(results.worker).to.be.oneOf(['running', 'queue'])
      expect(results.tunnel).to.be.defined
      expect(results.tunnel).to.equal('stopped')
      expect(results.status).to.be.defined
      expect(results.status).to.equal('messy')
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

describe('stop', function() {

  var test, timer

  function done() {
  }

  it('should throw an error if not started yet', function() {
    test = new Test()
    function tester() {
      test.stop()
    }
    expect(tester).to.throw(Error)
  })

  it('should terminate a running remote url test', function(done) {
    this.timeout(80000)
    timer = setTimeout(done, 79000)
    test = new Test()
    test.create(
    {
      os : 'Windows',
      os_version : '10',
      url : 'http://www.piaxis.tech',
      browser : 'chrome',
      browser_version : '45.0',
    })
    .then(() => {
      return test.stop()
    })
    .then(() => {
      return test.status()
    })
    .then(results => {
      clearTimeout(timer)
      expect(results).to.be.defined
      expect(results.tunnel).to.not.be.defined
      expect(results.worker).to.be.defined
      expect(results.worker).to.equal('terminated')
      expect(results.status).to.be.defined
      expect(results.status).to.equal('stopped')
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should terminate a running local url test', function(done) {
    this.timeout(80000)
    timer = setTimeout(done, 79000)
    test = new Test()
    test.create(
    {
      os : 'Windows',
      os_version : '10',
      url : 'http://localhost:3000/tests/pages/tests.html',
      browser : 'chrome',
      browser_version : '45.0',
      'browserstack.local': true
    })
    .then(() => {
      return test.stop()
    })
    .then(() => {
      return test.status()
    })
    .then(results => {
      expect(results).to.be.defined
      expect(results.tunnel).to.be.defined
      expect(results.tunnel).to.equal('stopped')
      expect(results.worker).to.be.defined
      expect(results.worker).to.equal('terminated')
      expect(results.status).to.be.defined
      expect(results.status).to.equal('stopped')
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

  it('should fail to stop if already stopped', function(done) {
    this.timeout(80000)
    timer = setTimeout(done, 79000)
    test = new Test()
    test.create(
    {
      os : 'Windows',
      os_version : '10',
      url : 'http://www.piaxis.tech',
      browser : 'chrome',
      browser_version : '45.0',
    })
    .then(() => {
      return test.stop()
    })
    .then(() => {
      return test.stop()
    })
    .catch(error => {
      expect(error.message).to.contain('already stopped')
      clearTimeout(timer)
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

})
