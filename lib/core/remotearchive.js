'use strict';

let
  Bluebird = require('bluebird'),
  fs = Bluebird.promisifyAll(require('fs')),
  decompress = require('decompress'),
  decompressTarGz = require('decompress-targz'),
  decompressUnzip = require('decompress-unzip'),
  path = require('path'),
  rmdir = require('./utils').rmdir,
  Log = require('./log').Log,
  RemoteFile = require('./remotefile').RemoteFile

const
  log = new Log('RemoteArchive'),
  map = {
    zip: decompressUnzip,
    tgz: decompressTarGz
  }

class RemoteArchive extends RemoteFile {

  constructor(url, filePath, extractTo, maxRetries, factor, minTimeout) {
    super(url, filePath, maxRetries, factor, minTimeout)
    this.type =
      this.url.match(/\.zip$/)
      ? 'zip'
      : this.url.match(/\.tar\.gz$/) || this.url.match(/\.tgz$/)
        ? 'tgz'
        : undefined
    this.extractTo = extractTo || path.resolve(process.cwd(), 'dist')
  }

  extract() {
    if(!this.type) {
      throw new Error('Unsupported archive ' + this.url)
    }
    return decompress(this.path, this.extractTo, {
      plugins: [ map[this.type]() ]
    })
    .then(files => {
      log.debug('extracted', files)
      return true
    })
  }

  remove() {
    return RemoteFile.prototype.remove.call(this)
    .then(() => {
      if(fs.existsSync(this.extractTo)) {
        return rmdir(this.extractTo)
      }
      else {
        return Promise.resolve(true)
      }
    })
  }

}

exports.RemoteArchive = RemoteArchive
