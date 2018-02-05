'use strict'

let
  Manager = require('./run/manager').Manager,
  coreUtils = require('./../../../../lib/core/utils'),
  manager

exports.start = settings => {
  manager = new Manager(settings)
  manager.start()
  .catch(err => {
    console.error('%s error while running tests %s', (new Date()).toISOString(), err.stack)
    console.error(coreUtils.COLORS.FAIL + (new Date()).toISOString(), 'could not start tests cleanly, exiting...', coreUtils.COLORS.RESET)
    /* eslint-disable no-process-exit */
    process.exit(1)
    /* eslint-enable no-process-exit */
  })
}

exports.status = (req, res) => {
  res.json(manager.status())
}

exports.endOne = (req, res, passed) => {
  manager.end(req, res, passed)
}
