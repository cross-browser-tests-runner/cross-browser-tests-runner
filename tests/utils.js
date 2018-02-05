'use strict';

var
  path = require('path'),
  Bluebird = require('bluebird'),
  fs = Bluebird.promisifyAll(require('fs')),
  retry = require('p-retry'),
  uuidv4 = require('uuid').v4,
  Env = require('./../lib/core/env').Env,
  CiFactory = require('./../lib/ci/factory').Factory

var build = 'local-' + require('child_process').execSync('git rev-parse HEAD').toString().trim()

var fileModes = {
  '0400': 33024,
  '0755': 33261
}

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
  if(!Env.isWindows) {
    let ret = [
      path.resolve(process.cwd(), 'node_modules/.bin/istanbul'),
      'cover',
      '--handle-sigint',
      '--include-pid',
      executable
    ]
    if(args && args.length) {
      ret.push('--')
      ret = ret.concat(args)
    }
    return ret
  }
  else {
    let ret = [ executable ]
    if(args && args.length) {
      ret = ret.concat(args)
    }
    return ret
  }
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

function safeChmod(file, mode) {
  const check = () => {
    return fs.statAsync(file)
    .then(stat => {
      if(fileModes[mode] === stat.mode) {
        return stat
      }
      throw new Error('Mode not changed yet')
    })
  }
  return fs.chmodAsync(file, mode)
  .then(() => {
    return retry(check, {retries: 5, minInterval: 100, factor: 2})
  })
}

exports.buildDetails = buildDetails
exports.nodeProcCoverageArgs = nodeProcCoverageArgs
exports.errorWithoutCovLines = errorWithoutCovLines
exports.safeChmod = safeChmod
