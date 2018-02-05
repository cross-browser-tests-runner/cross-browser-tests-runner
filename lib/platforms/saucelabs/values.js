'use strict';

let
  path = require('path'),
  fs = require('fs'),
  Config = require('./../../core/config').Config,
  ValuesCore = require('./../core/values').Values,
  configFile = path.resolve(__dirname, './../../../conf/saucelabs-conf.json')

const VARS = {
  conversions: {
    browser: {
      webdriver: {
        browser: 'browserName',
        browserVersion: 'version',
        os: 'platform',
        osVersion: undefined,
        resolution: 'screenResolution'
      },
      appium: {
        browser: 'browserName',
        browserVersion: undefined,
        device: 'deviceName',
        deviceType: 'deviceType',
        orientation: 'deviceOrientation',
        os: 'platformName',
        osVersion: 'platformVersion',
        resolution: 'screenResolution'
      }
    },
    capabilities: {
      appiumVersion: 'appiumVersion',
      autoAcceptAlerts: 'autoAcceptAlerts',
      automationEngine: 'automationName',
      build: 'build',
      captureHtml: 'captureHtml',
      captureLogs: 'recordLogs',
      chromeDriver: 'chromedriverVersion',
      customData: 'customData',
      ieDriver: 'iedriverVersion',
      local: 'local', // dummy - required in current flow
      localIdentifier: 'tunnelIdentifier',
      noServerFailureScreenshots: 'webdriverRemoteQuietExceptions',
      parentTunnel: 'parentTunnel',
      prerun: 'prerun',
      priority: 'priority',
      project: 'project', // dummy - required to keep error handling simple
      screenshots: 'recordScreenshots',
      seleniumVersion: 'seleniumVersion',
      tags: 'tags',
      test: 'name',
      timeout: 'maxDuration',
      timezone: 'timeZone',
      video: 'recordVideo',
      videoUploadOnPass: 'videoUploadOnPass'
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
        'deviceType',
        'orientation'
      ],
      capabilities: [
        'appiumVersion',
        'autoAcceptAlerts',
        'automationEngine',
        'build',
        'captureHtml',
        'captureLogs',
        'chromeDriver',
        'customData',
        'ieDriver',
        'local',
        'localIdentifier',
        'noServerFailureScreenshots',
        'parentTunnel',
        'prerun',
        'priority',
        'screenshots',
        'seleniumVersion',
        'tags',
        'test',
        'timeout',
        'timezone',
        'video',
        'videoUploadOnPass'
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
    return parseParams(browser, capabilities, 'Selenium')
  }

  static parseCapabilities(capabilities) {
    parseCapabilities(capabilities)
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
  parseBrowser(browser)
  parseCapabilities(capabilities)
}

function parseBrowser(browser) {
  ValuesCore.checkRequired(browser, VARS.required.browser)
  if(browser.device) { // appium
    ValuesCore.checkUnallowed(browser, VARS.conversions.browser.appium)
  }
  else { // webdriver
    ValuesCore.checkUnallowed(browser, VARS.conversions.browser.webdriver)
  }
  ValuesCore.checkDefaults(browser, VARS.defaults.browser)
}

function parseCapabilities(capabilities) {
  ValuesCore.checkRequired(capabilities, VARS.required.capabilities)
  ValuesCore.checkUnallowed(capabilities, VARS.conversions.capabilities)
  ValuesCore.checkDefaults(capabilities, VARS.defaults.capabilities)
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
  browser.osVersion = ValuesCore.convertValue(config, 'osVersion', browser, all)
}

function convertKeys(browser, capabilities) {
  browser = convertBrowserKeys(browser)
  capabilities = ValuesCore.convertKeys(capabilities, VARS.conversions.capabilities)
  return {browser: browser, capabilities: capabilities}
}

function convertBrowserKeys(browser) {
  if(!browser.device) { // webdriver
    browser.os = browser.os + (browser.osVersion ? ' ' + browser.osVersion : '')
    delete browser.osVersion
    browser = ValuesCore.convertKeys(browser, VARS.conversions.browser.webdriver)
  } else { // appium
    delete browser.browserVersion
    browser = ValuesCore.convertKeys(browser, VARS.conversions.browser.appium)
  }
  return browser
}

exports.Values = Values
