'use strict';

var
  uuidv4 = require('uuid').v4,
  Log = require('./../../../lib/core/log').Log,
  CiFactory = require('./../../../lib/ci/factory').Factory

let log = new Log('IntegrationTests')

var build = 'local-' + require('child_process').execSync('git rev-parse HEAD').toString().trim()

function buildDetails(){
  try {
    let Ci = CiFactory.get()
    return {
      project: Ci.project,
      test: Ci.session,
      build: Ci.commit
    }
  }
  catch(err) {
    return {
      project: 'cross-browser-tests-runner/cross-browser-tests-runner',
      test: 'local-' + uuidv4(),
      build: build
    }
  }
}

exports.log = log
exports.buildDetails = buildDetails
