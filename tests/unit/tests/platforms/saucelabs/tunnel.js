'use strict';

var
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  fs = require('fs'),
  path = require('path'),
  Env = require('./../../../../../lib/core/env').Env,
  Tunnel = require('./../../../../../lib/platforms/saucelabs/tunnel').Tunnel,
  Manager = require('./../../../../../lib/platforms/saucelabs/manager').Manager,
  ArchiveVars = require('./../../../../../lib/platforms/saucelabs/tunnel/archive').ArchiveVars,
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

    it('should convert camelCase argument to hyphen-separated-lowercase argument', function() {
      tunnel = new Tunnel()
      var args = tunnel.check({ tunnelIdentifier : 'my-id'})
      expect(args.indexOf('--tunnel-identifier')).to.not.equal(-1)
      expect(args.indexOf('tunnelIdentifier')).to.equal(-1)
      expect(args.indexOf('--tunnelIdentifier')).to.equal(-1)
    })

    it('should convert non-String type values to String type values', function() {
      tunnel = new Tunnel()
      var args = tunnel.check({ maxMissedAcks: 19, sePort: 3515 })
      expect(args.indexOf('19')).to.not.equal(-1)
      expect(args.indexOf('3515')).to.not.equal(-1)
    })

    it('should fail if SauceLabs access key is in neither input nor environment', function() {
      var env_key = process.env.SAUCE_ACCESS_KEY
      function tester() {
        delete process.env.SAUCE_ACCESS_KEY
        tunnel = new Tunnel()
        tunnel.check()
      }
      expect(tester).to.throw(Error)
      process.env.SAUCE_ACCESS_KEY = env_key
    })

    it('should fail if user name is in neither input nor environment', function() {
      var env_key = process.env.SAUCE_USERNAME
      function tester() {
        delete process.env.SAUCE_USERNAME
        tunnel = new Tunnel()
        tunnel.check()
      }
      expect(tester).to.throw(Error)
      process.env.SAUCE_USERNAME = env_key
    })

    it('its output must include "--api-key" argument', function() {
      tunnel = new Tunnel()
      var args = tunnel.check({ })
      expect(args.indexOf('--api-key')).to.not.equal(-1)
    })

    it('its output must include "--user" argument', function() {
      tunnel = new Tunnel()
      var args = tunnel.check({ })
      expect(args.indexOf('--user')).to.not.equal(-1)
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

    it('should prevent starting a tunnel without an identifier if a tunnel with an identifier exists and differentiating parameters (logfile, pidfile, scproxyPort, sePort) are not provided', function() {
      var tunnel1 = new Tunnel({tunnelIdentifier: 'test-1'})
      var tunnel2 = new Tunnel()
      return tunnel1.start()
      .then(() => {
        expect(tunnel1).to.not.be.null
        expect(tunnel1.process.pid).to.not.be.undefined
        expect(tunnel1.process.tunnelId).not.to.be.undefined
        expect(tunnel1.process.tunnelId).to.equal('test-1')
        return tunnel2.start()
      })
      .catch(err => {
        expect(err.message).to.contain('all of logfile,pidfile,scproxyPort,sePort arguments must be provided for creating the new tunnel as otherwise it would conflict with existing tunnels and would not start')
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

    it('should prevent starting a tunnel with an identifier if a tunnel without an identifier exists and differentiating parameters (logfile, pidfile, scproxyPort, sePort) are not provided', function() {
      var tunnel1 = new Tunnel()
      var tunnel2 = new Tunnel({tunnelIdentifier: 'test-1'})
      return tunnel1.start()
      .then(() => {
        expect(tunnel1).to.not.be.null
        expect(tunnel1.process.pid).to.not.be.undefined
        expect(tunnel1.process.tunnelId).to.be.undefined
        return tunnel2.start()
      })
      .catch(err => {
        expect(err.message).to.contain('all of logfile,pidfile,scproxyPort,sePort arguments must be provided for creating the new tunnel as otherwise it would conflict with existing tunnels and would not start')
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

    it('should fail to start a tunnel without identifier if its arguments create a conflict with an existing tunnel even though all required differentiating parameters (logfile, pidfile, scproxyPort, sePort) are provided', function() {
      var logfile = path.resolve(process.cwd(), 'sauce-tunnel-tmp-' + Math.random().toString().substr(2) + '.txt')
      var tunnel1 = new Tunnel({tunnelIdentifier: 'test-1'})
      var tunnel2 = new Tunnel({
        logfile: logfile,
        pidfile: path.resolve(process.cwd(), Math.random().toString().substr(2) + '.pid'),
        scproxyPort: 65000,
        sePort: 4445 // this being default conflicts
      })
      return tunnel1.start()
      .then(() => {
        expect(tunnel1).to.not.be.null
        expect(tunnel1.process.pid).to.not.be.undefined
        expect(tunnel1.process.tunnelId).not.to.be.undefined
        expect(tunnel1.process.tunnelId).to.equal('test-1')
        return tunnel2.start()
      })
      .catch(err => {
        expect(err.message).to.contain('Unexpected exit with code 1')
        return Manager.running()
      })
      .then(procs => {
        if(1 !== procs.length) {
          utils.log.warn('expected 1 tunnel to be running')
        }
        return utils.ensureZeroTunnels()
      })
      .then(() => {
        return fs.unlinkAsync(logfile)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail to start a tunnel with an identifier if its arguments create a conflict with an existing tunnel even though all required differentiating parameters (logfile, pidfile, scproxyPort, sePort) are provided', function() {
      var logfile = path.resolve(process.cwd(), 'sauce-tunnel-tmp-' + Math.random().toString().substr(2) + '.txt')
      var tunnel1 = new Tunnel()
      var tunnel2 = new Tunnel({
        tunnelIdentifier: 'test-1',
        logfile: logfile,
        pidfile: path.resolve(process.cwd(), Math.random().toString().substr(2) + '.pid'),
        scproxyPort: 65000,
        sePort: 4445 // this being default conflicts
      })
      return tunnel1.start()
      .then(() => {
        expect(tunnel1).to.not.be.null
        expect(tunnel1.process.pid).to.not.be.undefined
        expect(tunnel1.process.tunnelId).to.be.undefined
        return tunnel2.start()
      })
      .catch(err => {
        expect(err.message).to.contain('Unexpected exit with code 1')
        return Manager.running()
      })
      .then(procs => {
        if(1 !== procs.length) {
          utils.log.warn('expected 1 tunnel to be running')
        }
        return utils.ensureZeroTunnels()
      })
      .then(() => {
        return fs.unlinkAsync(logfile)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should start a tunnel without an identifier while automatically stopping an existing tunnel without an identifier if all required differentiating parameters (logfile, pidfile, scproxyPort, sePort) are provided in such a way that there is no conflict between the two tunnel processes', function() {
      var logfile = path.resolve(process.cwd(), 'sauce-tunnel-tmp-' + Math.random().toString().substr(2) + '.txt')
      var tunnel1 = new Tunnel()
      var tunnel2 = new Tunnel({
        logfile: logfile,
        pidfile: path.resolve(process.cwd(), Math.random().toString().substr(2) + '.pid'),
        scproxyPort: 65000,
        sePort: 65001
      })
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
        return Manager.running()
      })
      .then(procs => {
        if(1 !== procs.length) {
          utils.log.warn('expected only 1 tunnel to be running')
        }
        return utils.ensureZeroTunnels()
      })
      .then(() => {
        return fs.unlinkAsync(logfile)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should start a tunnel with an identifier while automatically stopping an existing tunnel with same identifier if all required differentiating parameters (logfile, pidfile, scproxyPort, sePort) are provided in such a way that there is no conflict between the two tunnel processes', function() {
      var logfile = path.resolve(process.cwd(), 'sauce-tunnel-tmp-' + Math.random().toString().substr(2) + '.txt')
      var tunnel1 = new Tunnel({tunnelIdentifier: 'test-1'})
      var tunnel2 = new Tunnel({
        tunnelIdentifier: 'test-1',
        logfile: logfile,
        pidfile: path.resolve(process.cwd(), Math.random().toString().substr(2) + '.pid'),
        scproxyPort: 65000,
        sePort: 65001
      })
      return tunnel1.start()
      .then(() => {
        expect(tunnel1).to.not.be.null
        expect(tunnel1.process.pid).to.not.be.undefined
        expect(tunnel1.process.tunnelId).not.to.be.undefined
        expect(tunnel1.process.tunnelId).to.equal('test-1')
        return tunnel2.start()
      })
      .then(() => {
        expect(tunnel2).to.not.be.null
        expect(tunnel2.process.pid).to.not.be.undefined
        expect(tunnel2.process.tunnelId).not.to.be.undefined
        expect(tunnel2.process.tunnelId).to.equal('test-1')
        return Manager.running()
      })
      .then(procs => {
        if(1 !== procs.length) {
          utils.log.warn('expected only 1 tunnel to be running')
        }
        return utils.ensureZeroTunnels()
      })
      .then(() => {
        return fs.unlinkAsync(logfile)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should be able to start multiple tunnels with non-conflicting required differentiator arguments', function() {
      var logfile1 = path.resolve(process.cwd(), 'sauce-tunnel-tmp-' + Math.random().toString().substr(2) + '.txt')
      var logfile2 = path.resolve(process.cwd(), 'sauce-tunnel-tmp-' + Math.random().toString().substr(2) + '.txt')
      var tunnel1 = new Tunnel({tunnelIdentifier: 'test-1'})
      var tunnel2 = new Tunnel({
        tunnelIdentifier: 'test-2',
        logfile: logfile1,
        pidfile: path.resolve(process.cwd(), Math.random().toString().substr(2) + '.pid'),
        scproxyPort: 65000,
        sePort: 65001
      })
      var tunnel3 = new Tunnel({
        logfile: logfile2,
        pidfile: path.resolve(process.cwd(), Math.random().toString().substr(2) + '.pid'),
        scproxyPort: 65002,
        sePort: 65003
      })
      return tunnel1.start()
      .then(() => {
        expect(tunnel1).to.not.be.null
        expect(tunnel1.process.pid).to.not.be.undefined
        expect(tunnel1.process.tunnelId).not.to.be.undefined
        expect(tunnel1.process.tunnelId).to.equal('test-1')
        return tunnel2.start()
      })
      .then(() => {
        expect(tunnel2).to.not.be.null
        expect(tunnel2.process.pid).to.not.be.undefined
        expect(tunnel2.process.tunnelId).not.to.be.undefined
        expect(tunnel2.process.tunnelId).to.equal('test-2')
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
      .then(() => {
        return fs.unlinkAsync(logfile1)
      })
      .then(() => {
        return fs.unlinkAsync(logfile2)
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
