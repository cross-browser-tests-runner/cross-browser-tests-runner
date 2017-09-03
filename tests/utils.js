'use strict';

var
  path = require('path'),
  uuidv4 = require('uuid').v4,
  CiFactory = require('./../lib/ci/factory').Factory

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

function nodeProcCoverageArgs(executable, args) {
  let ret = [
    path.resolve(process.cwd(), 'node_modules/.bin/istanbul'),
    'cover',
    '--handle-sigint',
    '--include-pid',
    executable
  ]
  args = args || [ ]
  if(args.length) {
    ret.push('--')
    ret = ret.concat(args)
  }
  return ret
}

function errorWithoutCovLines(log, out) {
  if(!out.match(/=======================================/) &&
    !out.match(/Writing coverage object.*json/) &&
    !out.match(/Writing coverage reports at/) &&
    !out.match(/=============== Coverage summary ==========/))
  {
    log.error(out)
  }
}

exports.buildDetails = buildDetails
exports.nodeProcCoverageArgs = nodeProcCoverageArgs
exports.errorWithoutCovLines = errorWithoutCovLines
