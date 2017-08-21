'use strict'

let
  Bluebird = require('bluebird'),
  path = require('path'),
  fs = Bluebird.promisifyAll(require('fs')),
  router = require('express').Router(),
  useragent = require('useragent'),
  Log = require('./../../../../lib/core/log').Log,
  log = new Log(process.env.LOG_LEVEL || 'ERROR', 'Server.Runners.Native.Cbtr'),
  srvUtils = require('./../../utils'),
  args = require('minimist')(process.argv.slice(2), {
    string: ['config'],
    boolean: ['errors-only', 'native-runner', 'omit-traces'],
    alias: {config: 'c', 'errors-only': 'e', 'native-runner': 'n', 'omit-traces': 'o'}
  })

const COLORS = {
  FAIL: "\x1b[31m",
  OK: "\x1b[32m",
  WARN: "\x1b[33m",
  DESC: "\x1b[90m",
  RESET: "\x1b[0m"
}

router.route('/run')
.post(function(req, res) {
  log.debug('serving %s method %s', req.url, req.method)
  log.debug('results: %s', JSON.stringify(req.body, null, 2))
  if(!req.body.suites) {
    res.json()
    return
  }
  let agent = useragent.parse(req.headers['user-agent'])
  console.log(
    req.body.passed === req.body.total ? COLORS.OK + '✓' + COLORS.RESET + COLORS.DESC : COLORS.FAIL + '×',
    agentStr(agent),
    COLORS.RESET)
  let indent = '  '
  req.body.suites.forEach(suite => {
    logSuite(suite, indent)
  })
  console.log('')
  res.json()
})

router.route('/coverage')
.post(function(req, res) {
  log.debug('serving %s method %s', req.url, req.method)
  log.debug('coverage data: %s', JSON.stringify(req.body, null, 2))
  const coverageDir = path.resolve(process.cwd(), 'coverage')
  log.debug('checking existence of %s', coverageDir)
  fs.statAsync(coverageDir)
  .then(stats => {
    if(!stats.isDirectory()) {
      log.error('cannot store coverage data as %s is not a directory', coverageDir)
      throw new Error('not a directory')
    }
    log.debug('coverage dir %s exists', coverageDir)
    return true
  })
  .catch(err => {
    if(err.message.match(/not a directory/)) {
      throw err
    }
    log.debug('coverage dir %s does not exist, creating...', coverageDir)
    return fs.mkdirAsync(coverageDir)
  })
  .then(() => {
    const covFile = path.resolve(coverageDir, 'coverage-' + Math.random() + '.json')
    log.debug('writing coverage data into %s', covFile)
    return fs.writeFileAsync(covFile, JSON.stringify(req.body))
  })
  .then(() => {
    log.debug('coverage data stored')
    res.json()
  })
})

srvUtils.defaults(router)

function logSuite(suite, indent) {
  if(!toLog(suite)) {
    return
  }
  console.log(indent, suite.description)
  suite.suites.forEach(child => {
    logSuite(child, indent + '  ')
  })
  suite.specs.forEach(spec => {
    logSpec(spec, indent + '  ')
  })
}

function toLog(suite) {
  var res = !args['errors-only']
  if(args['errors-only']) {
    suite.suites.forEach(child => {
      if(toLog(child)) {
        res = true
      }
    })
    if(res) {
      return res
    }
    suite.specs.forEach(spec => {
      if(!spec.passed && !spec.skipped) {
        res = true
      }
    })
  }
  return res
}

function logSpec(spec, indent) {
  if(args['errors-only'] && (spec.passed || spec.skipped)) {
    return
  }
  console.log(
    indent,
    specStatus(spec),
    spec.description,
    '(' + spec.duration + 'ms)',
    COLORS.RESET)
  if(!spec.passed && !spec.skipped) {
    logFailures(spec, indent + '  ')
  }
}

function specStatus(spec) {
  return spec.passed
    ? COLORS.OK + '✓' + COLORS.RESET + COLORS.DESC
    : !spec.skipped
      ? COLORS.FAIL + '×'
      : '-' + COLORS.DESC
}

function logFailures(spec, indent) {
  spec.failures.forEach(failure => {
    console.log(indent, COLORS.FAIL, failure.message, COLORS.RESET)
    if(!args['omit-traces']) {
      if(failure.trace && failure.trace.stack) {
        failure.trace.stack.trim().split('\n').forEach(traceLine => {
          console.log(indent, COLORS.FAIL, traceLine, COLORS.RESET)
        })
      } else {
        console.log(indent, COLORS.WARN, 'no trace available', COLORS.RESET)
      }
    }
  })
}

function agentStr(agent) {
  let str =
    agent.family + ' ' + agent.major + '.' + agent.minor + ' - '
    + agent.os.family
  if('0' !== agent.os.major) {
    str += ' ' + agent.os.major + '.' + agent.os.minor
  }
  if(agent.device && 'Other' !== agent.device.family) {
    str += ' - ' + agent.device.family
    if('0' !== agent.device.major) {
      str += ' ' + agent.device.major + '.' + agent.device.minor
    }
  }
  return str
}

module.exports = router
