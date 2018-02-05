#!/usr/bin/env node

'use strict'

const
  allowedOptions = [ 'input', 'output', 'help' ],
  mobileOses = [ 'iOS', 'Android', 'Windows Phone' ],
  standardProperties = ['os', 'osVersion', 'browser', 'browserVersion', 'device', 'TestType'],
  allowedProperties = require('./../../../lib/platforms/interfaces/platform').PlatformKeys.browser

let
  path = require('path'),
  utils = require('./../../utils'),
  
  args = utils.ioHelpArgs(allowedOptions, help)

function help() {
  console.log(
    '\n' +
    path.basename(process.argv[1]) +
    ' [--help|-h] [--input|-i <browsers-yaml-file>] [--output|-o <cbtr-settings-file>]\n\n' +
    'Defaults:\n' +
    ' input             .cbtr-browsers.yml in project root\n' +
    ' output            cbtr.json in project root\n\n' +
    'Options:\n' +
    ' help              print this help\n' +
    ' input             input data of browsers to use in a compact format\n' +
    ' output            cross-browser-tests-runner settings file'
  )
}

utils.handleHelp(args, help)

let
  yaml = require('js-yaml'),
  Bluebird = require('bluebird'),
  fs = Bluebird.promisifyAll(require('fs')),
  Log = require('./../../../lib/core/log').Log,
  log = new Log('Utils.Settings.Cbtr'),
  Config = require('./../../../lib/core/config').Config,
  serverDefaults = require('./../../server/defaults'),
  config = require('./../../../conf/cbtr-conf.json'),
  browsersFile = args.input || path.resolve(process.cwd(), ".cbtr-browsers.yml"),
  outputFile = args.output || path.resolve(process.cwd(), "cbtr.json"),
  platformConfig,
  platformConfigReader

fs.readFileAsync(browsersFile)
.then(data => {
  log.debug('yml file contents %s', data)
  let obj = yaml.safeLoad(data, 'utf8')
  log.debug('read %s', JSON.stringify(obj, null, 2))
  let results = Object.assign({"browsers": parse(obj)}, serverDefaults)
  log.debug('parsed results %s', JSON.stringify(results, null, 2))
  return fs.writeFileAsync(outputFile, JSON.stringify(results, null, 2))
})
.then(() => {
  console.log('Created cross-browser-tests-runner settings file - %s', outputFile)
})
.catch(err => {
  console.error("\x1b[31m", err.message, "\x1b[0m")
  log.debug(err.stack)
})

function parse(obj) {
  let results = { }
  Object.keys(obj).forEach(platform => {
    handlePlatform(platform, obj, results)
  })
  return results
}

function handlePlatform(platform, conf, results) {
  checkPlatform(platform)
  let platformConfigFile = path.resolve(__dirname, './../../../conf/' + platform.toLowerCase() + '-conf.json')
  platformConfig = JSON.parse(fs.readFileSync(platformConfigFile, 'utf8'))
  platformConfigReader = new Config(platformConfigFile)
  results[platform] = { }
  let tests = conf[platform]
  Object.keys(tests).forEach(test => {
    handleTest(platform, test, tests, results)
  })
}

function handleTest(platform, test, tests, results) {
  checkPlatformTest(platform, test)
  results[platform][test] = [ ]
  let oses = tests[test]
  Object.keys(oses).forEach(os => {
    handleOs(platform, test, os, oses, results)
  })
}

function handleOs(platform, test, os, oses, results) {
  checkPlatformTestOs(platform, test, os)
  let osVersions = oses[os]
  Object.keys(osVersions).forEach(osVersion => {
    handleOsVersion(platform, test, os, osVersion, osVersions, results)
  })
}

function handleOsVersion(platform, test, os, osVersion, osVersions, results) {
  checkPlatformTestOsVersion(platform, test, os, osVersion)
  if(-1 === mobileOses.indexOf(os)) {
    handleDesktopOsVersion(platform, test, os, osVersion, osVersions, results)
  }
  else {
    handleMobileOsVersion(platform, test, os, osVersion, osVersions, results)
  }
}

function handleDesktopOsVersion(platform, test, os, osVersion, osVersions, results) {
  let browsers = osVersions[osVersion]
  Object.keys(browsers).forEach(browser => {
    handleDesktopBrowser(platform, test, os, osVersion, browser, browsers, results)
  })
}

function handleMobileOsVersion(platform, test, os, osVersion, osVersions, results) {
  let browsersOrDevices = osVersions[osVersion],
    osHasNativeBrowserOnly = (1 === Object.keys(platformConfig[test][os][osVersion]).length),
    nativeBrowser = (osHasNativeBrowserOnly ? Object.keys(platformConfig[test][os][osVersion])[0] : undefined)
  Object.keys(browsersOrDevices).forEach(browserOrDeviceSpec => {
    if(osHasNativeBrowserOnly && nativeBrowser !== browserOrDeviceSpec) {
      // native browser omitted, and devices have been specified
      handleMobileDevices(platform, test, os, osVersion, nativeBrowser, browserOrDeviceSpec, browsersOrDevices, results)
    }
    else {
      handleMobileBrowser(platform, test, os, osVersion, browserOrDeviceSpec, browsersOrDevices, results)
    }
  })
}

function handleDesktopBrowser(platform, test, os, osVersion, browser, browsers, results) {
  checkPlatformTestOsVersionBrowser(platform, test, os, osVersion, browser)
  let browserVersions = browsers[browser]
  Object.keys(browserVersions).forEach(browserVersionSpec => {
    handleDesktopBrowserVersionSpec(platform, test, os, osVersion, browser, browserVersionSpec, browserVersions, results)
  })
}

function handleDesktopBrowserVersionSpec(platform, test, os, osVersion, browser, browserVersionSpec, browserVersions, results) {
  let specParts = browserVersionSpec.split(',').map(part => { return part.trim() }),
    versions = [ ]
  specParts.forEach(specPart => {
    versions = versions.concat(parseBrowserVersion(specPart))
  })
  checkPlatformTestOsVersionBrowserVersions(platform, test, os, osVersion, browser, versions)
  let properties = browserVersions[browserVersionSpec]
  versions.forEach(version => {
    if(properties) {
      checkProperties(test, os, osVersion, browser, version, null, properties)
    }
    results[platform][test].push(Object.assign({
      os: os, osVersion: osVersion, browser: browser, browserVersion: version
    }, properties))
  })
}

function handleMobileBrowser(platform, test, os, osVersion, browser, browsers, results) {
  checkPlatformTestOsVersionBrowser(platform, test, os, osVersion, browser)
  let devices = browsers[browser]
  Object.keys(devices).forEach(deviceSpec => {
    handleMobileDevices(platform, test, os, osVersion, browser, deviceSpec, devices, results)
  })
}

function handleMobileDevices(platform, test, os, osVersion, browser, deviceSpec, devices, results) {
  let specParts = deviceSpec.split(',').map(part => { return part.trim() })
  checkPlatformTestOsVersionBrowserDevices(platform, test, os, osVersion, browser, specParts)
  let properties = devices[deviceSpec]
  specParts.forEach(device => {
    if(properties) {
      checkProperties(test, os, osVersion, browser, null, device, properties)
    }
    results[platform][test].push(Object.assign({
      os: os, osVersion: osVersion, browser: browser, browserVersion: null, device: device
    }, properties))
  })
}

function checkPlatform(platform) {
  if(!config.Platforms[platform]) {
    throw new Error('Unknown cross-browser testing platform "'+ platform + '", valid options are: ' + Object.keys(config.Platforms).sort().join(', '))
  }
}

function checkPlatformTest(platform, test) {
  if(-1 === config.Platforms[platform].indexOf(test)) {
    throw new Error('Unsupported test type "' + test + '" for "' + platform + '" platform, valid options are: ' + config.Platforms[platform].join(', '))
  }
}

function checkPlatformTestOs(platform, test, os) {
  if(!platformConfig[test][os]) {
    throw new Error('Unsupported OS "' + os + '" for test type "' + test + '" for "' + platform + '" platform, valid options are: ' + Object.keys(platformConfig[test]).sort().join(', '))
  }
}

function checkPlatformTestOsVersion(platform, test, os, osVersion) {
  if(!platformConfig[test][os][osVersion]) {
    throw new Error('Unsupported version "' + osVersion + '" for os "' + os + '" for test type "' + test + '" for "' + platform + '" platform, valid options are: ' + Object.keys(platformConfig[test][os]).sort().join(', '))
  }
}

function checkPlatformTestOsVersionBrowser(platform, test, os, osVersion, browser) {
  if(!platformConfig[test][os][osVersion][browser]) {
    throw new Error('Unsupported browser "' + browser + '" on "' + os + ' ' + osVersion + '" for test type "' + test + '" for "' + platform + '" platform, valid options are: ' + Object.keys(platformConfig[test][os][osVersion]).sort().join(', '))
  }
}

function checkPlatformTestOsVersionBrowserVersions(platform, test, os, osVersion, browser, versions) {
  versions.forEach(version => {
    if(!platformConfig[test][os][osVersion][browser][version]) {
      throw new Error('Unsupported version "' + version + '" for browser "' + browser + '" on "' + os + ' ' + osVersion + '" for test type "' + test + '" for "' + platform + '" platform, valid options are: ' + Object.keys(platformConfig[test][os][osVersion][browser]).sort().join(', '))
    }
  })
}

function checkPlatformTestOsVersionBrowserDevices(platform, test, os, osVersion, browser, devices) {
  devices.forEach(device => {
    if(-1 === platformConfig[test][os][osVersion][browser].None.indexOf(device)) {
      throw new Error('Unsupported device "' + device + '" for browser "' + browser + '" on "' + os + ' ' + osVersion + '" for test type "' + test + '" for "' + platform + '" platform, valid options are: ' + platformConfig[test][os][osVersion][browser].None.sort().join(', '))
    }
  })
}

function checkProperties(test, os, osVersion, browser, browserVersion, device, properties) {
  Object.keys(properties).forEach(propertyKey => {
    let input = {TestType: test, os: os, osVersion: osVersion, browser: browser, browserVersion: browserVersion, device: device}
    if((-1 !== allowedProperties.indexOf(propertyKey) && -1 !== standardProperties.indexOf(propertyKey)) ||
      (-1 === allowedProperties.indexOf(propertyKey)))
    {
      throw new Error('Unsupported property "' + propertyKey + '" with value "' + properties[propertyKey] + '" for the browser/platform combination ' + JSON.stringify(input))
    }
    input[propertyKey] = properties[propertyKey]
    try {
      if(!platformConfigReader.validate('parameters', propertyKey, input)) {
        delete input[propertyKey]
        throw new Error('Invalid property "' + propertyKey + '" with value "' + properties[propertyKey] + '" for the browser/platform combination ' + JSON.stringify(input))
      }
    } catch(e) {
      if(!e.message.match(/^Invalid property "/)) {
        delete input[propertyKey]
        throw new Error('Unsupported property "' + propertyKey + '" with value "' + properties[propertyKey] + '" for the browser/platform combination ' + JSON.stringify(input))
      }
      throw e
    }
  })
}

function parseBrowserVersion(browserVersion) {
  let match
  if(null !== (match = browserVersion.match(/^(\d+(?:\.\d+)?)\-(\d+(?:\.\d+)?)$/))) {
    let min = parseFloat(match[1]), max = parseFloat(match[2]), range = [ ]
    while(min <= max) {
      let f = min
      range.push(float2str(f))
      min += 1.0
    }
    return range
  }
  else if(null !== (match = browserVersion.match(/^\d+(?:\.\d+)?$/))) {
    return [ float2str(parseFloat(browserVersion)) ]
  }
  else {
    throw new Error('Unsupported value "' + browserVersion + '" for browserVersion')
  }
}

function float2str(f) {
  f = f.toString()
  if(!f.match(/\./)) {
    f += '.0'
  }
  return f
}
