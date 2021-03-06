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
  proc = require('./../../../../../../lib/platforms/saucelabs/tunnel/process'),
  Process = proc.Process,
  ArchiveVars = require('./../../../../../../lib/platforms/saucelabs/tunnel/archive').ArchiveVars,
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
      return proc.create(ArchiveVars.binary, [ '--api-key', 'oapsodpao1910r9109r0141' ])
      .should.be.rejectedWith('Invalid username/api key')
    })

    it('should fail to start the tunnel process if invalid username is provided', function() {
      proc = new Process()
      return proc.create(ArchiveVars.binary, [ '--user', 'oapsodpao1910r9109r0141' ])
      .should.be.rejectedWith('Invalid username/api key')
    })

    if(!Env.isWindows) {
      it('should fail to start the tunnel process if the tunnel executable binary did not have execute permissions', function() {
        proc = new Process()
        return fs.chmodAsync(ArchiveVars.binary, '0400')
        .then(() => {
          return proc.create(ArchiveVars.binary, [ ])
        })
        .catch(error => {
          if(error && (!error.message || !error.message.match(/spawn EACCES/))) {
            utils.log.error(error)
          }
          return fs.chmodAsync(ArchiveVars.binary, '0755')
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })
    }

    it('should fail to start the tunnel process if the logfile argument points to a path for which the process would have no write permissions', function() {
      proc = new Process()
      var badLogFile
      if(!Env.isWindows) {
        badLogFile = '/proc.txt'
      } else {
        badLogFile = '\\Windows\\system32\\abczya\\proc.txt'
      }
      return proc.create(ArchiveVars.binary, [ '--logfile', badLogFile ])
      .should.be.rejectedWith('Unexpected exit with code')
    })

    it('should be able to start the tunnel process with no command line options provided', function() {
      proc = new Process()
      return proc.create(ArchiveVars.binary, [ ], {
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

    it('should be able to start the tunnel process if the --tunnel-identifier argument is provided without its value', function() {
      proc = new Process()
      return proc.create(ArchiveVars.binary, [ '--tunnel-identifier' ])
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

    it('should be able to start the tunnel process if the --tunnel-identifier argument is provided with a value', function() {
      proc = new Process()
      return proc.create(ArchiveVars.binary, [ '--tunnel-identifier', 'test-local-id'])
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
      return proc.create(ArchiveVars.binary, [])
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
      return proc.create(ArchiveVars.binary, [ '--tunnel-identifier', 'test-local-id'])
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
      return proc.create(ArchiveVars.binary, [ '--tunnel-identifier', 'test-local-id'])
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
      return proc.create(ArchiveVars.binary, [ ])
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
      return proc.create(ArchiveVars.binary, [ ])
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
