'use strict';

var
  retry = require('p-retry'),
  chai = require('chai'),
  spies = require('chai-spies'),
  chaiAsPromised = require('chai-as-promised'),
  platform = require('./../../../../../../lib/platforms/saucelabs/platform'),
  Platform = platform.Platform,
  Manager = require('./../../../../../../lib/platforms/saucelabs/manager').Manager,
  utils = require('./../utils')

chai.use(spies)
chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('open', function() {

  var platform = new Platform()
  this.timeout(0)

  it('should silently complete if no input is provided', function() {
    return platform.open()
    .should.be.fulfilled
  })

  it('should fail if capabilities input parameter is not of array type', function() {
    function tester() {
      platform.open({ local: true })
    }
    expect(tester).to.throw('capabilitiesArr.forEach is not a function')
  })

  it('should fail if an unsupported capabilities key is provided', function() {
    function tester() {
      platform.open([{
        abc: 123
      }])
    }
    expect(tester).to.throw('option abc is not allowed')
  })

  it('should open the platform by creating a tunnel process without identifier if local capability key is provided', function() {
    return platform.open([{
      local: true
    }])
    .then(() => {
      platform.stopMonitoring = true
      return Manager.withoutId()
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

  function waitForTunnel() {
    const check = () => {
      return Manager.withoutId()
      .then(procs => {
        if(procs.length) {
          utils.log.debug('Got a tunnel process')
          return true
        }
        utils.log.debug('No tunnels running yet')
        throw new Error('no tunnels yet')
      })
    },
    minTimeout = 1000, factor = 1, max = 240
    return retry(check, {minTimeout: minTimeout, factor: factor, retries: max})
  }

  it('should open the plaform by creating a tunnel process without identifier if local capability key is specified and then monitor and restart the tunnel process if it dies', function() {
    platform.stopMonitoring = false
    platform.tunnels = [ ]
    return platform.open([{
      local: true
    }])
    .then(() => {
      return Manager.withoutId()
    })
    .then(procs => {
      if(1 !== procs.length) {
        utils.log.warn('expected 1 tunnel to be running')
      }
      utils.stopProc(platform.tunnels[0].process.pid)
      return true
    })
    .catch(err => {
      if(err && err.message && err.message.match(/Process: already stopped/)) {
        utils.log.warn('did not expect tunnels to be stopped already')
        return true
      }
      utils.log.error('error: ', err)
      throw err
    })
    .then(() => {
      return waitForTunnel()
    })
    .then(() => {
      platform.stopMonitoring = true
      return utils.ensureZeroTunnels()
    })
    .catch(err => {
      if(err && err.message && err.message.match(/Process: already stopped/)) {
        utils.log.warn('did not expect tunnels to be stopped already')
        return true
      }
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

})
