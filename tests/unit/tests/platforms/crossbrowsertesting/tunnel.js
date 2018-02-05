'use strict';

var
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  fs = require('fs'),
  path = require('path'),
  Env = require('./../../../../../lib/core/env').Env,
  Tunnel = require('./../../../../../lib/platforms/crossbrowsertesting/tunnel').Tunnel,
  Manager = require('./../../../../../lib/platforms/crossbrowsertesting/manager').Manager,
  ArchiveVars = require('./../../../../../lib/platforms/crossbrowsertesting/tunnel/archive').ArchiveVars,
  utils = require('./utils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('Tunnel', function() {

  describe('check', function() {

    var tunnel
    this.timeout(0)

    it('should fail for unexpected user input', function() {
      tunnel = new Tunnel()
      function tester() {
        tunnel.check({ abc : 1 })
      }
      expect(tester).to.throw(Error)
    })

    it('should fail if CrossBrowserTesting access key is in neither input nor environment', function() {
      var env_key = process.env.CROSSBROWSERTESTING_ACCESS_KEY
      function tester() {
        delete process.env.CROSSBROWSERTESTING_ACCESS_KEY
        tunnel = new Tunnel()
        tunnel.check()
      }
      expect(tester).to.throw(Error)
      process.env.CROSSBROWSERTESTING_ACCESS_KEY = env_key
    })

    it('should fail if user name is in neither input nor environment', function() {
      var env_key = process.env.CROSSBROWSERTESTING_USERNAME
      function tester() {
        delete process.env.CROSSBROWSERTESTING_USERNAME
        tunnel = new Tunnel()
        tunnel.check()
      }
      expect(tester).to.throw(Error)
      process.env.CROSSBROWSERTESTING_USERNAME = env_key
    })

    it('its output must include "--authkey" argument', function() {
      tunnel = new Tunnel()
      var args = tunnel.check({ })
      expect(args.indexOf('--authkey')).to.not.equal(-1)
    })

    it('its output must include "--username" argument', function() {
      tunnel = new Tunnel()
      var args = tunnel.check({ })
      expect(args.indexOf('--username')).to.not.equal(-1)
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

      it('should remove the locally stored tunnel executable binary and archive', function() {
        var tunnel = new Tunnel()
        return tunnel.remove()
        .then(function() {
          expect(fs.existsSync(ArchiveVars.path)).to.equal(false)
          expect(fs.existsSync(ArchiveVars.binary)).to.equal(false)
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

    it('should be able to download the tunnel archive and extract its contents', function() {
      tunnel = new Tunnel()
      return tunnel.fetch()
      .then(function() {
        expect(fs.existsSync(ArchiveVars.path)).to.be.true
        expect(fs.existsSync(ArchiveVars.binary)).to.be.true
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

    it('should prevent starting another tunnel if one already exists', function() {
      var tunnel1 = new Tunnel({})
      var tunnel2 = new Tunnel({})
      return tunnel1.start()
      .then(() => {
        expect(tunnel1).to.not.be.null
        expect(tunnel1.process.pid).to.not.be.undefined
        expect(tunnel1.process.tunnelId).to.be.undefined
        return tunnel2.start()
      })
      .catch(err => {
        expect(err.message).to.contain('a tunnel exists already')
        return Manager.running()
      })
      .then(procs => {
        if(1 !== procs.length) {
          utils.log.warn('expected 1 tunnel to be running')
        }
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should be able to start a tunnel if none exists already', function() {
      var tunnel = new Tunnel({ })
      return tunnel.start()
      .then(() => {
        expect(tunnel).to.not.be.null
        expect(tunnel.process.pid).to.not.be.undefined
        expect(tunnel.process.tunnelId).to.be.undefined
        return Manager.running()
      })
      .then(procs => {
        if(1 !== procs.length) {
          utils.log.warn('expected 1 tunnel to be running')
        }
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

    it('should successfully stop a running tunnel process', function() {
      tunnel = new Tunnel()
      return tunnel.start()
      .then(() => {
        return tunnel.stop()
      })
      .then(() => {
        return Manager.running()
      })
      .then(procs => {
        expect(procs.length).to.equal(0)
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

    it('should say "running" for a running tunnel process', function() {
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
