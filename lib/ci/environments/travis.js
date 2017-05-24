'use strict'

let
  CI = require('./../interfaces/ci').CI

class Travis extends CI {

  static get in() {
    return ('TRAVIS_BUILD_ID' in process.env)
  }

  static get project() {
    return process.env.TRAVIS_REPO_SLUG
  }

  static get session() {
    return 'Travis ' + process.env.TRAVIS_JOB_NUMBER
  }

  static get commit() {
    return process.env.TRAVIS_COMMIT
  }

}

exports.Travis = Travis
