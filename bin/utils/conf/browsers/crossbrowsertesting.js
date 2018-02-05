#!/usr/bin/env node

'use strict'

const
  liveBrowsersApi = 'https://crossbrowsertesting.com/api/v3/livetests/browsers?format=json',
  seleniumBrowsersApi = 'https://crossbrowsertesting.com/api/v3/selenium/browsers?format=json',
  aliases = {
    os: {
      'Mac OSX': 'OS X'
    },
    osVersion: {
      'OS X': {
        '10.13': 'High Sierra',
        '10.12': 'Sierra',
        '10.11': 'El Capitan',
        '10.10': 'Yosemite',
        '10.9': 'Mavericks',
        '10.8': 'Mountain Lion',
        '10.7': 'Lion'
      },
      'Ubuntu': {
        '11.10': 'Oneiric',
        '14.04': 'Trusty',
        '15.04': 'Vivid'
      }
    },
    browser: {
      'Microsoft Edge': 'Edge'
    }
  },
  typeConverter = {
    Mac: 'OS X',
    iPhone: 'iOS',
    iPad: 'iOS'
  },
  versionRegex = {
    Ubuntu: /^Ubuntu /,
    Windows: /^Windows /,
    'OS X': /^Mac OSX /
  }

let
  common = require('./common')

common.run('CrossBrowserTesting', [{
  url: liveBrowsersApi,
  process: (browserSet, config) => {
    processBrowserSet(browserSet, config, 'JS')
  }
}, {
  url: seleniumBrowsersApi,
  process: (browserSet, config) => {
    processBrowserSet(browserSet, config, 'Selenium')
  }
}], {
  user: process.env.CROSSBROWSERTESTING_USERNAME,
  pass: process.env.CROSSBROWSERTESTING_ACCESS_KEY
})

function processBrowserSet(browserSet, config, testType) {
  let
    osParts = getOsParts(browserSet),
    os = osParts[0],
    osConfig = getOsConfig(config, os, testType),
    osVersion = osParts[1],
    osVersionConfig = getOsVersionConfig(osConfig, osVersion),
    device = getDevice(browserSet)
  browserSet.browsers.forEach(browser => {
    let
      browserName = getBrowserName(browser),
      browserConfig = getBrowserConfig(osVersionConfig, browserName),
      browserVersion = getBrowserVersion(browser),
      browserVersionConfig = getBrowserVersionConfig(browserConfig, browserVersion)
    if(device && -1 === browserVersionConfig.indexOf(device)) {
      browserVersionConfig.push(device)
      browserConfig[browserVersion] = browserVersionConfig.sort()
    }
    createBrowserConversion(browserName, browserVersion, browser.api_name, config)
  })
  createOsConversion(os, osVersion, device, browserSet.api_name, config)
  browserSet.resolutions.forEach(resolution => {
    handleResolution(os, osVersion, device, resolution.name, config)
    if(device) {
      handleOrientation(os, osVersion, device, resolution.name, resolution.orientation, config)
    }
  })
}

function getOsParts(browserSet) {
  let
    os = getOsFromType(browserSet.type),
    osVersion = getOsVersionFromOsAndVersion(os, browserSet.version)
  return [os, osVersion]
}

function getOsFromType(type) {
  return typeConverter[type] || type
}

function getOsVersionFromOsAndVersion(os, version) {
  let
    regex = versionRegex[os],
    osVersion = regex ? version.replace(regex, '') : version
  if(aliases.osVersion[os] && aliases.osVersion[os][osVersion]) {
    osVersion = aliases.osVersion[os][osVersion]
  }
  return osVersion
}

function getOsConfig(config, os, testType) {
  config[testType][os] = config[testType][os] || { }
  return config[testType][os]
}

function getOsVersionConfig(osConfig, osVersion) {
  osConfig[osVersion] = osConfig[osVersion] || { }
  return osConfig[osVersion]
}

function getDevice(browserSet) {
  return ('desktop' !== browserSet.device ? browserSet.name.replace(/ \/.*$/, '') : null)
}

function getBrowserName(browser) {
  let name = aliases.browser[browser.type] || browser.type
  if(browser.name.match(/64\-bit/)) {
    name += ' x64'
  }
  return name
}

function getBrowserConfig(osVersionConfig, browserName) {
  osVersionConfig[browserName] = osVersionConfig[browserName] || { }
  return osVersionConfig[browserName]
}

function getBrowserVersion(browser) {
  if(!browser.version.match(/\./) && 'Blackberry Browser' !== browser.type) {
    return browser.version + ".0"
  }
  return browser.version
}

function getBrowserVersionConfig(browserConfig, browserVersion) {
  browserConfig[browserVersion] = browserConfig[browserVersion] || [ ]
  return browserConfig[browserVersion]
}

function createBrowserConversion(browserName, browserVersion, apiName, config) {
  let
    conversionObj = initBrowserConversionKey(config),
    browserConversion = setupBrowserKey(conversionObj, browserName)
  browserConversion[browserVersion] = apiName
}

function initBrowserConversionKey(config) {
  config.conversions.browser = config.conversions.browser || { }
  return config.conversions.browser
}

function setupBrowserKey(config, browserName) {
  config[browserName] = config[browserName] || { '@key': 'browserVersion' }
  return config[browserName]
}

function createOsConversion(os, osVersion, device, apiName, config) {
  let
    conversionObj = initOsConversionKey(config),
    osConversion = setupOsKey(conversionObj, os)
  if(!device) {
    osConversion[osVersion] = apiName
  } else {
    let osVersionConversion = setupOsVersionKey(osConversion, osVersion)
    osVersionConversion[device] = apiName
  }
}

function initOsConversionKey(config) {
  config.conversions.os = config.conversions.os || { }
  return config.conversions.os
}

function setupOsKey(config, os) {
  config[os] = config[os] || { '@key': 'osVersion' }
  return config[os]
}

function setupOsVersionKey(osConversion, osVersion) {
  osConversion[osVersion] = osConversion[osVersion] || { '@key': 'device' }
  return osConversion[osVersion]
}

function handleResolution(os, osVersion, device, resolution, config) {
  let
    resolutionObj = initResolutionKey(config),
    osResolution = setupOsResolution(resolutionObj, os)
  if(!device) {
    setupOsVersionResolution(osResolution, osVersion, resolution)
  }
  else {
    osResolution[osVersion] = osResolution[osVersion] || { '@key': 'device' }
    setupDeviceResolution(osResolution[osVersion], device, resolution)
  }
}

function initResolutionKey(config) {
  config.parameters.resolution = config.parameters.resolution || { '@key': 'os' }
  return config.parameters.resolution
}

function setupOsResolution(resolutionObj, os) {
  resolutionObj[os] = resolutionObj[os] || { '@key' : 'osVersion' }
  return resolutionObj[os]
}

function setupOsVersionResolution(osResolution, osVersion, resolution) {
  let osVersionResolution = osResolution[osVersion] = osResolution[osVersion] || [ ]
  if(-1 === osVersionResolution.indexOf(resolution)) {
    osResolution[osVersion] = osVersionResolution.concat([resolution]).sort()
  }
}

function setupDeviceResolution(osVersionResolution, device, resolution) {
  let deviceResolution = osVersionResolution[device] = osVersionResolution[device] || [ ]
  if(-1 === deviceResolution.indexOf(resolution)) {
    osVersionResolution[device] = deviceResolution.concat([resolution]).sort()
  }
}

function handleOrientation(os, osVersion, device, resolution, orientation, config) {
  let
    orientationObj = initOrientationKey(config),
    osOrientation = setupOsOrientation(orientationObj, os),
    osVersionOrientation = setupOsVersionOrientation(osOrientation, osVersion),
    deviceOrientation = setupDeviceOrientation(osVersionOrientation, device)
  deviceOrientation[resolution] = orientation
}

function initOrientationKey(config) {
  config.parameters.orientation = config.parameters.orientation || { '@if': { device: '!== null' }, '@key': 'os' }
  return config.parameters.orientation
}

function setupOsOrientation(orientationObj, os) {
  orientationObj[os] = orientationObj[os] || { '@key' : 'osVersion' }
  return orientationObj[os]
}

function setupOsVersionOrientation(osOrientation, osVersion) {
  osOrientation[osVersion] = osOrientation[osVersion] || { '@key': 'device' }
  return osOrientation[osVersion]
}

function setupDeviceOrientation(osVersionOrientation, device) {
  osVersionOrientation[device] = osVersionOrientation[device] || { '@key': 'resolution' }
  return osVersionOrientation[device]
}
