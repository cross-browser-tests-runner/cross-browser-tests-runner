'use strict';

class Tunnel {

  start() {
    throw new Error('Tunnel.start')
  }

  stop() {
    throw new Error('Tunnel.stop')
  }

  status() {
    throw new Error('Tunnel.status')
  }

  check() {
    throw new Error('Tunnel.check')
  }

  exists() {
    throw new Error('Tunnel.exists')
  }

  fetch() {
    throw new Error('Tunnel.fetch')
  }

  remove() {
    throw new Error('Tunnel.remove')
  }
}

exports.Tunnel = Tunnel
