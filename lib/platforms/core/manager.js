'use strict';

let
  ps = require('ps-node'), // for checking tunnel processes
  Bluebird = require('bluebird')

class Manager {

  static running(ProcessClass, command, tunnelIdArg) {
    return find(ProcessClass, command, tunnelIdArg)
  }

  static withId(ProcessClass, command, tunnelIdArg) {
    return find(ProcessClass, command, tunnelIdArg)
    .then(found => {
      let withId = [ ]
      found.forEach(proc => {
        if(proc.tunnelId) {
          withId.push(proc)
        }
      })
      return withId
    })
  }

  static withoutId(ProcessClass, command, tunnelIdArg) {
    return find(ProcessClass, command, tunnelIdArg)
    .then(found => {
      let withoutId = [ ]
      found.forEach(proc => {
        if(!proc.tunnelId) {
          withoutId.push(proc)
        }
      })
      return withoutId
    })
  }
}

function find(ProcessClass, command, tunnelIdArg) {
  return new Bluebird((resolve, reject) => {
    let found = [ ]
    ps.lookup({
      command: command
    },
    (err, list) => {
      if(err) {
        reject(err)
        return
      }
      list.forEach(proc => {
        let idx = proc.arguments.indexOf(tunnelIdArg)
        if(-1 === idx || !proc.arguments[idx+1].match(/fork/)) {
          found.push(new ProcessClass(
            parseInt(proc.pid, 10),
            (-1 !== idx ? proc.arguments[idx+1] : undefined)
          ))
        }
      })
      resolve(found)
    })
  })
}

exports.Manager = Manager
