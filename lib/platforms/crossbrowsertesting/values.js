'use strict';

let
  path = require('path'),
  fs = require('fs'),
  Config = require('./../../core/config').Config,
  ValuesCore = require('./../core/values').Values,
  configFile = path.resolve(__dirname, './../../../conf/crossbrowsertesting-conf.json')

const VARS = {
  conversions: {
    browser: {
      browser: 'browser_api_name',
      browserVersion: undefined,
      orientation: 'deviceOrientation',
      os: 'os_api_name',
      osVersion: undefined,
      device: undefined,
      resolution: 'screen_resolution'
    },
    capabilities: {
      build: 'build',
      captureNetwork: 'record_network',
      local: 'local', // dummy - required in current flow
      project: 'project', // dummy - required to keep error handling simple
      screenshots: 'screenshots', // dummy - to keep a simple workflow
      test: 'name',
      timeout: 'max_duration',
      video: 'record_video'
    }
  },
  required: {
    browser: [
      'browser',
      'browserVersion',
      'os',
      'osVersion'
    ],
    capabilities: [ ]
  },
  defaults: {
    browser: {
    },
    capabilities: {
      timeout: 60
    }
  },
  validate: {
    parameters: {
      browser: [
        'resolution',
        'orientation'
      ],
      capabilities: [
        'build',
        'captureNetwork',
        'local',
        'test',
        'timeout',
        'video'
      ]
    }
  }
},
config = new Config(configFile)


class Values {

  static js(browser, capabilities) {
    return parseParams(browser, capabilities, 'JS')
  }

  static selenium(browser, capabilities) {
    let
      browserName = browser.browser,
      ret = parseParams(browser, capabilities, 'Selenium')
    ret.browser.browserName = browserName
    return ret
  }

  static parseCapabilities(capabilities) {
    parse(capabilities, 'capabilities')
  }

}

function parseParams(browser, capabilities, testType) {
  parseBoth(browser, capabilities)
  ValuesCore.validatePlatform(JSON.parse(fs.readFileSync(configFile, 'utf8')), browser, testType)
  let all = validateBoth(browser, capabilities)
  convertBrowserValues(browser, all)
  return convertKeys(browser, capabilities)
}

function parseBoth(browser, capabilities) {
  parse(browser, 'browser')
  parse(capabilities, 'capabilities')
}

function parse(params, which) {
  ValuesCore.checkRequired(params, VARS.required[which])
  ValuesCore.checkUnallowed(params, VARS.conversions[which])
  ValuesCore.checkDefaults(params, VARS.defaults[which])
}

function validateBoth(browser, capabilities) {
  let all = Object.assign({ }, browser, capabilities)
  ValuesCore.validate(config, browser, VARS.validate.parameters.browser, all)
  ValuesCore.validate(config, capabilities, VARS.validate.parameters.capabilities, all)
  return all
}

function convertBrowserValues(browser, all) {
  browser.browser = ValuesCore.convertValue(config, 'browser', browser, all)
  browser.os = ValuesCore.convertValue(config, 'os', browser, all)
}

function convertKeys(browser, capabilities) {
  browser = convertBrowserKeys(browser)
  capabilities = ValuesCore.convertKeys(capabilities, VARS.conversions.capabilities)
  return {browser: browser, capabilities: capabilities}
}

function convertBrowserKeys(browser) {
  delete browser.osVersion
  delete browser.browserVersion
  if('device' in browser) {
    delete browser.device
  }
  return ValuesCore.convertKeys(browser, VARS.conversions.browser)
}

exports.Values = Values
