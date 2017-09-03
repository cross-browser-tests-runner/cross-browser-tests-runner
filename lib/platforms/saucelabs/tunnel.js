'use strict';

let
  fs = require('fs'),
  TunnelCore = require('./../core/tunnel').Tunnel,
  Options = require('./tunnel/options').Options,
  archive = require('./tunnel/archive'),
  Archive = archive.Archive,
  ArchiveVars = archive.ArchiveVars,
  Process = require('./tunnel/process').Process,
  Manager = require('./manager').Manager

const
  multiTunnelArgs = [
    'logfile',
    'pidfile',
    'scproxyPort',
    'sePort'
  ]

class Tunnel extends TunnelCore {

  constructor(settings, proc) {
    super(Options, Process, Archive, 'tunnelIdentifier', settings, proc)
  }

  start() {
    TunnelCore.prototype.start.call(this)
    if(!this.settings.tunnelIdentifier) {
      return startNoId(this)
    } else {
      return startWithId(this)
    }
  }

  fetch() {
    return this.exe.fetch()
    .then(() => {
      if(!fs.existsSync(this.exe.binary)) {
        return this.exe.extract()
      }
      return Promise.resolve(true)
    })
  }

}

function startNoId(tunnel) {
  return Manager.running()
  .then(running => {
    if(running.length) {
      ensureMultiTunnelArgs(tunnel.settings)
    }
    return startTunnel(tunnel)
  })
}

function startWithId(tunnel) {
  return Manager.running()
  .then(running => {
    if(running.length) {
      ensureMultiTunnelArgs(tunnel.settings)
    }
    return startTunnel(tunnel)
  })
}

function startTunnel(tunnel) {
  let args = tunnel.options.process(tunnel.settings)
  return tunnel.fetch()
  .then(() => {
    return tunnel.process.create(ArchiveVars.binary, args)
  })
}

function ensureMultiTunnelArgs(settings) {
  for(let idx = 0; idx < multiTunnelArgs.length; ++idx) {
    if(!settings[multiTunnelArgs[idx]]) {
      throw new Error('Platforms.SauceLabs.Tunnel: all of ' + multiTunnelArgs.toString() + ' arguments must be provided for creating the new tunnel as otherwise it would conflict with existing tunnels and would not start')
    }
  }
}

exports.Tunnel = Tunnel
