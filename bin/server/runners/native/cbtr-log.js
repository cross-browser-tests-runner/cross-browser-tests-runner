'use strict'

const COLORS = {
  FAIL: "\x1b[31m",
  OK: "\x1b[32m",
  WARN: "\x1b[33m",
  DESC: "\x1b[90m",
  SUITENAME: "\x1b[37m",
  RESET: "\x1b[0m"
}

exports.header = function(agent, results) {
  console.log(
    results.passed === results.total
      ? COLORS.OK + '✓' + COLORS.RESET + COLORS.DESC
      : COLORS.FAIL + '×',
    agent,
    '(', results.passed, 'passed,', results.failed, 'failed,', results.skipped, 'skipped )',
    COLORS.RESET)
}

exports.suite = logSuite

function logSuite(suite, indent, args) {
  if(!toLog(suite, args)) {
    return
  }
  console.log(indent, COLORS.SUITENAME, suite.description, COLORS.RESET)
  suite.suites.forEach(child => {
    logSuite(child, indent + '  ', args)
  })
  suite.specs.forEach(spec => {
    logSpec(spec, indent + '  ', args)
  })
}

function toLog(suite, args) {
  var res = !args['errors-only']
  if(args['errors-only']) {
    suite.suites.forEach(child => {
      if(toLog(child, args)) {
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

function logSpec(spec, indent, args) {
  var notFailed = spec.passed || spec.skipped
  if(args['errors-only'] && notFailed) {
    return
  }
  console.log(
    indent,
    specStatus(spec),
    spec.description,
    '(' + spec.duration + 'ms)',
    COLORS.RESET)
  if(!notFailed) {
    logFailures(spec, indent + '  ', args)
  }
}

function specStatus(spec) {
  return spec.passed
    ? COLORS.OK + '✓' + COLORS.RESET + COLORS.DESC
    : !spec.skipped
      ? COLORS.FAIL + '×'
      : '-' + COLORS.DESC
}

function logFailures(spec, indent, args) {
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
