#!/usr/bin/env node

'use strict'

const
  jsBrowsersApi = 'https://api.browserstack.com/4/browsers?flat=true',
  seleniumBrowsersApi = 'https://www.browserstack.com/automate/browsers.json'

let
  common = require('./common')

common.run('BrowserStack', [{
  url: jsBrowsersApi,
  process: (browser, config) => {
    return processBrowser(browser, config, 'JS')
  }
}, {
  url: seleniumBrowsersApi,
  process: (browser, config) => {
    return processBrowser(browser, config, 'Selenium')
  }
}], {
  user: process.env.BROWSERSTACK_USERNAME,
  pass: process.env.BROWSERSTACK_ACCESS_KEY
})

function processBrowser(browser, config, type) {
  let
    osAlias = browser.os,
    os = config.Aliases['Operating Systems'][osAlias] || osAlias,
    osConfig = config[type][os] = config[type][os] || { },
    osVersion = browser.os_version,
    osVersionConfig = osConfig[osVersion] = osConfig[osVersion] || { },
    browserAlias = browser.browser,
    browserName = config.Aliases.Browsers[browserAlias] || browserAlias
  handleBrowser(browser, browserName, osVersionConfig)
  return {os: os, osVersion: osVersion}
}

function handleBrowser(browser, browserName, osVersionConfig) {
  let array = osVersionConfig[browserName] || [ ]
  if(browser.browser_version) {
    array.push(browser.browser_version)
  } else /*if(browser.device)*/ {
    array.push(browser.device)
  }
  osVersionConfig[browserName] = array.sort()
}
