#!/usr/bin/env node

'use strict'

const
  allowedOptions = [ 'input', 'output', 'help' ]

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
  serverDefaults = require('./../../server/defaults'),
  config = require('./../../../conf/cbtr-conf.json'),
  browsersFile = args.input || path.resolve(process.cwd(), ".cbtr-browsers.yml"),
  outputFile = args.output || path.resolve(process.cwd(), "cbtr.json"),
  platformConfig

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
    checkPlatform(platform)
    results[platform] = { }
    let tests = obj[platform]
    Object.keys(tests).forEach(test => {
      checkPlatformTest(platform, test)
      switch(platform) {
        case 'BrowserStack':
          platformConfig = JSON.parse(
            fs.readFileSync(
              path.resolve(__dirname, './../../../conf/browserstack-conf.json'), 'utf8'))
          break
        default:
          break
      }
      results[platform][test] = [ ]
      let oses = tests[test]
      Object.keys(oses).forEach(os => {
        checkOs(os)
        checkPlatformTestOs(platform, test, os)
        let osVersions = oses[os]
        Object.keys(osVersions).forEach(osVersion => {
          checkOsVersion(os, osVersion)
          checkPlatformTestOsVersion(platform, test, os, osVersion)
          let browsers = osVersions[osVersion]
          Object.keys(browsers).forEach(browser => {
            checkBrowser(browser)
            checkPlatformTestOsVersionBrowser(platform, test, os, osVersion, browser)
            if('desktop' === config['Operating Systems'][os].type) {
              let browserVersions = browsers[browser], parsed = [ ]
              if('object' !== typeof(browserVersions)) {
                browserVersions = [ browsers[browser] ]
              }
              browserVersions.forEach(browserVersion => {
                let ret = parseBrowserVersion(browserVersion)
                if('string' === typeof(ret)) {
                  parsed.push(ret)
                } else {
                  Array.prototype.push.apply(parsed, ret)
                }
              })
              checkPlatformTestOsVersionBrowserVersions(platform, test, os, osVersion, browser, parsed)
              parsed.forEach(browserVersion => {
                results[platform][test].push({
                  os: os, osVersion: osVersion, browser: browser, browserVersion: browserVersion
                })
              })
            } else { // mobile
              let devices = browsers[browser]
              if('object' !== typeof(devices)) {
                devices = [ browsers[browser] ]
              }
              checkPlatformTestOsVersionBrowserDevices(platform, test, os, osVersion, browser, devices)
              devices.forEach(device => {
                results[platform][test].push({
                  os: os, osVersion: osVersion, browser: browser, browserVersion: null, device: device
                })
              })
            }
          })
        })
      })
    })
  })
  return results
}

function checkPlatform(platform) {
  if(!config.Platforms[platform]) {
    throw new Error('Unknown cross-browser testing platform "'+ platform + '", valid options are: ' + Object.keys(config.Platforms).join(', '))
  }
}

function checkPlatformTest(platform, test) {
  if(-1 === config.Platforms[platform].indexOf(test)) {
    throw new Error('Unsupported test type "' + test + '" for "' + platform + '" platform, valid options are: ' + config.Platforms[platform].join(', '))
  }
}

function checkOs(os) {
  if(! config['Operating Systems'][os]) {
    throw new Error('Unknown OS "' + os + '", valid options are: ' + Object.keys(config['Operating Systems']).join(', '))
  }
}

function checkPlatformTestOs(platform, test, os) {
  if(!platformConfig[test][os]) {
    throw new Error('Unsupported OS "' + os + '" for test type "' + test + '" for "' + platform + '" platform, valid options are: ' + Object.keys(platformConfig[test]).join(', '))
  }
}

function checkOsVersion(os, osVersion) {
  if(-1 === config['Operating Systems'][os].versions.indexOf(osVersion)) {
    throw new Error('Unknown OS version "' + osVersion + '" for os "' + os + '", valid options are: ' + config['Operating Systems'][os].versions.join(', '))
  }
}

function checkPlatformTestOsVersion(platform, test, os, osVersion) {
  if(!platformConfig[test][os][osVersion]) {
    throw new Error('Unsupported version "' + osVersion + '" for os "' + os + '" for test type "' + test + '" for "' + platform + '" platform, valid options are: ' + Object.keys(platformConfig[test][os]).join(', '))
  }
}

function checkBrowser(browser) {
  if(-1 === config['Browsers'].indexOf(browser)) {
    throw new Error('Unknown browser "' + browser + '", valid options are: ' + config['Browsers'].join(', '))
  }
}

function checkPlatformTestOsVersionBrowser(platform, test, os, osVersion, browser) {
  if(!platformConfig[test][os][osVersion][browser]) {
    throw new Error('Unsupported browser "' + browser + '" on "' + os + ' ' + osVersion + '" for test type "' + test + '" for "' + platform + '" platform, valid options are: ' + Object.keys(platformConfig[test][os][osVersion]).join(', '))
  }
}

function checkPlatformTestOsVersionBrowserVersions(platform, test, os, osVersion, browser, versions) {
  commonCheckBrowserVersionsDevices(platform, test, os, osVersion, browser, versions, 'version')
}

function checkPlatformTestOsVersionBrowserDevices(platform, test, os, osVersion, browser, devices) {
  commonCheckBrowserVersionsDevices(platform, test, os, osVersion, browser, devices, 'device')
}

function commonCheckBrowserVersionsDevices(platform, test, os, osVersion, browser, which, what) {
  which.forEach(checked => {
    if(-1 === platformConfig[test][os][osVersion][browser].indexOf(checked)) {
      throw new Error('Unsupported ' + what + ' "' + checked + '" for browser "' + browser + '" on "' + os + ' ' + osVersion + '" for test type "' + test + '" for "' + platform + '" platform, valid options are: ' + platformConfig[test][os][osVersion][browser].join(', '))
    }
  })
}

function parseBrowserVersion(browserVersion) {
  if('number' === typeof(browserVersion)) {
    return float2str(browserVersion)
  }
  else if ('string' === typeof(browserVersion)) {
    let match
    if(!(match = browserVersion.match(/^(\d+(?:\.\d+)?)\-(\d+(?:\.\d+)?)$/))) {
      return browserVersion
    }
    else {
      let min = parseFloat(match[1]), max = parseFloat(match[2]), range = [ ]
      while(min <= max) {
        let f = min
        range.push(float2str(f))
        min += 1.0
      }
      return range
    }
  }
  else {
    throw new Error('Unsupported type for browserVersion ' + browserVersion)
  }
}

function float2str(f) {
  f = f.toString()
  if(!f.match(/\./)) {
    f += '.0'
  }
  return f
}
