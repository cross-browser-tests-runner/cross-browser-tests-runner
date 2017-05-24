'use strict'

let
  InputError = require('./../core/errors').InputError

class Factory {

  static get(identifier) {
    let className
    switch(identifier) {
      case 'browserstack':
        /* eslint-disable global-require */
        className = require('./' + identifier + '/platform').Platform
        /* eslint-enable global-require */
        break
      default:
        throw new InputError('Platforms.Factory: unsupported platform ' + identifier)
    }
    return new className()
  }
}

exports.Factory = Factory
