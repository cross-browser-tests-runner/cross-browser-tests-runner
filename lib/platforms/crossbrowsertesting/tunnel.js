'use strict';

let
  TunnelCore = require('./../core/tunnel').Tunnel,
  Options = require('./tunnel/options').Options,
  binary = require('./tunnel/binary'),
  Binary = binary.Binary,
  BinaryVars = binary.BinaryVars,
  Process = require('./tunnel/process').Process


class Tunnel extends TunnelCore {

  constructor(settings, proc) {
    super(Options, Process, Binary, 'tunnelname', settings, proc)
  }

  start() {
    TunnelCore.prototype.start.call(this)
    let args = this.options.process(this.settings)
    return this.fetch()
    .then(() => {
      return this.process.create(BinaryVars.path, args)
    })
  }

}

exports.Tunnel = Tunnel
