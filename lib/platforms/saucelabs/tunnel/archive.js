'use strict';

let
  path = require('path'),
  RemoteArchive = require('./../../../core/remotearchive').RemoteArchive,
  Env = require('./../../../core/env').Env

const
  tunnelVersions = require('./../../../../conf/sauce-tunnels-versions.json'),
  saucePlatformMap = {
    windows: 'win32',
    osx: 'osx',
    linux: '64' === Env.arch ? 'linux' : 'linux32'
  },
  sauceTunnelDetails = tunnelVersions['Sauce Connect'][saucePlatformMap[Env.platform]]

const VARS = {
  url: sauceTunnelDetails.download_url,
  path: path.resolve(__dirname, sauceTunnelDetails.download_url.replace(/^.*\/sc/, 'sc')),
  binary: path.resolve(__dirname, 'dist', sauceTunnelDetails.download_url.replace(/^.*\/sc/, 'sc').replace(/\.zip/,'').replace(/\.tgz/,'').replace(/\.tar\.gz/,''), 'bin', 'sc' + (Env.isWindows ? '.exe' : '')),
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
