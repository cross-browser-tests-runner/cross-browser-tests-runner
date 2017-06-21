#!/usr/bin/env node

'use strict'

const
  host = 'https://api.browserstack.com',
  api = '/4/browsers'

let
  Bluebird = require('bluebird'),
  path = require('path'),
  fs = Bluebird.promisifyAll(require('fs')),
  Log = require('./../../../../lib/core/log').Log,
  Request = require('./../../../../lib/core/request').Request,
  log = new Log(process.env.LOG_LEVEL || 'ERROR', 'Utils.Conf.BrowserStack'),
  configFile = path.resolve(__dirname, './../../../../conf/browserstack-conf.json'),
  mainConfigFile = path.resolve(__dirname, './../../../../conf/cbtr-conf.json'),
  config = require(configFile),
  mainConfig = require(mainConfigFile),
  request = new Request(),
  mainConfigUpdated = false

request.request(
  host + api,
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
  log.debug('results', browsers)
  config.JS = { }
  Object.keys(browsers).forEach(osAlias => {
    let
      os = config.Aliases['Operating Systems'][osAlias] || osAlias,
      osConfig = config.JS[os] = { }
    Object.keys(browsers[osAlias]).forEach(osVersion => {
      if(-1 === mainConfig['Operating Systems'][os].versions.indexOf(osVersion)) {
        mainConfig['Operating Systems'][os].versions.push(osVersion)
        mainConfigUpdated = true
      }
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
  log.debug('parsed %s', JSON.stringify(config, null, 2))
  return fs.writeFileAsync(configFile, JSON.stringify(config, null, 2))
})
.then(() => {
  if(mainConfigUpdated) {
    return fs.writeFileAsync(mainConfigFile, JSON.stringify(mainConfig, null, 2))
  }
  else {
    return true
  }
})
.then(() => {
  console.log('updated browserstack configuration')
})
.catch(err => {
  log.error(err)
})
