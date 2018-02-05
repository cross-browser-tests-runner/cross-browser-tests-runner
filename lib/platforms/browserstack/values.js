'use strict';

let
  path = require('path'),
  fs = require('fs'),
  Config = require('./../../core/config').Config,
  ValuesCore = require('./../core/values').Values,
  configFile = path.resolve(process.cwd(), 'conf/browserstack-conf.json')

const VARS = {
  conversions: {
    browser: {
      browser: 'browser',
      browserVersion: 'browser_version',
      device: 'device',
      isPhysicalDevice: 'realMobile',
      orientation: 'deviceOrientation',
      os: 'os',
      osVersion: 'os_version',
      resolution: 'resolution'
    },
    capabilities: {
      appiumVersion: 'browserstack.appium_version',
      build: 'build',
      captureConsole: 'browserstack.console',
      captureNetwork: 'browserstack.networkLogs',
      edgePopups: 'browserstack.edge.enablePopups',
      geckoDriver: 'browserstack.geckodriver',
      ieCompat: 'browserstack.ie.compatibility',
      ieDriver: 'browserstack.ie.driver',
      ieNoFlash: 'browserstack.ie.noFlash',
      iePopups: 'browserstack.ie.enablePopups',
      local: 'browserstack.local',
      localIdentifier: 'browserstack.localIdentifier',
      project: 'project',
      safariAllCookies: 'browserstack.safari.allowAllCookies',
      safariDriver: 'browserstack.safari.driver',
      safariPopups: 'browserstack.safari.enablePopups',
      screenshots: 'browserstack.debug',
      seleniumVersion: 'browserstack.selenium_version',
      test: 'name',
      timeout: 'timeout',
      timezone: 'browserstack.timezone',
      video: 'browserstack.video'
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
        'isPhysicalDevice',
        'orientation',
        'resolution'
      ],
      capabilities: [
        'appiumVersion',
        'build',
        'captureConsole',
        'captureNetwork',
        'edgePopups',
        'geckoDriver',
        'ieCompat',
        'ieDriver',
        'ieNoFlash',
        'iePopups',
        'local',
        'localIdentifier',
        'project',
        'safariAllCookies',
        'safariDriver',
        'safariPopups',
        'screenshots',
        'seleniumVersion',
        'test',
        'timeout',
        'timezone',
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
    let ret = parseParams(browser, capabilities, 'Selenium')
    ret.browser.browserName = ret.browser.browser
    delete ret.browser.browser
    return ret
  }

  static parseCapabilities(capabilities) {
    parse(capabilities, 'capabilities')
  }

}

function parseParams(browser, capabilities, testType) {
  parseBoth(browser, capabilities)
  ValuesCore.validatePlatform(JSON.parse(fs.readFileSync(configFile, 'utf8')), browser, testType)
  let all = validateBoth(browser, capabilities, testType)
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

function validateBoth(browser, capabilities, testType) {
  let all = Object.assign({ }, browser, capabilities, { TestType: testType })
  ValuesCore.validate(config, browser, VARS.validate.parameters.browser, all)
  ValuesCore.validate(config, capabilities, VARS.validate.parameters.capabilities, all)
  return all
}

function convertBrowserValues(browser, all) {
  browser.browser = ValuesCore.convertValue(config, 'browser', browser, all)
  browser.os = ValuesCore.convertValue(config, 'os', browser, all)
}

function convertKeys(browser, capabilities) {
  browser = ValuesCore.convertKeys(browser, VARS.conversions.browser)
  capabilities = ValuesCore.convertKeys(capabilities, VARS.conversions.capabilities)
  return {browser: browser, capabilities: capabilities}
}

exports.Values = Values
