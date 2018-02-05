#!/usr/bin/env node

'use strict'

const
  webdriverBrowsersApi = 'https://saucelabs.com/rest/v1/info/platforms/webdriver',
  appiumBrowsersApi = 'https://saucelabs.com/rest/v1/info/platforms/appium',
  aliases = {
    webdriver: {
      os: {
        Mac: 'OS X'
      },
      osVersion: {
        'OS X': {
          '10.13': 'High Sierra',
          '10.12': 'Sierra',
          '10.11': 'El Capitan',
          '10.10': 'Yosemite',
          '10.9': 'Mavericks'
        },
        Windows: {
          '2012 R2': '8.1',
          '2012': '8',
          '2008': '7',
          '10': '10'
        }
      },
      browser: {
        chrome: 'Chrome',
        firefox: 'Firefox',
        'internet explorer': 'Internet Explorer',
        microsoftedge: 'Edge',
        safari: 'Safari'
      }
    },
    appium: {
      os: {
        Mac: 'iOS',
        Linux: 'Android'
      },
      browser: {
        android: 'Android Browser',
        ipad: 'Mobile Safari',
        iphone: 'Mobile Safari'
      }
    }
  }

let
  common = require('./common')

common.run('SauceLabs', [{
  url: webdriverBrowsersApi,
  process: (browser, config) => {
    if(browser.device) {
      return
    }
    let
      osParts = getOsParts(browser),
      os = getOs(osParts, 'webdriver'),
      osConfig = getOsConfig(config, os),
      osVersion = getWebdriverOsVersion(config, os, osParts),
      osVersionConfig = getOsVersionConfig(osConfig, osVersion),
      browserName = aliases.webdriver.browser[browser.api_name],
      browserConfig = getBrowserConfig(osVersionConfig, browserName),
      browserVersion = getWebdriverBrowserVersion(browser)
    getBrowserVersionConfig(browserConfig, browserVersion)
    config.Selenium[os] = config.JS[os]
  }
}, {
  url: appiumBrowsersApi,
  process: (browser, config) => {
    let
      osParts = getOsParts(browser),
      os = getOs(osParts, 'appium'),
      osConfig = getOsConfig(config, os),
      osVersion = browser.short_version,
      osVersionConfig = getOsVersionConfig(osConfig, osVersion),
      browserName = aliases.appium.browser[browser.api_name],
      browserConfig = getBrowserConfig(osVersionConfig, browserName),
      browserVersion = "None",
      browserVersionConfig = getBrowserVersionConfig(browserConfig, browserVersion)
    browserVersionConfig.push(browser.long_name)
    browserConfig[browserVersion] = browserVersionConfig.sort()
    config.parameters.appiumVersion["@key"] = 'device'
    config.parameters.appiumVersion[browser.long_name] = browser.supported_backend_versions
    config.Selenium[os] = config.JS[os]
  }
}], {
  user: process.env.SAUCE_USERNAME,
  pass: process.env.SAUCE_ACCESS_KEY
})

function getOsParts(browser) {
  return browser.os.split(' ')
}

function getOs(osParts, type) {
  return aliases[type].os[osParts[0]] || osParts[0]
}

function getOsConfig(config, os) {
  config.JS[os] = config.JS[os] || { }
  return config.JS[os]
}

function getWebdriverOsVersion(config, os, osParts) {
  osParts.shift()
  let osVersion = osParts.length ? osParts.join(' ') : 'None'
  return aliases.webdriver.osVersion[os]
    ? aliases.webdriver.osVersion[os][osVersion] || 'None'
    : osVersion
}

function getOsVersionConfig(osConfig, osVersion) {
  osConfig[osVersion] = osConfig[osVersion] || { }
  return osConfig[osVersion]
}

function getBrowserConfig(osVersionConfig, browserName) {
  osVersionConfig[browserName] = osVersionConfig[browserName] || { }
  return osVersionConfig[browserName]
}

function getWebdriverBrowserVersion(browser) {
  return browser.long_version.match(/^[0-9]/)
    ? browser.long_version.replace(/^([0-9]+\.[0-9]+).*$/, "$1")
    : browser.short_version
}

function getBrowserVersionConfig(browserConfig, browserVersion) {
  browserConfig[browserVersion] = browserConfig[browserVersion] || [ ]
  return browserConfig[browserVersion]
}
