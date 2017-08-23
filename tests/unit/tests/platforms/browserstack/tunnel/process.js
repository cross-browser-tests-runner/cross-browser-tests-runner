'use strict';

var
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  fs = require('fs'),
  path = require('path'),
  Promise = require('bluebird'),
  ps = require('ps-node'),
  proc = require('./../../../../../../lib/platforms/browserstack/tunnel/process'),
  Process = proc.Process,
  BinaryVars = require('./../../../../../../lib/platforms/browserstack/tunnel/binary').BinaryVars,
  utils = require('./../utils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('create', function() {

  var proc
  this.timeout(0)

  if(!BinaryVars.isWindows) {

    it('should fail to start the proc with bad options', function() {
      proc = new Process()
      var callbacks = {
        onstderr: function(stderr) {
          expect(stderr).to.contain('You provided an invalid key')
        }
      }
      return proc.create(BinaryVars.path, [ '--key', 'oapsodpao1910r9109r0141' ], callbacks)
      .then(() => {
        return utils.ensureZeroTunnels()
      })
      .should.be.fulfilled
    })

    it('should fail to start the proc for spawn errors', function() {
      proc = new Process()
      fs.chmodSync(BinaryVars.path, '0400')
      return proc.create(BinaryVars.path, [ ])
      .catch(error => {
        if(error && (!error.message || !error.message.match(/spawn EACCES/))) {
          utils.log.error(error)
        }
        fs.chmodSync(BinaryVars.path, '0755')
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        utils.log.error(err)
        throw err
      })
      .should.be.fulfilled
    })
  }

  it('should fail to start the proc for functional errors', function() {
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
          // utils.log.error(error)
        }
      }
    }
    return proc.create(BinaryVars.path, [ '--log-file', badLogFile ], callbacks)
    .then(() => {
      return utils.ensureZeroTunnels()
    })
    .should.be.fulfilled
  })

  it('should be able to start the proc with minimum options', function() {
    proc = new Process()
    return proc.create(BinaryVars.path, [ ])
    .then(() => {
      expect(proc.pid).to.not.be.undefined
      return utils.ensureZeroTunnels()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should be able to start the proc with half options', function() {
    proc = new Process()
    return proc.create(BinaryVars.path, [ '--daemon', '--local-identifier' ])
    .then(() => {
      expect(proc.pid).to.not.be.undefined
      return utils.ensureZeroTunnels()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should be able to start a proc with local identifier', function() {
    proc = new Process()
    return proc.create(BinaryVars.path, [ '--local-identifier', 'test-local-id'])
    .then(() => {
      expect(proc).to.not.be.null
      expect(proc.pid).to.not.be.undefined
      expect(proc.tunnelId).to.not.be.undefined
      expect(proc.tunnelId).to.equal('test-local-id')
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

  var proc
  this.timeout(0)

  it('should throw error in case no process was running', () => {
    this.timeout(15000)
    proc = new Process()
    return proc.stop()
    .should.be.rejectedWith('Process: no pid associated to stop')
  })

  if(!BinaryVars.isWindows) {
    it('should fail to stop the proc for spawn errors', function() {
      proc = new Process()
      return proc.create(BinaryVars.path, [])
      .then(() => {
        fs.chmodSync(BinaryVars.path, '0400')
        return(proc.stop())
      })
      .catch(error => {
        if(error && (!error.message || !error.message.match(/spawn EACCES/))) {
          utils.log.error(error)
        }
        expect(error.message).to.contain('spawn EACCES')
        expect(proc).to.not.be.null
        expect(proc.pid).to.not.be.undefined
        fs.chmodSync(BinaryVars.path, '0755')
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        utils.log.error(err)
        throw err
      })
      .should.be.fulfilled
    })
  }

  it('should be able to stop running process', function() {
    proc = new Process()
    return proc.create(BinaryVars.path, [])
    .then(() => {
      return proc.stop()
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

  it('should be able to stop running process with local identifier', function() {
    proc = new Process()
    return proc.create(BinaryVars.path, [ '--local-identifier', 'test-local-id'])
    .then(() => {
      return proc.stop()
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

  it('should be able to stop running process by killing', function() {
    proc = new Process()
    return proc.create(BinaryVars.path, [ ])
    .then(() => {
      var proc2 = new Process(proc.pid)
      return proc2.stop()
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

  it('should throw error in case the process was already stopped', function() {
    proc = new Process()
    return proc.create(BinaryVars.path, [ '--local-identifier', 'test-local-id'])
    .then(() => {
      return proc.stop()
    })
    .then(() => {
      return proc.stop()
    })
    .should.be.rejectedWith('Process: already stopped')
  })

})

describe('status', function() {

  var proc = null
  this.timeout(0)

  it('should fail when the proc has not been started ever', function() {
    proc = new Process()
    function tester() {
      proc.status()
    }
    expect(tester).to.throw(Error)
  })

  it('should return "running" when proc is running', function() {
    proc = new Process()
    return proc.create(BinaryVars.path, [ ])
    .then(() => {
      expect(proc.status()).to.equal('running')
      return utils.ensureZeroTunnels()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should return "stopped" when proc has been stopped', function() {
    proc = new Process()
    return proc.create(BinaryVars.path, [ ])
    .then(() => {
      return proc.stop()
    })
    .then(() => {
      expect(proc.status()).to.equal('stopped')
      return utils.ensureZeroTunnels()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

})
