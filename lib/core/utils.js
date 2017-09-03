'use strict'

let
  Bluebird = require('bluebird'),
  fs = Bluebird.promisifyAll(require('fs')),
  path = require('path')

const swapKV = obj => {
  let ret = { }
  Object.keys(obj).forEach(key => {
    ret[obj[key]] = key
  })
  return ret
}

const COLORS = {
  FAIL: "\x1b[31m",
  OK: "\x1b[32m",
  RESET: "\x1b[0m"
}

const rmdir = dir => {
  var subdirs = [ ], files = [ ]
  const readEntries = (d, s, f) => {
    fs.readdirSync(d).forEach(item => {
      var entry = path.resolve(d, item)
      var stat = fs.statSync(entry)
      if(stat.isDirectory()) {
        readEntries(entry, s, f)
      } else {
        f.push(fs.unlinkAsync(entry))
      }
    })
    s.push(d)
  }
  readEntries(dir, subdirs, files)
  return Bluebird.all(files)
  .then(() => {
    return Bluebird.mapSeries(subdirs, subdir => {
      return fs.rmdirAsync(subdir)
    })
  })
}

exports.swapKV = swapKV
exports.rmdir = rmdir
exports.COLORS = COLORS
