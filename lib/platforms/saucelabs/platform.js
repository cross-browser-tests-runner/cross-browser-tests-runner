'use strict';

let
  Env = require('./../../core/env').Env,
  InputError = require('./../../core/errors').InputError,
  platform = require('./../core/platform'),
  PlatformBase = platform.Platform,
  PlatformBaseVars = platform.PlatformVars,
  Job = require('./job').Job,
  ScriptJob = require('./scriptjob').ScriptJob,
  Tunnel = require('./tunnel').Tunnel,
  Manager = require('./manager').Manager

const VARS = {
  conversions: {
    browser: {
      selenium: {
        os: 'platform',
        osVersion: undefined,
        browser: 'browserName',
        browserVersion: 'version',
        device: undefined,
        orientation: undefined,
        size: 'screenResolution'
      },
      appium: {
        os: 'platformName',
        osVersion: 'platformVersion',
        browser: 'browserName',
        browserVersion: undefined,
        device: 'deviceName',
        orientation: 'deviceOrientation',
        size: 'screenResolution'
      }
    },
    capabilities: {
      timeout: 'maxDuration',
      project: undefined,
      test: 'name',
      build: 'build',
      localIdentifier: 'tunnelIdentifier',
      local: 'local', // dummy - required in current flow
      screenshots: 'recordScreenshots',
      video: 'recordVideo',
      framework: 'framework'
    }
  },
  required: {
    browser: [ 'os', 'osVersion', 'browser', 'browserVersion' ],
    capabilities: [ ]
  },
  defaults: {
    browser: {
    },
    capabilities: {
      timeout: 60
    }
  },
  appiumBrowserMap: {
    android: 'Browser',
    safari: 'Safari'
  }
}

class Platform extends PlatformBase {

  constructor() {
    super(parse, Tunnel, Manager, 'tunnelIdentifier', Env.isWindows ? /bin\\sc.exe/ : /bin\/sc/, Job, ScriptJob)
  }

  static browserKeys(standard, which) {
    return convertedBrowser(standard, which)
  }

  static capabilitiesKeys(standard) {
    return convertedCapabilities(standard)
  }

  static get required() {
    return VARS.required
  }
}

function parse(opts, which) {
  checkRequired(opts, VARS.required[which])
  if('browser' === which) {
    checkUnallowed(opts, VARS.conversions.browser.appium)
  }
  else {
    checkUnallowed(opts, VARS.conversions[which])
  }
  checkDefaults(opts, VARS.defaults[which])
  if('browser' === which) {
    if(opts.device) {
      return parseAppiumBrowser(opts)
    } else {
      return parseSeleniumBrowser(opts)
    }
  } else {
    let out = { }, from = VARS.conversions.capabilities
    Object.keys(opts).forEach(opt => {
      out[from[opt]] = opts[opt]
    })
    return out
  }
}

function parseAppiumBrowser(opts) {
  let out = { }, from = VARS.conversions.browser.appium
  Object.keys(opts).forEach(opt => {
    if(from[opt]) {
      out[from[opt]] = opts[opt]
    }
  })
  out.browserName = VARS.appiumBrowserMap[out.browserName]
  return out
}

function parseSeleniumBrowser(opts) {
  let out = { }, from = VARS.conversions.browser.selenium
  Object.keys(opts).forEach(opt => {
    if(from[opt]) {
      if('os' !== opt) {
        out[from[opt]] = opts[opt]
      } else {
        out[from[opt]] = opts[opt] + ' ' + opts['osVersion']
      }
    }
  })
  return out
}

function checkRequired(opts, required) {
  required.forEach(opt => {
    if (!(opt in opts)) {
      throw new InputError('Platforms.SauceLabs.Platform: required option ' + opt + ' missing')
    }
  })
}

function checkUnallowed(opts, conversions) {
  Object.keys(opts).forEach(opt => {
    if(!(opt in conversions)) {
      throw new InputError('Platforms.SauceLabs.Platform: option ' + opt + ' is not allowed')
    }
  })
}

function checkDefaults(opts, defaults) {
  Object.keys(defaults).forEach(def => {
    if(!(def in opts)) {
      opts[def] = defaults[def]
    }
  })
}

function convertedBrowser(standard, which) {
  let out = { }
  standard.forEach(key => {
    out[key] = VARS.conversions.browser[which][key]
  })
  return out
}

function convertedCapabilities(standard) {
  let out = { }
  standard.forEach(key => {
    out[key] = VARS.conversions.capabilities[key]
  })
  return out
}

exports.Platform = Platform
exports.PlatformVars = Object.assign(PlatformBaseVars, VARS)
