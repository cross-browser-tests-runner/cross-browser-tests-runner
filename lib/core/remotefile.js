'use strict';

let
  Bluebird = require('bluebird'),
  retry = require('p-retry'),
  fs = Bluebird.promisifyAll(require('fs')),
  path = require('path'),
  Log = require('./log').Log,
  Request = require('./request').Request

const log = new Log('RemoteFile')

class RemoteFile {

  constructor(url, path, maxRetries, factor, minTimeout) {
    this.url = url
    this.path = path
    this.maxRetries = maxRetries
    this.factor = factor
    this.minTimeout = minTimeout
  }

  exists() {
    return fs.existsSync(this.path)
  }

  fetch() {
    if (!fs.existsSync(this.path)) {
      log.info('executable %s does not exist, attempting download using %s...', this.path, this.url)
      fs.chmodSync(path.dirname(this.path), '0777') // this is needed on Windows
      const downloader = (retries) => {
        return download(this.url, this.maxRetries, retries)
      }
      return retry(downloader,
        {retries: this.maxRetries, factor: this.factor, minTimeout: this.minTimeout}
      )
      .then(body => {
        log.debug('downloading tunnel binary from %s completed', this.url)
        return fs.writeFileAsync(this.path, body)
      })
      .then(() => {
        log.info('saved downloaded tunnel binary into local file %s', this.path)
        return fs.chmodAsync(this.path, '0755')
      })
    }
    else {
      return Bluebird.resolve(true)
    }
  }

  remove() {
    return fs.unlinkAsync(this.path) // a promise
  }

}

function download(url, maxRetries, retries) {
  if(maxRetries === retries) {
    log.error('max retries of downloading attempted, aborting...')
    throw new retry.AbortError('RemoteFile: aborting download as max retries of downloading have failed')
  }
  let req = new Request()
  return req.request(url, 'GET', { encoding : null })
}

exports.RemoteFile = RemoteFile
