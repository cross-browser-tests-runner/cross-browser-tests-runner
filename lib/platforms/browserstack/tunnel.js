'use strict';

let
  retry = require('p-retry'),
  Log = require('./../../core/log').Log,
  TunnelCore = require('./../core/tunnel').Tunnel,
  Options = require('./tunnel/options').Options,
  binary = require('./tunnel/binary'),
  Binary = binary.Binary,
  BinaryVars = binary.BinaryVars,
  Process = require('./tunnel/process').Process,
  Manager = require('./manager').Manager

let log = new Log('Platforms.BrowserStack.Tunnel')

class Tunnel extends TunnelCore {

  constructor(settings, proc) {
    super(Options, Process, Binary, 'localIdentifier', settings, proc)
  }

  start() {
    TunnelCore.prototype.start.call(this)
    if(!this.settings.localIdentifier) {
      return startNoId(this)
    } else {
      return startWithId(this)
    }
  }

}

function startNoId(tunnel) {
  return Manager.withId()
  .then(withId => {
    if(withId.length) {
      log.error('a tunnel process with local identifier is found to be running, hence starting a new one without a local identifier would not be allowed')
      throw new Error('Platforms.BrowserStack.Tunnel: attempt to start a tunnel without a local identifier is not allowed when a tunnel process with a local identifier exists')
    }
    return startTunnel(tunnel)
  })
}

function startWithId(tunnel) {
  return Manager.withoutId()
  .then(withoutId => {
    if(withoutId.length) {
      log.debug('a tunnel process without local identifier is found, and it would be stopped before starting the new one with local identifier %s', tunnel.settings.localIdentifier)
      return withoutId[0].stop()
    }
    else {
      log.debug('no tunnel processes without a local identifier were found, hence starting a new one with local identifier %s', tunnel.settings.localIdentifier)
      return true
    }
  })
  .catch(err => {
    if(err.message && err.message.match(/already stopped/)) {
      return true
    }
    throw err
  })
  .then(() => {
    return awaitZeroWithoutId()
  })
  .then(()=> {
    return startTunnel(tunnel)
  })
}

function awaitZeroWithoutId() {
  const max = 6, minTimeout = 2000, factor = 1
  const check = () => {
    return Manager.withoutId()
    .then(withoutId => {
      let num = withoutId.length
      if(!num) {
        return num
      }
      throw new Error('Platforms.BrowserStack.Tunnel: retries going on')
    })
  }
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
}

function startTunnel(tunnel) {
  let args = tunnel.options.process(tunnel.settings)
  return tunnel.fetch()
  .then(() => {
    return tunnel.process.create(BinaryVars.path, args)
  })
}

exports.Tunnel = Tunnel
