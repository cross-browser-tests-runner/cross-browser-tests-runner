'use strict'

let
  /* eslint-disable global-require */
  log = new (require('./../../lib/core/log').Log)(process.env.LOG_LEVEL || 'ERROR', 'Server.utils')
  /* eslint-enable global-require */

function error(err, res) {
  log.error('error processing request', err)
  if('InputError' === err.name) {
    res.status(400).json({ error : err.message })
  }
  else {
    res.status(500).json({ error : err.message })
  }
}

exports.error = error
