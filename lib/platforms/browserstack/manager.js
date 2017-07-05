'use strict';

let
  ps = require('ps-node'), // for checking tunnel processes
  path = require('path'),
  Bluebird = require('bluebird'),
  Log = require('./../../core/log').Log,
  Process = require('./tunnel/process').Process,
  BinaryVars = require('./tunnel/binary').BinaryVars

const VARS = {
  processName: path.basename(BinaryVars.path)
}
  
let log = new Log(process.env.LOG_LEVEL || 'ERROR', 'Platforms.BrowserStack.Tunnel.Manager')

class Manager {

  static running() {
    return find()
  }

  static withId() {
    return find()
    .then(found => {
      let withId = [ ]
      found.forEach(function(proc) {
        if(proc.tunnelId) {
          log.debug('found process with pid %d tunnelId %s', proc.pid, proc.tunnelId)
          withId.push(proc)
        }
      })
      log.debug('found %d tunnel processes with local identifiers', withId.length)
      return withId
    })
  }

  static withoutId() {
    return find()
    .then(found => {
      let withoutId = [ ]
      found.forEach(function(proc) {
        if(!proc.tunnelId) {
          log.debug('found process with pid %d without tunnelId', proc.pid)
          withoutId.push(proc)
        }
      })
      log.debug('found %d tunnel processes without local identifiers', withoutId.length)
      return withoutId
    })
  }
}

function find() {
  return new Bluebird((resolve, reject) => {
    let found = [ ]
    ps.lookup({
      command: VARS.processName
    },
    function(err, list) {
      if(err) {
        reject(err)
        return
      }
      list.forEach(function(proc){
        let idx = proc.arguments.indexOf('--local-identifier')
        found.push(new Process(
          parseInt(proc.pid, 10), 
          (-1 !== idx ? proc.arguments[idx+1] : undefined)
        ))
      })
      log.debug('found %d tunnel processes', found.length)
      resolve(found)
    })
  })
}

if(process.env.UNIT_TESTS) {
  Manager.prototype.find = find
}

exports.Manager = Manager
exports.ManagerVars = VARS
