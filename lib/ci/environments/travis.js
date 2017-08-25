'use strict'

let
  uuidv4 = require('uuid').v4,
  CI = require('./../interfaces/ci').CI

class Travis extends CI {

  static get in() {
    return ('TRAVIS_BUILD_ID' in process.env)
  }

  static get project() {
    return process.env.TRAVIS_REPO_SLUG
  }

  static get session() {
    return 'TRAVIS-' + process.env.TRAVIS_BUILD_NUMBER + "." + process.env.TRAVIS_JOB_NUMBER + '-' + uuidv4()
  }

  static get commit() {
    return process.env.TRAVIS_COMMIT
  }

}

exports.Travis = Travis
