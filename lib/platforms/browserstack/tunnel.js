'use strict';

let
  retry = require('p-retry'),
  Log = require('./../../core/log').Log,
  TunnelInterface = require('./../interfaces/tunnel').Tunnel,
  Options = require('./tunnel/options').Options,
  binary = require('./tunnel/binary'),
  Binary = binary.Binary,
  BinaryVars = binary.BinaryVars,
  Process = require('./tunnel/process').Process,
  Manager = require('./manager').Manager

let log = new Log('Platforms.BrowserStack.Tunnel')

class Tunnel extends TunnelInterface {

  constructor(settings, proc) {
    super()
    this.settings = settings || { }
    this.options = new Options(this.settings)
    this.process = proc || new Process(undefined, settings && settings.localIdentifier)
    this.binary = new Binary()
  }

  start() {
    if (this.process.pid && 'running' === this.process.status()) {
      throw new Error('Platforms.BrowserStack.Tunnel: already started with pid ' + this.process.pid)
    }
    if(!this.settings.localIdentifier) {
      return startNoId(this)
    } else {
      return startWithId(this)
    }
  }

  stop() {
    return this.process.stop()
  }

  status() {
    return this.process.status()
  }

  check(input) {
    return this.options.process(input)
  }

  exists() {
    return this.binary.exists()
  }

  fetch() {
    return this.binary.fetch()
  }

  remove() {
    return this.binary.remove()
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
      log.debug('no tunnel processes without a local identifiere were found, hence starting a new one with local identifiere %s', tunnel.settings.localIdentifier)
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
  const max = 5, minTimeout = 1000, factor = 2
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
  var args = tunnel.options.process(tunnel.settings)
  return tunnel.binary.fetch()
  .then(() => {
    return tunnel.process.create(BinaryVars.path, args)
  })
}

exports.Tunnel = Tunnel
