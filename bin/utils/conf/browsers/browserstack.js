#!/usr/bin/env node

'use strict'

const
  jsBrowsersApi = 'https://api.browserstack.com/4/browsers?flat=true',
  seleniumBrowsersApi = 'https://www.browserstack.com/automate/browsers.json',
  aliases = {
    os: {
      android: "Android",
      ios: "iOS",
      winphone: "Windows Phone"
    },
    browser: {
      android: "Android Browser",
      chrome: "Chrome",
      edge: "Edge",
      firefox: "Firefox",
      ie: "Internet Explorer",
      ipad: "Mobile Safari",
      iphone: "Mobile Safari",
      opera: "Opera",
      safari: "Safari",
      yandex: "Yandex"
    }
  },
  mobileSafariBrowsers = ['ipad', 'iphone']

let
  common = require('./common')

common.run('BrowserStack', [{
  url: jsBrowsersApi,
  process: (browser, config) => {
    processBrowser(browser, config, 'JS')
  }
}, {
  url: seleniumBrowsersApi,
  process: (browser, config) => {
    processBrowser(browser, config, 'Selenium')
  }
}], {
  user: process.env.BROWSERSTACK_USERNAME,
  pass: process.env.BROWSERSTACK_ACCESS_KEY
})

function processBrowser(browser, config, type) {
  let
    os = getOs(browser),
    osConfig = getOsConfig(config, type, os),
    osVersion = browser.os_version,
    osVersionConfig = getOsVersionConfig(osConfig, osVersion),
    browserName = getBrowserName(browser),
    browserConfig = getBrowserConfig(osVersionConfig, browserName),
    browserVersion = browser.browser_version || 'None',
    browserVersionConfig = getBrowserVersionConfig(browserConfig, browserVersion)
  if(browser.device) {
    browserVersionConfig.push(browser.device)
    browserConfig[browserVersion] = browserVersionConfig.sort()
    if(browser.real_mobile) {
      config.parameters.isPhysicalDevice[browser.device] = '<boolean>'
    }
  }
  if(-1 !== mobileSafariBrowsers.indexOf(browser.browser) && 'Selenium' === type) {
    config.conversions.browser['Mobile Safari'].Selenium[browser.device] = browser.browser
  }
}

function getOs(browser) {
  return aliases.os[browser.os] || browser.os
}

function getOsConfig(config, type, os) {
  config[type][os] = config[type][os] || { }
  return config[type][os]
}

function getOsVersionConfig(osConfig, osVersion) {
  osConfig[osVersion] = osConfig[osVersion] || { }
  return osConfig[osVersion]
}

function getBrowserName(browser) {
  return aliases.browser[browser.browser] || browser.browser
}

function getBrowserConfig(osVersionConfig, browserName) {
  osVersionConfig[browserName] = osVersionConfig[browserName] || { }
  return osVersionConfig[browserName]
}

function getBrowserVersionConfig(browserConfig, browserVersion) {
  browserConfig[browserVersion] = browserConfig[browserVersion] || [ ]
  return browserConfig[browserVersion]
}
