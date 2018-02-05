'use strict';

let
  path = require('path'),
  RemoteFile = require('./../../../core/remotefile').RemoteFile,
  Env = require('./../../../core/env').Env

const
  cbtPlatformMap = {
    windows: 'win64',
    osx: 'macos',
    linux: 'linux64'
  },
  url = 'https://github.com/crossbrowsertesting/cbt-tunnel-nodejs/releases/download/v0.2.8/cbt-tunnels-' + cbtPlatformMap[Env.platform] + (Env.isWindows ? '.exe' : '')

const VARS = {
  url: url,
  path: path.resolve(__dirname, url.replace(/^.*cbt\-tunnels/, 'cbt-tunnels')),
  maxRetries: 10,
  factor: 1,
  minTimeout: 1000
}

class Binary extends RemoteFile {

  constructor() {
    super(VARS.url, VARS.path, VARS.maxRetries, VARS.factor, VARS.minTimeout)
  }

}

exports.Binary = Binary
exports.BinaryVars = VARS
