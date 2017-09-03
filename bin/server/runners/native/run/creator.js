'use strict'

let
  Log = require('./../../../../../lib/core/log').Log,
  PlatformFactory = require('./../../../../../lib/platforms/factory').Factory,
  log = new Log('Server.Runners.Native.Tests.Creator')

class Creator {

  constructor(settings) {
    this.settings = settings
  }

  create() {
    this._select()
    this._getPlatforms()
    this._createTests()
  }

  _select() {
    const all = Object.keys(this.settings.browsers)
    this.names = [ ]
    all.forEach(name => {
      if(cantPickPlatform(this.settings, name)) {
        log.warn('no "JS" or "Selenium" testing browsers specified for %s, ignoring it...', name)
      }
      else {
        this.names.push(name)
      }
    })
  }

  _getPlatforms() {
    this.platforms = { }
    this.names.forEach(name => {
      this.platforms[name] = PlatformFactory.get(name.toLowerCase())
    })
  }

  _createTests() {
    const
      testFiles = 'string' === typeof(this.settings.test_file)
        ? [this.settings.test_file]
        : this.settings.test_file,
      host = 'http://' + this.settings.server.host + ':' + this.settings.server.port
    this.tests = { }
    this.names.forEach(name => {
      this.tests[name] = {JS: [ ], Selenium: [ ]}
    })
    this._createJSTests(testFiles, host)
    this._createSeleniumTests(testFiles, host)
  }

  _createJSTests(testFiles, host) {
    this.names.forEach(name => {
      if(noJsBrowsers(this.settings, name)) {
        return
      }
      testFiles.forEach(testFile => {
        this.tests[name].JS.push({
          url: host + '/' + testFile.replace(/^\//, ''),
          browserIndex: 0
        })
      })
    })
  }

  _createSeleniumTests(testFiles, host) {
    const
      scriptFiles = 'string' === typeof(this.settings.test_script)
        ? [this.settings.test_script]
        : this.settings.test_script
    this.names.forEach(name => {
      if(badSeleniumConfig(this.settings, name)) {
        return
      }
      testFiles.forEach(testFile => {
        scriptFiles.forEach(scriptFile => {
          this.tests[name].Selenium.push({
            url: host + '/' + testFile.replace(/^\//, ''),
            scriptFile: scriptFile,
            browserIndex: 0
          })
        })
      })
    })
  }

}

function cantPickPlatform(settings, name) {
  return (noJsBrowsers(settings, name) && badSeleniumConfig(settings, name))
}

function noJsBrowsers(settings, name) {
  return (!settings.browsers[name].JS || !settings.browsers[name].JS.length)
}

function badSeleniumConfig(settings, name) {
  return (!(settings.browsers[name].Selenium
    && settings.browsers[name].Selenium.length
    && settings.test_script))
}

exports.Creator = Creator
