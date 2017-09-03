#!/usr/bin/env node

'use strict'

const
  jsBrowsersApi = 'https://saucelabs.com/rest/v1/info/platforms/webdriver',
  appiumBrowsersApi = 'https://saucelabs.com/rest/v1/info/platforms/appium'

let
  common = require('./common')

const
  OsMap = {
    'Mac 10.12': ['OS X', '10.12'],
    'Mac 10.11': ['OS X', '10.11'],
    'Mac 10.10': ['OS X', '10.10'],
    'Mac 10.9': ['OS X', '10.9'],
    'Mac 10.8': ['OS X', '10.8'],
    'Windows 10': ['Windows', '10'],
    'Windows 2012 R2': ['Windows', '8.1'],
    'Windows 2012': ['Windows', '8'],
    'Windows 2008': ['Windows', '7'],
    'Windows 2003': ['Windows', 'XP']
  },
  AppiumOsMap = {
    'Mac 10.12': 'iOS',
    'Mac 10.11': 'iOS',
    'Mac 10.10': 'iOS',
    'Linux': 'Android'
  },
  AppiumBrowserMap = {
    iOS: 'Safari',
    Android: 'Android Browser'
  }

common.run('SauceLabs', [{
  url: jsBrowsersApi,
  process: (browser, config) => {
    let
      convertedOs = OsMap[browser.os] || [ browser.os, 'None' ],
      osAlias = convertedOs[0],
      osVersion = convertedOs[1],
      os = config.Aliases['Operating Systems'][osAlias] || osAlias,
      browserAlias = browser.api_name,
      browserName = config.Aliases.Browsers[browserAlias]
    handleJSBrowser(config.JS, os, osVersion, browser, browserName)
    if(!browser.device) {
      handleJSBrowser(config.Selenium, os, osVersion, browser, browserName)
    }
    return {os: os, osVersion: osVersion}
  }
}, {
  url: appiumBrowsersApi,
  process: (browser, config) => {
    let
      osAlias = AppiumOsMap[browser.os],
      os = config.Aliases['Operating Systems'][osAlias] || osAlias,
      osVersion = browser.short_version,
      browserAlias = AppiumBrowserMap[os],
      browserName = config.Aliases.Browsers[browserAlias] || browserAlias,
      osConfig = config.Selenium[os] = config.Selenium[os] || { },
      osVersionConfig = osConfig[osVersion] = osConfig[osVersion] || { }
    handleAppiumBrowser(browser, browserName, osVersionConfig)
    return {os: os, osVersion: osVersion}
  }
}], {
  user: process.env.SAUCE_USERNAME,
  pass: process.env.SAUCE_ACCESS_KEY
})

function handleJSBrowser(config, os, osVersion, browser, browserName) {
  let
    osConfig = config[os] = config[os] || { },
    osVersionConfig = osConfig[osVersion] = osConfig[osVersion] || { },
    array = osVersionConfig[browserName] || [ ]
  if(!browser.short_version.match(/\./)) {
    browser.short_version += '.0'
  }
  if(-1 === array.indexOf(browser.short_version)) {
    array.push(browser.short_version)
    osVersionConfig[browserName] = array.sort()
  }
}

function handleAppiumBrowser(browser, browserName, osVersionConfig) {
  let array = osVersionConfig[browserName] || [ ]
  //if(-1 === osVersionConfig[browserName].indexOf(browser.long_name)) {
  array.push(browser.long_name)
  osVersionConfig[browserName] = array.sort()
  //}
}
