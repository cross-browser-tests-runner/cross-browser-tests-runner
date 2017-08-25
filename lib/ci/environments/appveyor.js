'use strict'

let
  uuidv4 = require('uuid').v4,
  CI = require('./../interfaces/ci').CI

class Appveyor extends CI {

  static get in() {
    return ('APPVEYOR_JOB_ID' in process.env)
  }

  static get project() {
    return process.env.APPVEYOR_REPO_NAME
  }

  static get session() {
    return 'APPVEYOR-' + process.env.APPVEYOR_BUILD_NUMBER + '.' + process.env.APPVEYOR_JOB_NUMBER + '-' + uuidv4()
  }

  static get commit() {
    return process.env.APPVEYOR_REPO_COMMIT
  }

}

exports.Appveyor = Appveyor
