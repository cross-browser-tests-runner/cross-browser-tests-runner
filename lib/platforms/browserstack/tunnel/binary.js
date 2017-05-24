'use strict';

let
  Bluebird = require('bluebird'),
  retry = require('p-retry'),
  fs = Bluebird.promisifyAll(require('fs')),
  path = require('path'),
  Log = require('./../../../core/log').Log,
  Request = require('./../../../core/request').Request,
  RemoteBinaryInterface = require('./../../../core/interfaces/remotebinary').RemoteBinary

let log = new Log(process.env.LOG_LEVEL || 'ERROR', 'Platforms.BrowserStack.Tunnel.Binary')

const VARS = {
  isWindows: ((process.platform.match(/win32/) || process.platform.match(/win64/)) !== null),
  maxRetries: 10
}
VARS.url = 'https://s3.amazonaws.com/browserStack/browserstack-local/BrowserStackLocal' + (VARS.isWindows ? '.exe' : '-' + process.platform + '-' + process.arch)
VARS.path = path.resolve(__dirname, 'BrowserStackLocal' + (VARS.isWindows ? '.exe' : ''))

class Binary extends RemoteBinaryInterface {

  exists() {
    return fs.existsSync(VARS.path)
  }

  fetch() {
    log.debug('checking for existence of %s', VARS.path)
    if (!fs.existsSync(VARS.path)) {
      log.debug('executable %s does not exist, attempting download...', VARS.path)
      fs.chmodSync(__dirname, '0777') // this is needed on Windows
      return retry(download, {retries: VARS.maxRetries, factor: 1, minTimeout: 1000})
      .then(body => {
        log.info('downloading using %s completed', VARS.url)
        return fs.writeFileAsync(VARS.path, body)
      })
      .then(function() {
        log.info('saved into local file %s', VARS.path)
        return fs.chmodAsync(VARS.path, '0755')
      })
    }
    else {
      log.debug('executable %s exists', VARS.path)
      return new Bluebird(resolve => {
        resolve()
      })
    }
  }

  remove() {
    return fs.unlinkAsync(VARS.path) // a promise
  }

}

function download(retries) {
  if(VARS.maxRetries === retries) {
    log.error('max retries of downloading attempted, aborting...')
    throw new retry.AbortError('Platforms.BrowserStack.Tunnel.Binary: aborting download as max retries of downloading have failed')
  }
  log.debug('fetching executable using url %s', VARS.url)
  let req = new Request()
  return req.request(VARS.url, 'GET', { encoding : null })
}

exports.Binary = Binary
exports.BinaryVars = VARS
