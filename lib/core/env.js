'use strict'

const
  PLATFORMS_MAP = {
    win32: 'windows',
    win64: 'windows',
    darwin: 'osx'
  },
  ARCH_MAP = {
    x64: '64',
    arm64: '64'
  }

class Env {

  static get isWindows() {
    return ((process.platform.match(/win32/) || process.platform.match(/win64/)) !== null)
  }

  static get platform() {
    return PLATFORMS_MAP[process.platform] || process.platform
  }

  static get arch() {
    return ARCH_MAP[process.arch] || '32'
  }

}

exports.Env = Env
