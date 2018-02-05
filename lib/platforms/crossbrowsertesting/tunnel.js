'use strict';

let
  TunnelCore = require('./../core/tunnel').Tunnel,
  Options = require('./tunnel/options').Options,
  binary = require('./tunnel/binary'),
  Binary = binary.Binary,
  BinaryVars = binary.BinaryVars,
  Process = require('./tunnel/process').Process,
  Manager = require('./manager').Manager


class Tunnel extends TunnelCore {

  constructor(settings, proc) {
    super(Options, Process, Binary, undefined, settings, proc)
  }

  start() {
    TunnelCore.prototype.start.call(this)
    return Manager.withoutId()
    .then(procs => {
      if(procs.length) {
        throw new Error('Platforms.CrossBrowserTesting.Tunnel: a tunnel exists already')
      }
      return this.fetch()
    })
    .then(() => {
      let args = this.options.process(this.settings)
      return this.process.create(BinaryVars.path, args)
    })
  }

}

exports.Tunnel = Tunnel
