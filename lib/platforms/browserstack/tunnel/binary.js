'use strict';

let
  path = require('path'),
  RemoteFile = require('./../../../core/remotefile').RemoteFile,
  Env = require('./../../../core/env').Env

const VARS = {
  url: 'https://s3.amazonaws.com/browserStack/browserstack-local/BrowserStackLocal' + (Env.isWindows ? '.exe' : '-' + process.platform + '-' + process.arch),
  path: path.resolve(__dirname, 'BrowserStackLocal' + (Env.isWindows ? '.exe' : '')),
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
