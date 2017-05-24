'use strict'

let
  fs = require('fs'),
  path = require('path')

function get(configFile) {
  let settingsFile = process.env.CBTR_SETTINGS || path.resolve(process.cwd(), configFile || 'cbtr.json')

  if(fs.existsSync(settingsFile)) {
    try {
      /* eslint-disable global-require */
      return require(settingsFile)
      /* eslint-enable global-require */
    }
    catch(err) {
      return { }
    }
  }
  return { }
}

module.exports = get
