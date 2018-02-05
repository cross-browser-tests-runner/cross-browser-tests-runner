'use strict';

var
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  fs = require('fs'),
  path = require('path'),
  Env = require('./../../../../../lib/core/env').Env,
  Tunnel = require('./../../../../../lib/platforms/crossbrowsertesting/tunnel').Tunnel,
  Manager = require('./../../../../../lib/platforms/crossbrowsertesting/manager').Manager,
  BinaryVars = require('./../../../../../lib/platforms/crossbrowsertesting/tunnel/binary').BinaryVars,
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

      it('should remove the locally stored tunnel executable binary', function() {
        var tunnel = new Tunnel()
        return tunnel.remove()
        .then(function() {
          expect(fs.existsSync(BinaryVars.path)).to.equal(false)
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

    it('should be able to download the tunnel binary', function() {
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

    it('should be able to start a tunnel without id if none exists already', function() {
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

    it('should be able to start a tunnel with id if none exists already', function() {
      var tunnel = new Tunnel({ tunnelname: 'my-tunnel-id' })
      return tunnel.start()
      .then(() => {
        expect(tunnel).to.not.be.null
        expect(tunnel.process.pid).to.not.be.undefined
        expect(tunnel.process.tunnelId).to.not.be.undefined
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

    it('should start a tunnel without id even if another one exists and the other one should get killed automatically', function() {
      var tunnel1 = new Tunnel({})
      var tunnel2 = new Tunnel({})
      return tunnel1.start()
      .then(() => {
        expect(tunnel1).to.not.be.null
        expect(tunnel1.process.pid).to.not.be.undefined
        expect(tunnel1.process.tunnelId).to.be.undefined
        return tunnel2.start()
      })
      .then(() => {
        expect(tunnel2).to.not.be.null
        expect(tunnel2.process.pid).to.not.be.undefined
        expect(tunnel2.process.tunnelId).to.be.undefined
        expect(tunnel1.status()).to.equal('stopped')
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

    it('should start a tunnel with id even if another one with the same id exists and the other one should get killed automatically', function() {
      var tunnel1 = new Tunnel({ tunnelname: 'same-id'})
      var tunnel2 = new Tunnel({ tunnelname: 'same-id'})
      return tunnel1.start()
      .then(() => {
        expect(tunnel1).to.not.be.null
        expect(tunnel1.process.pid).to.not.be.undefined
        expect(tunnel1.process.tunnelId).to.equal('same-id')
        return tunnel2.start()
      })
      .then(() => {
        expect(tunnel2).to.not.be.null
        expect(tunnel2.process.pid).to.not.be.undefined
        expect(tunnel2.process.tunnelId).to.equal('same-id')
        expect(tunnel1.status()).to.equal('stopped')
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

    it('should be able to start a tunnel without id and two tunnels with different id simultaneously', function() {
      var tunnel1 = new Tunnel({ tunnelname: 'id-1'})
      var tunnel2 = new Tunnel({ tunnelname: 'id-2'})
      var tunnel3 = new Tunnel({ })
      return tunnel1.start()
      .then(() => {
        expect(tunnel1).to.not.be.null
        expect(tunnel1.process.pid).to.not.be.undefined
        expect(tunnel1.process.tunnelId).to.equal('id-1')
        return tunnel2.start()
      })
      .then(() => {
        expect(tunnel2).to.not.be.null
        expect(tunnel2.process.pid).to.not.be.undefined
        expect(tunnel2.process.tunnelId).to.equal('id-2')
        return tunnel3.start()
      })
      .then(() => {
        expect(tunnel3).to.not.be.null
        expect(tunnel3.process.pid).to.not.be.undefined
        expect(tunnel3.process.tunnelId).to.be.undefined
        return Manager.running()
      })
      .then(procs => {
        if(3 !== procs.length) {
          utils.log.warn('expected 3 tunnels to be running')
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
