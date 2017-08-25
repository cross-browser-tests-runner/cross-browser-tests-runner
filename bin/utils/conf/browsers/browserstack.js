#!/usr/bin/env node

'use strict'

const
  jsBrowsersApi = 'https://api.browserstack.com/4/browsers',
  seleniumBrowsersApi = 'https://www.browserstack.com/automate/browsers.json'

let
  Bluebird = require('bluebird'),
  path = require('path'),
  fs = Bluebird.promisifyAll(require('fs')),
  Log = require('./../../../../lib/core/log').Log,
  Request = require('./../../../../lib/core/request').Request,
  log = new Log('Utils.Conf.BrowserStack'),
  configFile = path.resolve(__dirname, './../../../../conf/browserstack-conf.json'),
  mainConfigFile = path.resolve(__dirname, './../../../../conf/cbtr-conf.json'),
  config = require(configFile),
  mainConfig = require(mainConfigFile),
  mainConfigUpdated = false

function updateJsBrowsers() {
  let request = new Request()
  return request.request(
    jsBrowsersApi,
    'GET',
    {
      json: true,
      auth: {
        user: process.env.BROWSERSTACK_USERNAME,
        pass: process.env.BROWSERSTACK_ACCESS_KEY
      }
    }
  )
  .then(browsers => {
    log.debug('JS browsers from API', browsers)
    config.JS = { }
    Object.keys(browsers).forEach(osAlias => {
      let
        os = config.Aliases['Operating Systems'][osAlias] || osAlias,
        osConfig = config.JS[os] = { }
      Object.keys(browsers[osAlias]).forEach(osVersion => {
        checkMainConfig(os, osVersion)
        let osVersionConfig = osConfig[osVersion] = { }
        browsers[osAlias][osVersion].forEach(browser => {
          let
            browserAlias = browser.browser,
            browserName = config.Aliases.Browsers[browserAlias] || browserAlias
          osVersionConfig[browserName] = osVersionConfig[browserName] || [ ]
          if(browser.browser_version) {
            osVersionConfig[browserName].push(browser.browser_version)
          } else if(browser.devices) {
            Array.prototype.push.apply(osVersionConfig[browserName], browser.devices)
          }
        })
      })
    })
    log.debug('parsed JS browsers %s', JSON.stringify(config.JS, null, 2))
    return Bluebird.resolve(true)
  })
}

function updateSeleniumBrowsers() {
  let request = new Request()
  return request.request(
    seleniumBrowsersApi,
    'GET',
    {
      json: true,
      auth: {
        user: process.env.BROWSERSTACK_USERNAME,
        pass: process.env.BROWSERSTACK_ACCESS_KEY
      }
    }
  )
  .then(browsers => {
    log.debug('Selenium browsers from API', browsers)
    config.Selenium = { }
    browsers.forEach(browser => {
      let
        osAlias = browser.os,
        os = config.Aliases['Operating Systems'][osAlias] || osAlias,
        osConfig = config.Selenium[os] = config.Selenium[os] || { },
        osVersion = browser.os_version,
        osVersionConfig = osConfig[osVersion] = osConfig[osVersion] || { },
        browserAlias = browser.browser,
        browserName = config.Aliases.Browsers[browserAlias] || browserAlias
      handleSeleniumBrowser(browser, browserName, osVersionConfig)
      checkMainConfig(os, osVersion)
    })
    log.debug('parsed selenium browsers %s', JSON.stringify(config.Selenium, null, 2))
    return Bluebird.resolve(true)
  })
}

function checkMainConfig(os, osVersion) {
  if(-1 === mainConfig['Operating Systems'][os].versions.indexOf(osVersion)) {
    mainConfig['Operating Systems'][os].versions.push(osVersion)
    mainConfigUpdated = true
  }
}

function handleSeleniumBrowser(browser, browserName, osVersionConfig) {
  osVersionConfig[browserName] = osVersionConfig[browserName] || [ ]
  if(browser.browser_version) {
    osVersionConfig[browserName].push(browser.browser_version)
  } else if(browser.device) {
    osVersionConfig[browserName].push(browser.device)
  }
}

updateJsBrowsers()
.then(() => {
  return updateSeleniumBrowsers()
})
.then(() => {
  log.debug('parsed %s', JSON.stringify(config, null, 2))
  return fs.writeFileAsync(configFile, JSON.stringify(config, null, 2))
})
.then(() => {
  console.log('Updated BrowserStack JS and Selenium testing configuration')
  if(mainConfigUpdated) {
    return fs.writeFileAsync(mainConfigFile, JSON.stringify(mainConfig, null, 2))
  }
  else {
    return true
  }
})
.then(() => {
  if(mainConfigUpdated) {
    console.log('Updated main cross-browser-tests-runner configuration with new OS versions')
  }
})
.catch(err => {
  log.error(err)
})
