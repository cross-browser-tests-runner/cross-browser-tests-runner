'use strict';

let
  path = require('path'),
  RemoteArchive = require('./../../../core/remotearchive').RemoteArchive,
  Env = require('./../../../core/env').Env

const
  cbtPlatformMap = {
    windows: 'win',
    osx: 'mac',
    linux: 'linux'
  },
  url = 'https://app.crossbrowsertesting.com/binaries/cbt-tunnels-' + cbtPlatformMap[Env.platform] + '.zip'

const VARS = {
  url: url,
  path: path.resolve(
    __dirname,
    url.replace(/^.*cbt\-tunnels/, 'cbt-tunnels')
  ),
  binary: path.resolve(
    __dirname,
    'dist',
    url.replace(/^.*cbt\-tunnels/, 'cbt-tunnels').replace(/\.zip/, '')
      + (Env.isWindows ? '.exe' : '')
  ),
  extractTo: path.resolve(__dirname, 'dist'),
  maxRetries: 10,
  factor: 1,
  minTimeout: 1000
}

class Archive extends RemoteArchive {

  constructor() {
    super(VARS.url, VARS.path, VARS.extractTo, VARS.maxRetries, VARS.factor, VARS.minTimeout)
    this.binary = VARS.binary
  }

}

exports.Archive = Archive
exports.ArchiveVars = VARS
