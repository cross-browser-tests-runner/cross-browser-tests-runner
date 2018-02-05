'use strict';

let
  InputError = require('./../../core/errors').InputError


class Values {

  static checkRequired(params, required) {
    required.forEach(param => {
      if (!(param in params)) {
        throw new InputError('Platforms.Core.Values: required option ' + param + ' missing')
      }
    })
  }

  static checkUnallowed(params, conversions) {
    Object.keys(params).forEach(param => {
      if(!(param in conversions)) {
        throw new InputError('Platforms.Core.Values: option ' + param + ' is not allowed')
      }
    })
  }

  static checkDefaults(params, defaults) {
    Object.keys(defaults).forEach(def => {
      if(!(def in params)) {
        params[def] = defaults[def]
      }
    })
  }

  static validate(config, params, keys, all) {
    keys.forEach(key => {
      if(key in params) {
        if(!config.validate('parameters', key, all)) {
          delete params[key]
        }
      }
    })
  }

  static validatePlatform(config, browser, testType) {
    validateOs(config[''+testType], browser)
    validateOsVersion(config[''+testType][''+browser.os], browser)
    let osVersion = browser.osVersion ? ''+browser.osVersion : 'None'
    validateBrowser(config[''+testType][''+browser.os][osVersion], browser)
    validateBrowserVersion(config[''+testType][''+browser.os][osVersion][''+browser.browser], browser)
    let browserVersion = browser.browserVersion ? ''+browser.browserVersion : 'None'
    validateDevice(config[''+testType][''+browser.os][osVersion][''+browser.browser][browserVersion], browser)
  }

  static convertValue(config, key, input, all) {
    try {
      return config.get('conversions.' + key, input[key], all) || input[key]
    }
    catch(e) {
      return input[key]
    }
  }

  static convertKeys(params, conversions) {
    let out = { }
    Object.keys(params).forEach(param => {
      out[conversions[param]] = params[param]
    })
    return out
  }

}

function validateOs(config, browser) {
  if(!(''+browser.os in config)) {
    throw new InputError('Platforms.Core.Values: invalid os "' + browser.os + '"')
  }
}

function validateOsVersion(config, browser) {
  if(null !== browser.osVersion && !(''+browser.osVersion in config)) {
    throw new InputError('Platforms.Core.Values: invalid osVersion "' + browser.osVersion + '" for os "' + browser.os + '"')
  }
}

function validateBrowser(config, browser) {
  if(!(''+browser.browser in config)) {
    throw new InputError('Platforms.Core.Values: invalid browser "' + browser.browser + '" for osVersion "' + browser.osVersion + '" for os "' + browser.os + '"')
  }
}

function validateBrowserVersion(config, browser) {
  if(null !== browser.browserVersion && !(''+browser.browserVersion in config)) {
    throw new InputError('Platforms.Core.Values: invalid version "' + browser.browserVersion + '" for browser "' + browser.browser + '" for osVersion "' + browser.osVersion + '" for os "' + browser.os + '"')
  }
}

function validateDevice(config, browser) {
  if(browser.device && -1 === config.indexOf(''+browser.device)) {
    throw new InputError('Platforms.Core.Values: invalid device "' + browser.device + '" for version "' + browser.browserVersion + '" for browser "' + browser.browser + '" for osVersion "' + browser.osVersion + '" for os "' + browser.os + '"')
  }
}

exports.Values = Values
