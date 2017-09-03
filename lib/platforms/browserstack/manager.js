'use strict';

let
  path = require('path'),
  ManagerCore = require('./../core/manager').Manager,
  Process = require('./tunnel/process').Process,
  BinaryVars = require('./tunnel/binary').BinaryVars

const VARS = {
  processName: path.basename(BinaryVars.path),
  tunnelArg: '--local-identifier'
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
