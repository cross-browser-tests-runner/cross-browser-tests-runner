'use strict';

var
  ps = require('ps-node'),
  uuidv4 = require('uuid').v4,
  CiFactory = require('./../../../../lib/ci/factory').Factory,
  Log = require('./../../../../lib/core/log').Log

let log = new Log('UnitTests')

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

var build = 'local-' + require('child_process').execSync('git rev-parse HEAD').toString().trim()

function buildDetails() {
  try {
    let Ci = CiFactory.get()
    return {
      project: Ci.project,
      name: Ci.session,
      build: Ci.commit
    }
  }
  catch(err) {
    return {
      project: 'cross-browser-tests-runner/cross-browser-tests-runner',
      name: 'local-' + uuidv4(),
      build: build
    }
  }
}

exports.procsByCmd = procsByCmd
exports.buildDetails = buildDetails
exports.log = log
