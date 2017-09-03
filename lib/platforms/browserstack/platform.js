'use strict';

let
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
      os: 'os',
      osVersion: 'os_version',
      browser: 'browser',
      browserVersion: 'browser_version',
      device: 'device',
      orientation: 'deviceOrientation',
      size: 'resolution'
    },
    capabilities: {
      timeout: 'timeout',
      project: 'project',
      test: 'name',
      build: 'build',
      local: 'browserstack.local',
      localIdentifier: 'browserstack.localIdentifier',
      screenshots: 'browserstack.debug',
      video: 'browserstack.video',
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
  }
}

class Platform extends PlatformBase {

  constructor() {
    super(parse, Tunnel, Manager, 'localIdentifier', /BrowserStackLocal/, Job, ScriptJob)
  }

  static browserKeys(standard) {
    return converted('browser', standard)
  }

  static capabilitiesKeys(standard) {
    return converted('capabilities', standard)
  }

  static get required() {
    return VARS.required
  }
}

function parse(opts, which) {
  checkRequired(opts, VARS.required[which])
  checkUnallowed(opts, VARS.conversions[which])
  checkDefaults(opts, VARS.defaults[which])
  let out = { }
  Object.keys(opts).forEach(opt => {
    out[VARS.conversions[which][opt]] = opts[opt]
  })
  return out
}

function checkRequired(opts, required) {
  required.forEach(opt => {
    if (!(opt in opts)) {
      throw new InputError('Platforms.BrowserStack.Platform: required option ' + opt + ' missing')
    }
  })
}

function checkUnallowed(opts, conversions) {
  Object.keys(opts).forEach(opt => {
    if(!(opt in conversions)) {
      throw new InputError('Platforms.BrowserStack.Platform: option ' + opt + ' is not allowed')
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

function converted(which, standard) {
  let out = { }
  standard.forEach(key => {
    out[key] = VARS.conversions[which][key]
  })
  return out
}

exports.Platform = Platform
exports.PlatformVars = Object.assign(PlatformBaseVars, VARS)
