'use strict'

class Env {

  static get isWindows() {
    return ((process.platform.match(/win32/) || process.platform.match(/win64/)) !== null)
  }

}

exports.Env = Env
