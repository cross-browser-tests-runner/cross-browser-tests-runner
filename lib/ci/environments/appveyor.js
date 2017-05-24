'use strict'

let
  CI = require('./../interfaces/ci').CI

class Appveyor extends CI {

  static get in() {
    return ('APPVEYOR_JOB_ID' in process.env)
  }

  static get project() {
    return process.env.APPVEYOR_PROJECT_SLUG
  }

  static get session() {
    return 'Appveyor ' + process.env.APPVEYOR_JOB_NAME
  }

  static get commit() {
    return process.env.APPVEYOR_REPO_COMMIT
  }

}

exports.Appveyor = Appveyor
