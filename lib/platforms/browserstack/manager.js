'use strict';

let
  ps = require('ps-node'), // for checking tunnel processes
  path = require('path'),
  Bluebird = require('bluebird'),
  Process = require('./tunnel/process').Process,
  BinaryVars = require('./tunnel/binary').BinaryVars

const VARS = {
  processName: path.basename(BinaryVars.path)
}

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
          withId.push(proc)
        }
      })
      return withId
    })
  }

  static withoutId() {
    return find()
    .then(found => {
      let withoutId = [ ]
      found.forEach(function(proc) {
        if(!proc.tunnelId) {
          withoutId.push(proc)
        }
      })
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
      resolve(found)
    })
  })
}

exports.Manager = Manager
exports.ManagerVars = VARS
