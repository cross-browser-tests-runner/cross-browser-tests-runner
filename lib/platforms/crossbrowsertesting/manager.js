'use strict';

let
  Env = require('./../../core/env').Env,
  ManagerCore = require('./../core/manager').Manager,
  Process = require('./tunnel/process').Process,
  ArchiveVars = require('./tunnel/archive').ArchiveVars

const VARS = {
  processName: (!Env.isWindows ? ArchiveVars.binary : 'cbt-tunnels-win.exe')
}

class Manager {

  static running() {
    return ManagerCore.running(Process, VARS.processName)
  }

  static withId() {
    throw new Error('Platforms.CrossBrowserTesting.Manager: this platform does not use identifiers for tunnels')
  }

  static withoutId() {
    return ManagerCore.withoutId(Process, VARS.processName)
  }

}

exports.Manager = Manager
