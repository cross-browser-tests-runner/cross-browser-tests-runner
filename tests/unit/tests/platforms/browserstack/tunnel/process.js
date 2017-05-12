var
  fs = require('fs'),
  path = require('path'),
  Promise = require('bluebird'),
  ps = require('ps-node'),
  expect = require('chai').expect,
  sleep = require('sleep'),
  proc = require('./../../../../../../lib/platforms/browserstack/tunnel/process'),
  Process = proc.Process,
  BinaryVars = require('./../../../../../../lib/platforms/browserstack/tunnel/binary').BinaryVars,
  utils = require('./../utils')

describe('create', function() {

  var proc, timer

  function done() {
  }

  it('should fail to start the proc with bad options', function(done) {
    this.timeout(20000)
    timer = setTimeout(done, 19000)
    proc = new Process()
    var callbacks = {
      onstderr: function(stderr) {
        expect(stderr).to.contain('You provided an invalid key')
      }
    }
    proc.create(BinaryVars.path, [ '--key', 'oapsodpao1910r9109r0141' ], callbacks)
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

  if(!BinaryVars.isWindows) {
    it('should fail to start the proc for spawn errors', (done) => {
      this.timeout(20000)
      timer = setTimeout(done, 19000)
      proc = new Process()
      fs.chmodSync(BinaryVars.path, '0400')
      proc.create(BinaryVars.path, [ ])
      .catch(error => {
        fs.chmodSync(BinaryVars.path, '0755')
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
  }

  it('should fail to start the proc for functional errors', function(done) {
    this.timeout(20000)
    timer = setTimeout(done, 19000)
    proc = new Process()
    var badLogFile
    if(!BinaryVars.isWindows) {
      badLogFile = '/proc.txt'
    } else {
      badLogFile = '\\Windows\\system32\\abczya\\proc.txt'
    }
    var callbacks = {
      onstderr: function(stderr) {
        if(!BinaryVars.isWindows) {
          expect(stderr).to.contain('Please specify a path with write permission')
        } else {
          console.error(stderr)
        }
      }
    }
    proc.create(BinaryVars.path, [ '--log-file', badLogFile ], callbacks)
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

  it('should be able to start the proc with minimum options', function(done) {
    this.timeout(40000)
    timer = setTimeout(done, 39000)
    proc = new Process()
    proc.create(BinaryVars.path, [ ])
    .then(() => {
      expect(proc.pid).to.be.defined
      utils.stopProc(proc.pid)
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

  it('should be able to start the proc with half options', function(done) {
    this.timeout(40000)
    timer = setTimeout(done, 39000)
    proc = new Process()
    proc.create(BinaryVars.path, [ '--daemon', '--local-identifier' ])
    .then(() => {
      expect(proc.pid).to.be.defined
      utils.stopProc(proc.pid)
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

  it('should be able to start a proc with local identifier', function(done) {
    this.timeout(40000)
    timer = setTimeout(done, 39000)
    proc = new Process()
    proc.create(BinaryVars.path, [ '--local-identifier', 'test-local-id'])
    .then(() => {
      expect(proc).to.not.be.null
      expect(proc.pid).to.be.defined
      expect(proc.tunnelId).to.be.defined
      expect(proc.tunnelId).to.equal('test-local-id')
      utils.stopProc(proc.pid)
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

  var proc, timer

  function done() {
  }

  it('should throw error in case no process was running', () => {
    this.timeout(15000)
    proc = new Process()
    proc.stop()
    .catch(error => {
      expect(error.message).to.contain('Process: no pid associated to stop')
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  if(!BinaryVars.isWindows) {
    it('should fail to stop the proc for spawn errors', function(done) {
      this.timeout(30000)
      timer = setTimeout(done, 29000)
      proc = new Process()
      proc.create(BinaryVars.path, [])
      .then(() => {
        fs.chmodSync(BinaryVars.path, '0400')
        return true
      })
      .then(() => {
        return(proc.stop())
      })
      .catch(error => {
        expect(error.message).to.contain('spawn EACCES')
        expect(proc).to.not.be.null
        expect(proc.pid).to.be.defined
        fs.chmodSync(BinaryVars.path, '0755')
        utils.stopProc(proc.pid)
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
  }

  it('should be able to stop running process', function(done) {
    this.timeout(30000)
    timer = setTimeout(done, 29000)
    proc = new Process()
    proc.create(BinaryVars.path, [])
    .then(() => {
      return proc.stop()
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
    proc = new Process()
    proc.create(BinaryVars.path, [ '--local-identifier', 'test-local-id'])
    .then(() => {
      return proc.stop()
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

  it('should be able to stop running process by killing', function(done) {
    this.timeout(30000)
    timer = setTimeout(done, 29000)
    proc = new Process()
    proc.create(BinaryVars.path, [ ])
    .then(() => {
      var proc2 = new Process(proc.pid)
      return proc2.stop()
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
    proc = new Process()
    proc.create(BinaryVars.path, [ '--local-identifier', 'test-local-id'])
    .then(() => {
      return proc.stop()
    })
    .then(() => {
      return proc.stop()
    })
    .catch(error => {
      expect(error.message).to.contain('Process: already stopped')
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

  var proc = null, timer = null

  function done() {
  }

  it('should fail when the proc has not been started ever', function() {
    this.timeout(10000)
    proc = new Process()
    function tester() {
      proc.status()
    }
    expect(tester).to.throw(Error)
  })

  it('should return "running" when proc is running', function(done) {
    this.timeout(30000)
    timer = setTimeout(done, 29000)
    proc = new Process()
    proc.create(BinaryVars.path, [ ])
    .then(() => {
      expect(proc.status()).to.equal('running')
      utils.stopProc(proc.pid)
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

  it('should return "stopped" when proc has been stopped', function(done) {
    this.timeout(30000)
    timer = setTimeout(done, 29000)
    proc = new Process()
    proc.create(BinaryVars.path, [ ])
    .then(() => {
      return proc.stop()
    })
    .then(() => {
      expect(proc.status()).to.equal('stopped')
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
