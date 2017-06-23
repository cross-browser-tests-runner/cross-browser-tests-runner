'use strict'

const
  defaults = require('./defaults'),
  settings = require('./../../lib/core/settings')

function get(configFile) {
  let
    ret = settings(configFile),
    keys = Object.keys(defaults)
  Array.prototype.push.apply(keys, Object.keys(ret))
  keys.forEach(key => {
    if('object' !== typeof(defaults[key])) {
      ret[key] = !(key in ret) ? defaults[key] : ret[key]
    }
    else {
      ret[key] = Object.assign(defaults[key], ret[key] || { })
    }
  })
  return ret
}

module.exports = get
