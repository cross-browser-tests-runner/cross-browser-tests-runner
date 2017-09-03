'use strict';

var
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  fs = require('fs'),
  Env = require('./../../../../../lib/core/env').Env,
  Tunnel = require('./../../../../../lib/platforms/browserstack/tunnel').Tunnel,
  Manager = require('./../../../../../lib/platforms/browserstack/manager').Manager,
  BinaryVars = require('./../../../../../lib/platforms/browserstack/tunnel/binary').BinaryVars,
  utils = require('./utils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('Tunnel', function() {

  describe('check', function() {

    var tunnel
    this.timeout(0)

    it('should throw an error for invalid user input', function() {
      tunnel = new Tunnel()
      function tester() {
        tunnel.check({ abc : 1 })
      }
      expect(tester).to.throw(Error)
    })

    it('should convert camelCase input parameters to hyphen-separated-lowercase parameters', function() {
      tunnel = new Tunnel()
      var args = tunnel.check({ localIdentifier : 'my-id'})
      expect(args.indexOf('--local-identifier')).to.not.equal(-1)
      expect(args.indexOf('localIdentifier')).to.equal(-1)
      expect(args.indexOf('--localIdentifier')).to.equal(-1)
    })

    it('should convert Object type input parameters to hyphen-separated-lowercase parameters hierarchially', function() {
      tunnel = new Tunnel()
      var args = tunnel.check({ proxy : { host : '127.0.0.1', port : 2301 } })
      expect(args.indexOf('--proxy-host')).to.not.equal(-1)
      expect(args.indexOf('--proxy-port')).to.not.equal(-1)
      expect(args.indexOf('--proxy')).to.equal(-1)
      expect(args.indexOf('--host')).to.equal(-1)
      expect(args.indexOf('--port')).to.equal(-1)
    })

    it('should convert non-String type parameter values to String type values', function() {
      tunnel = new Tunnel()
      var args = tunnel.check({ proxy : { host : '127.0.0.1', port : 2301 }, verbose: 3 })
      expect(args.indexOf('2301')).to.not.equal(-1)
      expect(args.indexOf('3')).to.not.equal(-1)
    })

    it('should throw an error if BrowserStack access key is in neither input nor environment', function() {
      var env_key = process.env.BROWSERSTACK_ACCESS_KEY
      var log_level = process.env.LOG_LEVEL
      function tester() {
        delete process.env.BROWSERSTACK_ACCESS_KEY
        if(log_level) delete process.env.LOG_LEVEL
        tunnel = new Tunnel()
        tunnel.check()
      }
      expect(tester).to.throw(Error)
      process.env.BROWSERSTACK_ACCESS_KEY = env_key
      if(log_level) process.env.LOG_LEVEL = log_level
    })

    it('its output must include "--key" argument', function() {
      tunnel = new Tunnel()
      var args = tunnel.check({ })
      expect(args.indexOf('--key')).to.not.equal(-1)
    })

    it('its output must include either "--force" or "--local-identifier" argument', function() {
      tunnel = new Tunnel()
      var args = tunnel.check({ })
      expect(args.indexOf('--force')).to.not.equal(-1)
      expect(args.indexOf('--local-identifier')).to.equal(-1)
      args = tunnel.check({ localIdentifier : 'my-id' })
      expect(args.indexOf('--force')).to.equal(-1)
      expect(args.indexOf('--local-identifier')).to.not.equal(-1)
    })

    it('its output should retain "verbose" input argument', function() {
      tunnel = new Tunnel()
      var args = tunnel.check({ verbose : 3})
      var idx = args.indexOf('--verbose')
      expect(idx).to.not.equal(-1)
      expect(args.indexOf('3')).to.equal(idx + 1)
    })

    it('its output should include verbose=1 if logger is created with INFO level', function() {
      var saveLevel = process.env.LOG_LEVEL || undefined
      process.env.LOG_LEVEL = 'INFO'
      tunnel = new Tunnel()
      var args = tunnel.check({ })
      expect(args.indexOf('--verbose')).to.not.equal(-1)
      expect(args.indexOf('1')).to.not.equal(-1)
      delete process.env.LOG_LEVEL
      if (saveLevel) process.env.LOG_LEVEL = saveLevel
    })

    it('its output should include verbose=2 if logger is created with DEBUG level', function() {
      var saveLevel = process.env.LOG_LEVEL || undefined
      process.env.LOG_LEVEL = 'DEBUG'
      tunnel = new Tunnel()
      var args = tunnel.check({ })
      expect(args.indexOf('--verbose')).to.not.equal(-1)
      expect(args.indexOf('2')).to.not.equal(-1)
      delete process.env.LOG_LEVEL
      if (saveLevel) process.env.LOG_LEVEL = saveLevel
    })

    it('its output must not have verbose argument if logger is created with ERROR level', function() {
      var saveLevel = process.env.LOG_LEVEL || undefined
      process.env.LOG_LEVEL = 'ERROR'
      tunnel = new Tunnel()
      var args = tunnel.check({ })
      expect(args.indexOf('--verbose')).to.equal(-1)
      delete process.env.LOG_LEVEL
      if (saveLevel) process.env.LOG_LEVEL = saveLevel
    })

  })

  describe('exists', function() {

    var tunnel = new Tunnel()
    this.timeout(0)

    it('should return a boolean value', function() {
      expect(tunnel.exists()).to.be.a('boolean')
    })
  })

  if(!Env.isWindows) {

    describe('remove', function() {

      it('should remove the locally stored tunnel executable', function() {
        var tunnel = new Tunnel()
        return tunnel.remove()
        .then(function() {
          return fs.statAsync(BinaryVars.path)
        })
        .catch(err => {
          if(err && (!err.code || 'ENOENT' !== err.code)) {
            utils.log.error('error: ', err)
          }
          expect(err).to.not.be.undefined
          expect(err.code).to.not.be.undefined
          expect(err.code).to.equal('ENOENT')
          expect(err.syscall).to.not.be.undefined
          expect(err.syscall).to.be.oneOf(['stat', 'unlink'])
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })
    })

  }

  describe('fetch', function() {

    var tunnel = null
    this.timeout(0)

    it('should download and store the tunnel executable locally', function() {
      tunnel = new Tunnel()
      return tunnel.fetch()
      .then(function() {
        expect(fs.existsSync(BinaryVars.path)).to.be.true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  })

  describe('start', function() {

    var tunnel = null
    this.timeout(0)

    it('should be able to start multiple tunnels with different tunnel identifiers', function() {
      var tunnel1 = new Tunnel({ localIdentifier: 'test-local-id-1'})
      var tunnel2 = new Tunnel({ localIdentifier: 'test-local-id-2'})
      var tunnel3 = new Tunnel({ localIdentifier: 'test-local-id-3'})
      return tunnel1.start()
      .then(() => {
        return tunnel2.start()
      })
      .then(() => {
        return tunnel3.start()
      })
      .then(() => {
        expect(tunnel1).to.not.be.null
        expect(tunnel1.process.pid).to.not.be.undefined
        expect(tunnel1.process.tunnelId).to.not.be.undefined
        expect(tunnel1.process.tunnelId).to.equal('test-local-id-1')
        expect(tunnel2).to.not.be.null
        expect(tunnel2.process.pid).to.not.be.undefined
        expect(tunnel2.process.tunnelId).to.not.be.undefined
        expect(tunnel2.process.tunnelId).to.equal('test-local-id-2')
        expect(tunnel3).to.not.be.null
        expect(tunnel3.process.pid).to.not.be.undefined
        expect(tunnel3.process.tunnelId).to.not.be.undefined
        expect(tunnel3.process.tunnelId).to.equal('test-local-id-3')
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail to start a tunnel without identifier if one with an identifier exists', function() {
      var tunnel1 = new Tunnel({ localIdentifier : 'test-local-id'})
      var tunnel2 = new Tunnel({ })
      return tunnel1.start()
      .then(() => {
        return tunnel2.start()
      })
      .catch(error => {
        if(error && (!error.message || !error.message.match(/Tunnel: attempt to start a tunnel without a local identifier is not allowed when a tunnel process with a local identifier exists/))) {
          utils.log.error(error)
        }
        expect(error.message).to.contain('Tunnel: attempt to start a tunnel without a local identifier is not allowed when a tunnel process with a local identifier exists')
        expect(tunnel1).to.not.be.null
        expect(tunnel1.process.pid).to.not.be.undefined
        expect(tunnel1.process.tunnelId).to.not.be.undefined
        expect(tunnel1.process.tunnelId).to.equal('test-local-id')
        expect(tunnel2).to.not.be.null
        expect(tunnel2.process.pid).to.be.undefined
        expect(tunnel2.process.tunnelId).to.be.undefined
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should start a tunnel with identifier after stopping a tunnel without an identifier, if one exists', function() {
      var tunnel1 = new Tunnel()
      var tunnel2 = new Tunnel({ localIdentifier : 'test-local-id'})
      var savePid
      return tunnel1.start()
      .then(() => {
        expect(tunnel1).to.not.be.null
        expect(tunnel1.process.pid).to.not.be.undefined
        expect(tunnel1.process.tunnelId).to.be.undefined
        savePid = parseInt(tunnel1.process.pid.toString())
        return tunnel2.start()
      })
      .then(() => {
        expect(tunnel2).to.not.be.null
        expect(tunnel2.process.pid).to.not.be.undefined
        expect(tunnel2.process.tunnelId).to.not.be.undefined
        expect(tunnel2.process.tunnelId).to.equal('test-local-id')
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should start multiple tunnels with different identifiers after stopping a tunnel without an identifier, if one exists', function() {
      var tunnel1 = new Tunnel()
      var tunnel2 = new Tunnel({ localIdentifier : 'test-id-1'})
      var tunnel3 = new Tunnel({ localIdentifier : 'test-id-2'})
      var savePid
      return tunnel1.start()
      .then(() => {
        expect(tunnel1).to.not.be.null
        expect(tunnel1.process.pid).to.not.be.undefined
        expect(tunnel1.process.tunnelId).to.be.undefined
        savePid = parseInt(tunnel1.process.pid.toString())
        var promises = [ tunnel2.start(), tunnel3.start() ]
        return Promise.all(promises)
      })
      .then(() => {
        expect(tunnel2).to.not.be.null
        expect(tunnel2.process.pid).to.not.be.undefined
        expect(tunnel2.process.tunnelId).to.not.be.undefined
        expect(tunnel2.process.tunnelId).to.equal('test-id-1')
        expect(tunnel3).to.not.be.null
        expect(tunnel3.process.pid).to.not.be.undefined
        expect(tunnel3.process.tunnelId).to.not.be.undefined
        expect(tunnel3.process.tunnelId).to.equal('test-id-2')
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail if called for an already started tunnel', function() {
      tunnel = new Tunnel()
      return tunnel.start()
      .then(() => {
        expect(tunnel).to.not.be.null
        expect(tunnel.process.pid).to.not.be.undefined
        expect(tunnel.process.tunnelId).to.be.undefined
        return tunnel.start()
      })
      .catch(error => {
        if(error && (!error.message || !error.message.match(/Tunnel: already started with pid/))) {
          utils.log.error(error)
        }
        expect(error.message).to.contain('Tunnel: already started with pid ' + tunnel.process.pid)
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

    var tunnel = null
    this.timeout(0)

    it('should be able to stop a running tunnel process', function() {
      tunnel = new Tunnel()
      return tunnel.start()
      .then(() => {
        return tunnel.stop()
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

  describe('status', function() {

    var tunnel = null
    this.timeout(0)

    it('should return "running" if the tunnel process is running', function() {
      tunnel = new Tunnel()
      return tunnel.start()
      .then(() => {
        var status = tunnel.status()
        expect(status).to.equal('running')
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
