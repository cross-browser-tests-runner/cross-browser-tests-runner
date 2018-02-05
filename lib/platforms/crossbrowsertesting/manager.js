'use strict';

let
  Env = require('./../../core/env').Env,
  ManagerCore = require('./../core/manager').Manager,
  Process = require('./tunnel/process').Process,
  BinaryVars = require('./tunnel/binary').BinaryVars

const VARS = {
  processName: (!Env.isWindows ? BinaryVars.path : 'cbt-tunnels-win64.exe')
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
