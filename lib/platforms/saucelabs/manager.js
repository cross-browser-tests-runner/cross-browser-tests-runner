'use strict';

let
  Env = require('./../../core/env').Env,
  ManagerCore = require('./../core/manager').Manager,
  Process = require('./tunnel/process').Process,
  ArchiveVars = require('./tunnel/archive').ArchiveVars

const VARS = {
  processName: (!Env.isWindows ? ArchiveVars.binary : 'sc.exe'),
  tunnelArg: '--tunnel-identifier'
}

class Manager {

  static running() {
    return ManagerCore.running(Process, VARS.processName, VARS.tunnelArg)
  }

  static withId() {
    return ManagerCore.withId(Process, VARS.processName, VARS.tunnelArg)
  }

  static withoutId() {
    return ManagerCore.withoutId(Process, VARS.processName, VARS.tunnelArg)
  }

}

exports.Manager = Manager
