'use strict'

let
  Bluebird = require('bluebird'),
  fs = Bluebird.promisifyAll(require('fs')),
  path = require('path'),
  uuidv4 = require('uuid/v4'),
  CiFactory = require('./../ci/factory').Factory

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

function buildParams(caps) {
  if(buildNotSpecified(caps)) {
    try {
      let Ci = CiFactory.get()
      caps.project = Ci.project
      caps.test = Ci.session
      caps.build = Ci.commit
    }
    catch(err) {
      caps.project = 'anonymous/anonymous'
      caps.test = uuidv4()
      caps.build = 'anonymous build'
    }
  }
}

function buildNotSpecified(caps) {
  return !(caps.project && caps.test && caps.build)
}


exports.swapKV = swapKV
exports.rmdir = rmdir
exports.COLORS = COLORS
exports.buildParams = buildParams
