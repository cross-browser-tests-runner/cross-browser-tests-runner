var
  fs = require('fs'),
  nock = require('nock'),
  expect = require('chai').expect,
  sleep = require('sleep'),
  Tunnel = require('./../../../../../lib/platforms/browserstack/tunnel').Tunnel,
  Manager = require('./../../../../../lib/platforms/browserstack/manager').Manager,
  BinaryVars = require('./../../../../../lib/platforms/browserstack/tunnel/binary').BinaryVars,
  utils = require('./utils')

describe('check', function() {

  var tunnel

  it('should convert object arg to hyphen separated lowercase', function() {
    tunnel = new Tunnel()
    var args = tunnel.check({ proxy : { host : '127.0.0.1', port : 2301 } })
    expect(args.indexOf('--proxy-host')).to.not.equal(-1)
    expect(args.indexOf('--proxy-port')).to.not.equal(-1)
    expect(args.indexOf('--proxy')).to.equal(-1)
    expect(args.indexOf('--host')).to.equal(-1)
    expect(args.indexOf('--port')).to.equal(-1)
  })

  it('must always include "--key" argument', function() {
    tunnel = new Tunnel()
    var args = tunnel.check({ })
    expect(args.indexOf('--key')).to.not.equal(-1)
  })

})

describe('remove', function() {

  if(!BinaryVars.isWindows) {
    // @TODO temporarily disabled on Windows
    it('should remove the local binary', function(done) {
      this.timeout(10000)
      var timer = setTimeout(done, 9000)
      var tunnel = new Tunnel()
      tunnel.remove()
      .then(() => {
        fs.stat(BinaryVars.path, function(err, stat) {
          clearTimeout(timer)
          expect(err).to.be.defined
          expect(err.code).to.equal('ENOENT')
          done()
        })
      })
      .catch(err => {
        clearTimeout(timer)
        console.error('UNEXPECTED ERROR >>', err)
        throw err
      })
    })
  }
})

describe('fetch', function() {

  var tunnel = null

  function done() {
  }

  it('should be able to download the tunnel binary', function(done) {
    this.timeout(1010000)
    timer = setTimeout(function(){done()}, 1005000)
    tunnel = new Tunnel()
    tunnel.fetch()
    .then(() => {
      clearTimeout(timer)
      expect(fs.existsSync(BinaryVars.path)).to.be.true
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  var statBefore = null

  it('should not attempt downloading if the binary exists', function(done) {
    this.timeout(50000)
    var timer = setTimeout(function(){done()}, 45000)
    statBefore = fs.statSync(BinaryVars.path)
    tunnel = new Tunnel()
    tunnel.fetch()
    .then(() => {
      clearTimeout(timer)
      var statAfter = fs.statSync(BinaryVars.path)
      expect(statBefore).to.not.be.null
      expect(statBefore.ctime).to.deep.equal(statAfter.ctime)
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

})

describe('start', function() {

  var tunnel = null

  function done() {
  }

  it('should be able to start multiple tunnels with local identifiers', function(done) {
    this.timeout(60000)
    timer = setTimeout(done, 59000)
    var tunnel1 = new Tunnel({ localIdentifier: 'test-local-id-1'})
    var tunnel2 = new Tunnel({ localIdentifier: 'test-local-id-2'})
    var tunnel3 = new Tunnel({ localIdentifier: 'test-local-id-3'})
    tunnel1.start()
    .then(() => {
      return tunnel2.start()
    })
    .then(() => {
      return tunnel3.start()
    })
    .then(() => {
      expect(tunnel1).to.not.be.null
      expect(tunnel1.process.pid).to.be.defined
      expect(tunnel1.process.tunnelId).to.be.defined
      expect(tunnel1.process.tunnelId).to.equal('test-local-id-1')
      expect(tunnel2).to.not.be.null
      expect(tunnel2.process.pid).to.be.defined
      expect(tunnel2.process.tunnelId).to.be.defined
      expect(tunnel2.process.tunnelId).to.equal('test-local-id-2')
      expect(tunnel3).to.not.be.null
      expect(tunnel3.process.pid).to.be.defined
      expect(tunnel3.process.tunnelId).to.be.defined
      expect(tunnel3.process.tunnelId).to.equal('test-local-id-3')
      utils.stopProc(tunnel1.process.pid)
      utils.stopProc(tunnel2.process.pid)
      utils.stopProc(tunnel3.process.pid)
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

  it('should fail if starting one without local identifier after one with local identifier exists', function(done) {
    this.timeout(40000)
    timer = setTimeout(done, 39000)
    var tunnel1 = new Tunnel({ localIdentifier : 'test-local-id'})
    var tunnel2 = new Tunnel({ })
    tunnel1.start()
    .then(() => {
      return tunnel2.start()
    })
    .catch(error => {
      expect(error.message).to.contain('Tunnel: attempt to start a tunnel without a local identifier is not allowed when a tunnel process with a local identifier exists')
      expect(tunnel1).to.not.be.null
      expect(tunnel1.process.pid).to.be.defined
      expect(tunnel1.process.tunnelId).to.be.defined
      expect(tunnel1.process.tunnelId).to.equal('test-local-id')
      expect(tunnel2).to.not.be.null
      expect(tunnel2.process.pid).to.not.be.defined
      expect(tunnel2.process.tunnelId).to.not.be.defined
      utils.stopProc(tunnel1.process.pid)
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

  it('should stop tunnel without local identifier before starting one with local identifier', function(done) {
    this.timeout(40000)
    timer = setTimeout(done, 39000)
    var tunnel1 = new Tunnel()
    var tunnel2 = new Tunnel({ localIdentifier : 'test-local-id'})
    var savePid
    tunnel1.start()
    .then(() => {
      expect(tunnel1).to.not.be.null
      expect(tunnel1.process.pid).to.be.defined
      expect(tunnel1.process.tunnelId).to.not.be.defined
      savePid = parseInt(tunnel1.process.pid.toString())
      return tunnel2.start()
    })
    .then(() => {
      expect(tunnel2).to.not.be.null
      expect(tunnel2.process.pid).to.be.defined
      expect(tunnel2.process.tunnelId).to.be.defined
      expect(tunnel2.process.tunnelId).to.equal('test-local-id')
      utils.stopProc(tunnel2.process.pid)
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

  it('should abort when stopping tunnel without local identifier before starting one with local identifier is not successful', function(done) {
    this.timeout(40000)
    timer = setTimeout(done, 39000)
    var tunnel1 = new Tunnel()
    var tunnel2 = new Tunnel({ localIdentifier : 'test-local-id'})
    tunnel1.start()
    .then(() => {
      expect(tunnel1).to.not.be.null
      expect(tunnel1.process.pid).to.be.defined
      expect(tunnel1.process.tunnelId).to.not.be.defined
      process.env.UNIT_TESTS_CAUSE_TROUBLE_1=true
      return tunnel2.start()
    })
    .catch(err => {
      delete process.env.UNIT_TESTS_CAUSE_TROUBLE_1
      expect(err.message).to.contain('processes without id remain after more than 5 seconds')
      expect(tunnel2).to.not.be.null
      expect(tunnel2.process.pid).to.not.be.defined
      return Manager.running()
    })
    .then(procs => {
      delete process.env.UNIT_TESTS_CAUSE_TROUBLE_1
      procs.forEach(p => {
        utils.stopProc(p.pid)
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

  it('should fail when starting an already started tunnel', function(done) {
    this.timeout(40000)
    timer = setTimeout(function(){done()}, 39000)
    tunnel = new Tunnel()
    tunnel.start()
    .then(() => {
      expect(tunnel).to.not.be.null
      expect(tunnel.process.pid).to.be.defined
      expect(tunnel.process.tunnelId).to.not.be.defined
      return tunnel.start()
    })
    .catch(error => {
      expect(error.message).to.contain('Tunnel: already started with pid ' + tunnel.process.pid)
      utils.stopProc(tunnel.process.pid)
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

  var tunnel = null, timer = null

  function done() {
  }

  it('should be able to stop running process', function(done) {
    this.timeout(30000)
    timer = setTimeout(done, 29000)
    tunnel = new Tunnel()
    tunnel.start()
    .then(() => {
      return tunnel.stop()
    })
    .then(() => {
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

  it('should be able to stop running process with local identifier', function(done) {
    this.timeout(30000)
    timer = setTimeout(done, 29000)
    tunnel = new Tunnel({ localIdentifier : 'my-test-id'})
    tunnel.start()
    .then(() => {
      return tunnel.stop()
    })
    .then(() => {
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

  it('should throw error in case the process was already stopped', function(done) {
    this.timeout(30000)
    timer = setTimeout(done, 29000)
    tunnel = new Tunnel()
    tunnel.start()
    .then(() => {
      return tunnel.stop()
    })
    .then(() => {
      return tunnel.stop()
    })
    .catch(error => {
      expect(error.message).to.contain('already stopped')
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

  var tunnel = null, timer = null

  function done() {
  }

  it('should fail when the tunnel has not been started ever', function() {
    this.timeout(10000)
    tunnel = new Tunnel()
    function tester() {
      tunnel.status()
    }
    expect(tester).to.throw(Error)
  })

  it('should return "running" when tunnel is running', function(done) {
    this.timeout(30000)
    timer = setTimeout(done, 29000)
    tunnel = new Tunnel()
    tunnel.start()
    .then(() => {
      expect(tunnel.status()).to.equal('running')
      utils.stopProc(tunnel.process.pid)
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

  it('should return "stopped" when tunnel has been stopped', function(done) {
    this.timeout(30000)
    timer = setTimeout(done, 29000)
    tunnel = new Tunnel()
    tunnel.start()
    .then(() => {
      return tunnel.stop()
    })
    .then(() => {
      expect(tunnel.status()).to.equal('stopped')
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
