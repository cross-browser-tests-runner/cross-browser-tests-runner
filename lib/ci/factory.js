'use strict'

let
  Travis = require('./environments/travis').Travis,
  Circle = require('./environments/circle').Circle,
  Appveyor = require('./environments/appveyor').Appveyor,
  envs = [ Travis, Circle, Appveyor ]

class Factory {

  static get() {
    for(let i = 0; i < envs.length; ++i) {
      if(envs[i].in) {
        return envs[i]
      }
    }
    throw new Error('CI.Factory: unknown continuous integration environment')
  }

}

exports.Factory = Factory
