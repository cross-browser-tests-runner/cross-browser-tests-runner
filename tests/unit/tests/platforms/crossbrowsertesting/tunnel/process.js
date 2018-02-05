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
  proc = require('./../../../../../../lib/platforms/crossbrowsertesting/tunnel/process'),
  Process = proc.Process,
  BinaryVars = require('./../../../../../../lib/platforms/crossbrowsertesting/tunnel/binary').BinaryVars,
  utils = require('./../utils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('Process', function() {

  describe('create', function() {

    var proc
    this.timeout(0)

    it('should fail to start the tunnel process if invalid access key is provided', function() {
      proc = new Process()
      return proc.create(BinaryVars.path, [ '--authkey', 'oapsodpao1910r9109r0141' ])
      .should.be.rejectedWith('Invalid username/api key')
    })

    it('should fail to start the tunnel process if invalid username is provided', function() {
      proc = new Process()
      return proc.create(BinaryVars.path, [ '--username', 'oapsodpao1910r9109r0141' ])
      .should.be.rejectedWith('Invalid username/api key')
    })

    if(!Env.isWindows) {
      it('should fail to start the tunnel process if the tunnel executable binary did not have execute permissions', function() {
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
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })
    }

    it('should be able to start the tunnel process with no command line options provided', function() {
      proc = new Process()
      return proc.create(BinaryVars.path, [ ], {
        onstderr: err => {
          utils.log.warn('got stderr %s', err)
        }
      })
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

    it('should be able to start the tunnel process if the --tunnelname argument is provided without its value', function() {
      proc = new Process()
      return proc.create(BinaryVars.path, [ '--tunnelname' ])
      .then(() => {
        expect(proc.pid).to.not.be.undefined
        expect(proc.tunnelId).to.not.be.undefined
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should be able to start the tunnel process if the --tunnelname argument is provided with a value', function() {
      proc = new Process()
      return proc.create(BinaryVars.path, [ '--tunnelname', 'test-local-id'])
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

    it('should fail in case the tunnel process has not been started yet', () => {
      this.timeout(15000)
      proc = new Process()
      return proc.stop()
      .should.be.rejectedWith('options.uri is a required argument')
    })

    it('should successfully stop a running tunnel process without a tunnel identifier', function() {
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

    it('should successfully stop a running tunnel process with a tunnel identifier', function() {
      proc = new Process()
      return proc.create(BinaryVars.path, [ '--tunnelname', 'my-tunnel' ])
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

    it('should silently complete in case called after the tunnel process was stopped already', function() {
      proc = new Process()
      return proc.create(BinaryVars.path, [ ])
      .then(() => {
        return proc.stop()
      })
      .then(() => {
        return proc.stop()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  })

  describe('status', function() {

    var proc = null
    this.timeout(0)

    it('should fail if the tunnel process has not been started yet', function() {
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
      return proc.create(BinaryVars.path, [ '--tunnelname', 'my-test-tunnel' ])
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
