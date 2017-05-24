'use strict';

var
  ps = require('ps-node')

function procsByCmd(cmd) {
  return new Promise(resolve => {
    ps.lookup({
      command: cmd
    },
    (err, list) => {
      if(err) throw new Error(err)
      resolve(list)
    })
  })
}

exports.procsByCmd = procsByCmd
