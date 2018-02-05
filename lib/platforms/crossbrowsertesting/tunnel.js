'use strict';

let
  TunnelCore = require('./../core/tunnel').Tunnel,
  Options = require('./tunnel/options').Options,
  archive = require('./tunnel/archive'),
  Archive = archive.Archive,
  ArchiveVars = archive.ArchiveVars,
  Process = require('./tunnel/process').Process,
  Manager = require('./manager').Manager


class Tunnel extends TunnelCore {

  constructor(settings, proc) {
    super(Options, Process, Archive, undefined, settings, proc)
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
      return this.process.create(ArchiveVars.binary, args)
    })
  }

  fetch() {
    return TunnelCore.prototype.fetchArchive.call(this)
  }

}

exports.Tunnel = Tunnel
