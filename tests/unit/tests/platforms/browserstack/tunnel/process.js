'use strict';

var
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Bluebird = require('bluebird'),
  fs = Bluebird.promisifyAll(require('fs')),
  path = require('path'),
  Promise = require('bluebird'),
  ps = require('ps-node'),
  Env = require('./../../../../../../lib/core/env').Env,
  proc = require('./../../../../../../lib/platforms/browserstack/tunnel/process'),
  Process = proc.Process,
  ProcessBase = require('./../../../../../../lib/core/process').Process,
  BinaryVars = require('./../../../../../../lib/platforms/browserstack/tunnel/binary').BinaryVars,
  utils = require('./../utils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('Process', function() {

  describe('create', function() {

    var proc
    this.timeout(0)

    if(!Env.isWindows) {

      it('should fail to start the tunnel process if an invalid access key is provided', function() {
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

      it('should fail to start the tunnel process in case the executable binary does not have execute permissions', function() {
        proc = new Process()
        return fs.chmodAsync(BinaryVars.path, '0400')
        .then(() => {
          return proc.create(BinaryVars.path, [ ])
        })
        .catch(error => {
          if(error && (!error.message || !error.message.match(/spawn EACCES/))) {
            utils.log.error(error)
          }
          return fs.chmodAsync(BinaryVars.path, '0755')
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

      it('should fail to start the tunnel process if the expected output on stdout is not received (errors simulated by using a different binary than the original one)', function() {
        var temp = BinaryVars.path + '--xyz--' + process.pid,
          proc2 = new ProcessBase(),
          otherBinary = path.resolve(process.cwd(), 'tests/unit/utils/bad-tunnel.js'),
          error
        return proc2.create('cp', [ BinaryVars.path, temp ])
        .then(() => {
          proc2 = new ProcessBase()
          return proc2.create('cp', [ otherBinary, BinaryVars.path ])
        })
        .then(() => {
          proc = new Process()
          return proc.create(BinaryVars.path, [ ])
        })
        .catch(err => {
          error = err
          proc2 = new ProcessBase()
          return proc2.create('cp', [ temp, BinaryVars.path ])
        })
        .then(() => {
          fs.unlinkSync(temp)
          throw error
        })
        .should.be.rejectedWith('Process: unexpectedly did not get pid of the final process')
      })
    }

    it('should fail to start the tunnel process if the logfile input provided points to a file location that cannot be created/accessed by the process due to lack of permissions', function() {
      proc = new Process()
      var badLogFile
      if(!Env.isWindows) {
        badLogFile = '/proc.txt'
      } else {
        badLogFile = '\\Windows\\system32\\abczya\\proc.txt'
      }
      var callbacks = {
        onstderr: function(stderr) {
          if(!Env.isWindows) {
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

    it('should be able to start the tunnel process if no options are provided', function() {
      proc = new Process()
      return proc.create(BinaryVars.path, [ ])
      .then(() => {
        expect(proc.pid).to.not.be.undefined
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should be able to start the tunnel process if the "--local-identifier" option is provided without a value', function() {
      proc = new Process()
      return proc.create(BinaryVars.path, [ '--daemon', '--local-identifier' ])
      .then(() => {
        expect(proc.pid).to.not.be.undefined
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should be able to start the tunnel process if the "--local-identifier" option is provided with a value', function() {
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
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  })

  describe('stop', function() {

    var proc
    this.timeout(0)

    it('should throw error in case the tunnel process was not created', () => {
      this.timeout(15000)
      proc = new Process()
      return proc.stop()
      .should.be.rejectedWith('Process: no pid associated to stop')
    })

    if(!Env.isWindows) {
      it('should fail to stop the tunnel process if the executable binary does not have execute permissions', function() {
        proc = new Process()
        return proc.create(BinaryVars.path, [])
        .then(() => {
          return fs.chmodAsync(BinaryVars.path, '0400')
        })
        .then(() => {
          return(proc.stop())
        })
        .catch(error => {
          if(error && (!error.message || !error.message.match(/spawn EACCES/))) {
            utils.log.error(error)
          }
          expect(error.message).to.contain('spawn EACCES')
          expect(proc).to.not.be.null
          expect(proc.pid).to.not.be.undefined
          return fs.chmodAsync(BinaryVars.path, '0755')
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

    it('should be able to successfully stop a running tunnel process without a tunnel identifier', function() {
      proc = new Process()
      return proc.create(BinaryVars.path, [])
      .then(() => {
        return proc.stop()
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

    it('should be able to successfully stop a running tunnel process with a tunnel identifier', function() {
      proc = new Process()
      return proc.create(BinaryVars.path, [ '--local-identifier', 'test-local-id'])
      .then(() => {
        return proc.stop()
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

    it('should be able to stop a running tunnel process created separately by sending signals to it', function() {
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
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail in case the tunnel process is stopped already', function() {
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

    it('should fail when the tunnel process was not created', function() {
      proc = new Process()
      function tester() {
        proc.status()
      }
      expect(tester).to.throw(Error)
    })

    it('should say "running" for a running tunnel process', function() {
      proc = new Process()
      return proc.create(BinaryVars.path, [ ])
      .then(() => {
        expect(proc.status()).to.equal('running')
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should return "stopped" for a stopped tunnel process', function() {
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
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  })

})
