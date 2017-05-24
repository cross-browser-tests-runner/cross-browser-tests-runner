'use strict'

const
  defaults = require('./defaults'),
  settings = require('./../../lib/core/settings')

function get(configFile) {
  return Object.assign(defaults, (settings(configFile)).server || { })
}

module.exports = get
