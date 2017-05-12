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

let log = new Log(process.env.LOG_LEVEL || 'ERROR', 'Platforms.BrowserStack.Tunnel')

class Tunnel extends TunnelInterface {

  constructor(settings) {
    super()
    this.options = new Options(settings)
    this.process = new Process(undefined, settings && settings.localIdentifier)
    this.binary = new Binary()
    this.settings = settings || { }
  }

  start() {
    if (this.process.pid && 'running' === this.process.status()) {
      log.error('already started with pid %d', this.process.pid)
      throw new Error('Tunnel: already started with pid ' + this.process.pid)
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

  fetch() {
    return this.binary.fetch()
  }

  remove() {
    return this.binary.remove()
  }

}

function startNoId(tunnel) {
  log.debug('performing prerequisite checks for the case of starting a tunnel without a local identifier')
  return Manager.withId()
  .then(withId => {
    if(withId.length) {
      log.error('a tunnel process with local identifier is found to be running, hence starting a new one without a local identifier would not be allowed')
      throw new Error('Tunnel: attempt to start a tunnel without a local identifier is not allowed when a tunnel process with a local identifier exists')
    }
    return startTunnel(tunnel)
  })
}

function startWithId(tunnel) {
  log.debug('performing prerequisites checks for the case of starting a tunnel with a local identifier %s', tunnel.settings.localIdentifier)
  return Manager.withoutId()
  .then(withoutId => {
    if(withoutId.length) {
      log.info('a tunnel process without local identifier is found, and it would be stopped before starting the new one with local identifier %s', tunnel.settings.localIdentifier)
      if(! process.env.UNIT_TESTS_CAUSE_TROUBLE_1) {
        return withoutId[0].stop()
      } else {
        return true
      }
    }
    else {
      log.debug('no tunnel processes without a local identifiere were found, hence starting a new one with local identifiere %s', tunnel.settings.localIdentifier)
      return true
    }
  })
  .then(() => {
    return awaitZeroWithoutId()
  })
  .then(result => {
    if(result) {
      throw new Error('Platforms.BrowserStack.Tunnel: start: processes without id remain after more than 5 seconds of stopping them. Need to abort.')
    }
    return startTunnel(tunnel)
  })
  .catch(err => {
    throw err
  })
}

function awaitZeroWithoutId() {
  const max = 10
  const check = (retries) => {
    return Manager.withoutId()
    .then(withoutId => {
      let num = withoutId.length
      log.debug('number of remaining processes without id', num)
      if(!num) {
        return num
      }
      if(retries < max) {
        throw new Error('retries going on')
      }
      return num
    })
  }
  return retryAwaitWithoutId(max, check)
}

function retryAwaitWithoutId(max, check) {
  const minTimeout = 500, factor = 1
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
  .catch(err => {
    throw err
  })
}

function startTunnel(tunnel) {
  var args = tunnel.options.process(tunnel.settings)
  return tunnel.binary.fetch()
  .then(() => {
    return tunnel.process.create(BinaryVars.path, args)
  })
}

exports.Tunnel = Tunnel
