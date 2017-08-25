'use strict'

let
  uuidv4 = require('uuid').v4,
  CI = require('./../interfaces/ci').CI

class Circle extends CI {

  static get in() {
    return ('CIRCLE_BUILD_URL' in process.env)
  }

  static get project() {
    return process.env.CIRCLE_PROJECT_USERNAME + '/' + process.env.CIRCLE_PROJECT_REPONAME
  }

  static get session() {
    return 'CIRCLE-' + process.env.CIRCLE_BUILD_NUM + '.' + process.env.CIRCLE_NODE_INDEX + '-' + uuidv4()
  }

  static get commit() {
    return process.env.CIRCLE_SHA1
  }

}

exports.Circle = Circle
