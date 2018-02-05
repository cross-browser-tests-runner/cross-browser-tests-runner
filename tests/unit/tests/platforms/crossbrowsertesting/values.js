'use strict';

var
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Values = require('./../../../../../lib/platforms/crossbrowsertesting/values').Values

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('Values', function() {

  describe('js', function() {

    this.timeout(0)

    it('should fail if all required browser keys are not provided', function() {
      expect(()=>{Values.js({ }, { })}).to.throw('required option browser missing')
    })

    it('should fail if an unknown browser key is provided', function() {
      expect(()=>{Values.js({ os: 1, osVersion: 2, browser: 3, browserVersion: 4, abc: 123 }, { })}).to.throw('option abc is not allowed')
    })

    it('should fail if an unknown capabilities key is provided', function() {
      expect(()=>{Values.js({ os: 1, osVersion: 2, browser: 3, browserVersion: 4 }, { abc: 123 })}).to.throw('option abc is not allowed')
    })

    it('should fail if an unknown os is provided', function() {
      expect(()=>{Values.js({ os: 1, osVersion: 2, browser: 3, browserVersion: 4 }, { })}).to.throw('invalid os "1"')
    })

    it('should fail if an unknown os version is provided', function() {
      expect(()=>{Values.js({ os: "Windows", osVersion: 2, browser: 3, browserVersion: 4 }, { })}).to.throw('invalid osVersion "2" for os "Windows"')
    })

    it('should fail if an unknown browser is provided', function() {
      expect(()=>{Values.js({ os: "Windows", osVersion: "10", browser: 3, browserVersion: 4 }, { })}).to.throw('invalid browser "3" for osVersion "10" for os "Windows"')
    })

    it('should fail if an unknown browser version is provided', function() {
      expect(()=>{Values.js({ os: "Windows", osVersion: "10", browser: "Chrome", browserVersion: 4 }, { })}).to.throw('invalid version "4" for browser "Chrome" for osVersion "10" for os "Windows"')
    })

    it('should fail if an unknown device is provided', function() {
      expect(()=>{Values.js({ os: "iOS", osVersion: "5.0", browser: "Mobile Safari", browserVersion: '5.1', device: "abc" }, { })}).to.throw('invalid device "abc" for version "5.1" for browser "Mobile Safari" for osVersion "5.0" for os "iOS"')
    })

    it('should populate defaults if corresponding keys are not provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { })
      expect(ret.capabilities.max_duration).to.equal(60)
    })

    it('should use input values of keys for which defaults exist', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { timeout: 120 })
      expect(ret.capabilities.max_duration).to.equal(120)
    })

    it('should convert "Firefox" version 40.0 to "FF40"', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: '40.0' }, { })
      expect(ret.browser.browser_api_name).to.equal('FF40')
    })

    it('should convert "Android" v7.0 device "Android Nexus 6P" to "Nexus6P-And70"', function() {
      let ret = Values.js({ os: "Android", osVersion: "7.0", browser: "Dolphin Mobile", browserVersion: "12.0", device: "Android Nexus 6P" }, { })
      expect(ret.browser.os_api_name).to.equal('Nexus6P-And70')
    })

    it('should convert "OS X" "El Capitan" to "Mac10.11"', function() {
      let ret = Values.js({ os: "OS X", osVersion: "El Capitan", browser: "Safari", browserVersion: "9.0" }, { timeout: 120 })
      expect(ret.browser.os_api_name).to.equal('Mac10.11')
    })

    it('should remove "build" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { build: 120 })
      expect(ret.capabilities.build).to.be.undefined
    })

    it('should retain "build" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { build: "abc" })
      expect(ret.capabilities.build).to.equal('abc')
    })

    it('should remove "test" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { test: 120 })
      expect(ret.capabilities.name).to.be.undefined
    })

    it('should retain "test" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { test: "abc" })
      expect(ret.capabilities.name).to.equal('abc')
    })

    it('should remove "timeout" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { timeout: false })
      expect(ret.capabilities.max_duration).to.be.undefined
    })

    it('should retain "timeout" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { timeout: 60 })
      expect(ret.capabilities.max_duration).to.equal(60)
    })

    it('should remove "local" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { local: 120 })
      expect(ret.capabilities.local).to.be.undefined
    })

    it('should retain "local" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { local: true })
      expect(ret.capabilities.local).to.be.true
    })

    it('should remove "video" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { video: 120 })
      expect(ret.capabilities.record_video).to.be.undefined
    })

    it('should retain "video" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { video: false })
      expect(ret.capabilities.record_video).to.not.be.undefined
    })

    it('should remove "captureNetwork" capability if an unsupported value is provided', function() {
      let ret = Values.js({ os: "iOS", osVersion: "5.0", browser: "Mobile Safari", browserVersion: "5.1", device: "iPad 2" }, { captureNetwork: 123 })
      expect(ret.capabilities.record_network).to.be.undefined
    })

    it('should retain "captureNetwork" capability if provided value is supported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { captureNetwork: true })
      expect(ret.capabilities.record_network).to.equal(true)
    })

    it('should remove "orientation" capability if it does not apply to the browser provided', function() {
      let ret = Values.js({ os: "OS X", osVersion: "El Capitan", browser: "Firefox", browserVersion: "41.0", orientation: "portrait", device: null }, { })
      expect(ret.browser.deviceOrientation).to.be.undefined
    })

    it('should remove "orientation" capability if it applies to the browser provided but the value is unsupported', function() {
      let ret = Values.js({ os: "iOS", osVersion: "9.3", browser: "Mobile Safari", browserVersion: "9.0", device: "iPad Pro Simulator", resolution: "2048x2732", orientation: "abc" }, { })
      expect(ret.browser.deviceOrientation).to.be.undefined
    })

    it('should retain "orientation" capability if provided value is supported', function() {
      let ret = Values.js({ os: "iOS", osVersion: "9.3", browser: "Mobile Safari", browserVersion: "9.0", device: "iPad Pro Simulator", resolution: "2048x2732", orientation: "portrait" }, { })
      expect(ret.browser.deviceOrientation).to.equal('portrait')
    })

    it('should remove "resolution" capability if it the value is not supported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0", resolution: "abc" }, { })
      expect(ret.browser.screen_resolution).to.be.undefined
    })

    it('should retain "resolution" capability if provided value is supported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0", resolution: "1024x768" }, { })
      expect(ret.browser.screen_resolution).to.equal('1024x768')
    })

  })

  describe('selenium', function() {

    this.timeout(0)

    it('should convert "Mobile Safari" v 9.0 to "MblSafari9.0"', function() {
      let ret = Values.selenium({ os: "iOS", osVersion: "9.3", browser: "Mobile Safari", browserVersion: "9.0", device: "iPad Air 2 Simulator" }, { timeout: 120 })
      expect(ret.browser.browser_api_name).to.equal('MblSafari9.0')
    })

  })

})
