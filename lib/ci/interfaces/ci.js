'use strict'

class CI {

  static get in() {
    throw new Error('CI.in')
  }

  static get project() {
    throw new Error('CI.project')
  }

  static get session() {
    throw new Error('CI.session')
  }

  static get commit() {
    throw new Error('CI.commit')
  }

}

exports.CI = CI
