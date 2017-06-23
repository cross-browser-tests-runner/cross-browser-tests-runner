'use strict'

let
  Manager = require('./tests/manager').Manager,
  coreUtils = require('./../../../../lib/core/utils'),
  manager

exports.start = settings => {
  manager = new Manager(settings)
  manager.start()
  .catch(err => {
    console.error('error while running tests %s', err.stack)
    console.error(coreUtils.COLORS.FAIL, 'could not start tests cleanly, exiting...', coreUtils.COLORS.RESET)
    /* eslint-disable no-process-exit */
    process.exit(1)
    /* eslint-enable no-process-exit */
  })
}

exports.endOne = (req, res, next, settings) => {
  if(!manager.end(req, res, settings)) {
    next()
  }
}
