#!/usr/bin/env node

'use strict'

const
  allowedOptions = [ 'input', 'output', 'update', 'help' ],
  mobileOses = [ 'iOS', 'Android', 'Windows Phone', 'Blackberry' ],
  standardProperties = ['os', 'osVersion', 'browser', 'browserVersion', 'device', 'TestType'],
  allowedProperties = require('./../../../lib/platforms/interfaces/platform').PlatformKeys.browser

let
  path = require('path'),
  utils = require('./../../utils'),
  
  args = utils.ioUpdateHelpArgs(allowedOptions, help)

function help() {
  console.log(
    '\n' +
    path.basename(process.argv[1]) +
    ' [--help|-h] [--input|-i <browsers-yaml-file>] [--output|-o <cbtr-settings-file>] [--update|-u]\n\n' +
    'Defaults:\n' +
    ' input             .cbtr-browsers.yml in project root\n' +
    ' output            cbtr.json in project root\n' +
    ' update            false\n\n' +
    'Options:\n' +
    ' help              print this help\n' +
    ' input             input data of browsers to use in a compact format\n' +
    ' output            cross-browser-tests-runner settings file\n' +
    ' update            if output file exists, update it only'
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
  platformConfigReader,
  browsers

fs.readFileAsync(browsersFile)
.then(data => {
  log.debug('yml file contents %s', data)
  let obj = yaml.safeLoad(data, 'utf8')
  log.debug('read %s', JSON.stringify(obj, null, 2))
  browsers = parse(obj)
  return readExisting()
})
.then(existing => {
  let results = mergeResults(existing, { browsers: browsers }, serverDefaults)
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

function readExisting() {
  return new Bluebird(resolve => {
    if(args.update && fs.existsSync(outputFile)) {
      resolve(JSON.parse(fs.readFileSync(outputFile, 'utf8')))
    }
    else {
      resolve({ })
    }
  })
}

function mergeResults(existing, browsers, defaults) {
  mergeBrowsers(existing, browsers)
  Object.keys(defaults).forEach(key => {
    if(!(key in existing)) {
      existing[key] = defaults[key]
    }
  })
  return existing
}

function mergeBrowsers(existing, browsers) {
  if(!existing.browsers) {
    existing.browsers = browsers.browsers
  }
  else {
    Object.keys(browsers.browsers).forEach(platform => {
      if(!existing.browsers[platform]) {
        existing.browsers[platform] = browsers.browsers[platform]
      }
      else {
        Object.keys(browsers.browsers[platform]).forEach(test => {
          if(!existing.browsers[platform][test]) {
            existing.browsers[platform][test] = browsers.browsers[platform][test]
          }
          else {
            browsers.browsers[platform][test].forEach(browser => {
              if(!browserExists(browser, existing.browsers[platform][test])) {
                existing.browsers[platform][test].push(browser)
              }
            })
          }
        })
      }
    })
  }
}

function browserExists(browser, array) {
  if(!array.length) {
    return false
  }
  let keys = Object.keys(browser)
  for(let elIdx = 0; elIdx < array.length; ++elIdx) {
    let found = true
    for(let idx = 0; idx < keys.length; ++idx) {
      let key = keys[idx]
      if(array[elIdx][key] !== browser[key]) {
        found = false
        break
      }
    }
    if(found) {
      return true
    }
  }
  return false
}

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
    nativeBrowserOnly = osHasSingleVersionNativeBrowser(test, os, osVersion),
    nativeBrowser = (nativeBrowserOnly ? Object.keys(platformConfig[test][os][osVersion])[0] : undefined),
    nativeBrowserVersion = (nativeBrowserOnly ? getNativeBrowserSingleVersion(test, os, osVersion): undefined)
  Object.keys(browsersOrDevices).forEach(browserOrDeviceSpec => {
    if(nativeBrowserOnly) {
      // must be devices only
      handleMobileDevices(platform, test, os, osVersion, nativeBrowser, nativeBrowserVersion, browserOrDeviceSpec, browsersOrDevices, results)
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
  let
    versions = processBrowserVersionSpec(platform, test, os, osVersion, browser, browserVersionSpec),
    properties = browserVersions[browserVersionSpec]
  versions.forEach(version => {
    if(properties) {
      checkProperties(test, os, osVersion, browser, version, null, properties)
    }
    results[platform][test].push(Object.assign({
      os: os, osVersion: osVersion, browser: browser, browserVersion: version
    }, properties))
  })
}

function osHasSingleVersionNativeBrowser(test, os, osVersion) {
  let
    osVersionConfig = platformConfig[test][os][osVersion],
    browsers = Object.keys(osVersionConfig),
    firstBrowserVersions = Object.keys(osVersionConfig[browsers[0]])
  return (1 === browsers.length && 1 === firstBrowserVersions.length)
}

function getNativeBrowserSingleVersion(test, os, osVersion) {
  let
    osVersionConfig = platformConfig[test][os][osVersion],
    browsers = Object.keys(osVersionConfig)
  return Object.keys(osVersionConfig[browsers[0]])[0]
}

function handleMobileBrowser(platform, test, os, osVersion, browser, browsers, results) {
  checkPlatformTestOsVersionBrowser(platform, test, os, osVersion, browser)
  let browserVersions = browsers[browser]
  Object.keys(browserVersions).forEach(browserVersionSpec => {
    handleMobileBrowserVersionSpec(platform, test, os, osVersion, browser, browserVersionSpec, browserVersions, results)
  })
}

function handleMobileBrowserVersionSpec(platform, test, os, osVersion, browser, browserVersionSpec, browserVersions, results) {
  let
    versions = processBrowserVersionSpec(platform, test, os, osVersion, browser, browserVersionSpec),
    devicesSpecs = browserVersions[browserVersionSpec]
  versions.forEach(version => {
    Object.keys(devicesSpecs).forEach(deviceSpec => {
      handleMobileDevices(platform, test, os, osVersion, browser, version, deviceSpec, devicesSpecs, results)
    })
  })
}

function handleMobileDevices(platform, test, os, osVersion, browser, browserVersion, deviceSpec, devices, results) {
  let specParts = deviceSpec.split(',').map(part => { return part.trim() })
  checkPlatformTestOsVersionBrowserDevices(platform, test, os, osVersion, browser, browserVersion, specParts)
  let properties = devices[deviceSpec]
  specParts.forEach(device => {
    if(properties) {
      checkProperties(test, os, osVersion, browser, browserVersion, device, properties)
    }
    results[platform][test].push(Object.assign({
      os: os, osVersion: osVersion, browser: browser,
      browserVersion: ('None' !== browserVersion ? browserVersion : null),
      device: device
    }, properties))
  })
}

function processBrowserVersionSpec(platform, test, os, osVersion, browser, browserVersionSpec) {
  let specParts = browserVersionSpec.split(',').map(part => { return part.trim() }),
    versions = [ ]
  specParts.forEach(specPart => {
    versions = versions.concat(parseBrowserVersion(specPart))
  })
  checkPlatformTestOsVersionBrowserVersions(platform, test, os, osVersion, browser, versions)
  return versions
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

function checkPlatformTestOsVersionBrowserDevices(platform, test, os, osVersion, browser, browserVersion, devices) {
  devices.forEach(device => {
    if(-1 === platformConfig[test][os][osVersion][browser][browserVersion].indexOf(device)) {
      throw new Error('Unsupported device "' + device + '" for browser "' + browser + '" on "' + os + ' ' + osVersion + '" for test type "' + test + '" for "' + platform + '" platform, valid options are: ' + platformConfig[test][os][osVersion][browser][browserVersion].sort().join(', '))
    }
  })
}

function checkProperties(test, os, osVersion, browser, browserVersion, device, properties) {
  let input = {TestType: test, os: os, osVersion: osVersion, browser: browser, browserVersion: browserVersion, device: device}
  input = Object.assign(input, properties)
  Object.keys(properties).forEach(propertyKey => {
    if((-1 !== allowedProperties.indexOf(propertyKey) && -1 !== standardProperties.indexOf(propertyKey)) ||
      (-1 === allowedProperties.indexOf(propertyKey)))
    {
      throw new Error('Unsupported property "' + propertyKey + '" with value "' + properties[propertyKey] + '" for the browser/platform combination ' + JSON.stringify(input))
    }
    try {
      if(!platformConfigReader.validate('parameters', propertyKey, input)) {
        throw new Error('Invalid property "' + propertyKey + '" with value "' + properties[propertyKey] + '" for the browser/platform combination ' + JSON.stringify(input))
      }
    } catch(e) {
      if(!e.message.match(/^Invalid property "/)) {
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
  else if(null !== (match = browserVersion.match(/^\d+(?:\.\d+)+$/))) {
    return browserVersion
  }
  else if(null !== (match = browserVersion.match(/^\d+$/))) {
    return browserVersion + ".0"
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
