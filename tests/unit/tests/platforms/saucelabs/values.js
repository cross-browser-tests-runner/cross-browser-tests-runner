'use strict';

var
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Values = require('./../../../../../lib/platforms/saucelabs/values').Values

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
      expect(()=>{Values.js({ os: "iOS", osVersion: "8.1", browser: "Mobile Safari", browserVersion: null, device: "abc" }, { })}).to.throw('invalid device "abc" for version "null" for browser "Mobile Safari" for osVersion "8.1" for os "iOS"')
    })

    it('should be able to handle null os version', function() {
      expect(()=>{Values.js({os: "Linux", osVersion: null, browser: "Chrome", browserVersion: "10.0"}, {})}).to.throw('invalid version "10.0" for browser "Chrome" for osVersion "null" for os "Linux"')
    })

    it('should populate defaults if corresponding keys are not provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { })
      expect(ret.capabilities.maxDuration).to.equal(60)
    })

    it('should use input values of keys for which defaults exist', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { timeout: 120 })
      expect(ret.capabilities.maxDuration).to.equal(120)
    })

    it('should remove "build" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { build: 120 })
      expect(ret.capabilities.build).to.be.undefined
    })

    it('should retain "build" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { build: "abc" })
      expect(ret.capabilities.build).to.equal('abc')
    })

    it('should remove "test" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { test: 120 })
      expect(ret.capabilities.name).to.be.undefined
    })

    it('should retain "test" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { test: "abc" })
      expect(ret.capabilities.name).to.equal('abc')
    })

    it('should remove "customData" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { customData: 120 })
      expect(ret.capabilities.customData).to.be.undefined
    })

    it('should retain "customData" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { customData: { key: 'value' } })
      expect(ret.capabilities.customData).to.deep.equal({key: 'value'})
    })

    it('should remove "tags" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { tags: 120 })
      expect(ret.capabilities.tags).to.be.undefined
    })

    it('should retain "tags" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { tags: [ 1, 2 ] })
      expect(ret.capabilities.tags).to.deep.equal([ 1, 2 ])
    })

    it('should remove "prerun" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { prerun: 120 })
      expect(ret.capabilities.prerun).to.be.undefined
    })

    it('should retain "prerun" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { prerun: { key: 'value' } })
      expect(ret.capabilities.prerun).to.deep.equal({key: 'value'})
    })

    it('should remove "timeout" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { timeout: false })
      expect(ret.capabilities.maxDuration).to.be.undefined
    })

    it('should retain "timeout" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { timeout: 120 })
      expect(ret.capabilities.maxDuration).to.equal(120)
    })

    it('should remove "timezone" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { timezone: 120 })
      expect(ret.capabilities.timeZone).to.be.undefined
    })

    it('should retain "timezone" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { timezone: "Kolkata" })
      expect(ret.capabilities.timeZone).to.equal('Kolkata')
    })

    it('should remove "local" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { local: 120 })
      expect(ret.capabilities.local).to.be.undefined
    })

    it('should retain "local" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { local: true })
      expect(ret.capabilities.local).to.be.true
    })

    it('should remove "localIdentifier" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { localIdentifier: 120 })
      expect(ret.capabilities.tunnelIdentifier).to.be.undefined
    })

    it('should retain "localIdentifier" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { localIdentifier: "my-local-id" })
      expect(ret.capabilities.tunnelIdentifier).to.equal('my-local-id')
    })

    it('should remove "parentTunnel" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { parentTunnel: 120 })
      expect(ret.capabilities.parentTunnel).to.be.undefined
    })

    it('should retain "parentTunnel" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { parentTunnel: "my-local-id" })
      expect(ret.capabilities.parentTunnel).to.equal('my-local-id')
    })

    it('should remove "priority" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { priority: "abc" })
      expect(ret.capabilities.priority).to.be.undefined
    })

    it('should retain "priority" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { priority: 1 })
      expect(ret.capabilities.priority).to.equal(1)
    })

    it('should remove "screenshots" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { screenshots: 120 })
      expect(ret.capabilities.recordScreenshots).to.be.undefined
    })

    it('should retain "screenshots" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { screenshots: true })
      expect(ret.capabilities.recordScreenshots).to.be.true
    })

    it('should remove "noServerFailureScreenshots" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { noServerFailureScreenshots: 120 })
      expect(ret.capabilities.webdriverRemoteQuietExceptions).to.be.undefined
    })

    it('should retain "noServerFailureScreenshots" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { noServerFailureScreenshots: true })
      expect(ret.capabilities.webdriverRemoteQuietExceptions).to.be.true
    })

    it('should remove "video" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { video: 120 })
      expect(ret.capabilities.recordVideo).to.be.undefined
    })

    it('should retain "video" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { video: false })
      expect(ret.capabilities.recordVideo).to.be.false
    })

    it('should remove "videoUploadOnPass" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { videoUploadOnPass: 120 })
      expect(ret.capabilities.videoUploadOnPass).to.be.undefined
    })

    it('should retain "videoUploadOnPass" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { videoUploadOnPass: false })
      expect(ret.capabilities.videoUploadOnPass).to.be.false
    })

    it('should remove "seleniumVersion" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { seleniumVersion: 1.0 })
      expect(ret.capabilities.seleniumVersion).to.be.undefined
    })

    it('should retain "seleniumVersion" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { seleniumVersion: "3.0.0" })
      expect(ret.capabilities.seleniumVersion).to.equal('3.0.0')
    })

    it('should remove "seleniumVersion" capability if it has a supported value but is outside restricted values', function() {
      let ret = Values.js({ os: "OS X", osVersion: "Yosemite", browser: "Safari", browserVersion: "8.0" }, { seleniumVersion: "3.0.0" })
      expect(ret.capabilities.seleniumVersion).to.be.undefined
    })

    it('should retain "seleniumVersion" capability if it has a supported value which is also one of the restricted ones', function() {
      let ret = Values.js({ os: "OS X", osVersion: "Yosemite", browser: "Safari", browserVersion: "8.0" }, { seleniumVersion: "2.37.0" })
      expect(ret.capabilities.seleniumVersion).to.equal('2.37.0')
    })

    it('should remove "appiumVersion" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Android", osVersion: "4.4", browser: "Android Browser", browserVersion: null, device: "Samsung Galaxy S4 Emulator" }, { appiumVersion: "1.0" })
      expect(ret.capabilities.appiumVersion).to.be.undefined
    })

    it('should retain "appiumVersion" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Android", osVersion: "4.4", browser: "Android Browser", browserVersion: null, device: "Samsung Galaxy S4 Emulator"}, { appiumVersion: "1.5.3" })
      expect(ret.capabilities.appiumVersion).to.equal('1.5.3')
    })

    it('should remove "ieDriver" capability if browser is not Internet Explorer', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { ieDriver: "2.21.1" })
      expect(ret.capabilities.iedriverVersion).to.be.undefined
    })

    it('should remove "ieDriver" capability if browser is Internet Explorer but value is not supported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Internet Explorer", browserVersion: "11.0" }, { ieDriver: "2.0.1" })
      expect(ret.capabilities.iedriverVersion).to.be.undefined
    })

    it('should retain "ieDriver" capability if browser is Internet Explorer', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Internet Explorer", browserVersion: "11.0" }, { ieDriver: "2.21.1" })
      expect(ret.capabilities.iedriverVersion).to.equal('2.21.1')
    })

    it('should remove "chromeDriver" capability if browser is not Chrome', function() {
      let ret = Values.js({ os: "OS X", osVersion: "Yosemite", browser: "Firefox", browserVersion: "39.0" }, { chromeDriver: "2.13" })
      expect(ret.capabilities.chromedriverVersion).to.be.undefined
    })

    it('should remove "chromeDriver" capability if browser is Chrome but value provided is unsupported', function() {
      let ret = Values.js({ os: "OS X", osVersion: "Yosemite", browser: "Chrome", browserVersion: "39.0" }, { chromeDriver: "xyz" })
      expect(ret.capabilities.chromedriverVersion).to.be.undefined
    })

    it('should retain "chromeDriver" capability if browser is Chrome and provided value is supported', function() {
      let ret = Values.js({ os: "OS X", osVersion: "Yosemite", browser: "Chrome", browserVersion: "39.0" }, { chromeDriver: "2.13" })
      expect(ret.capabilities.chromedriverVersion).to.equal("2.13")
    })

    it('should remove "deviceType" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Android", osVersion: "4.4", browser: "Android Browser", browserVersion: null, device: "Samsung Galaxy S4 Emulator", deviceType: "xyz"}, { })
      expect(ret.browser.deviceType).to.be.undefined
    })

    it('should retain "deviceType" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Android", osVersion: "4.4", browser: "Android Browser", browserVersion: null, device: "Samsung Galaxy S4 Emulator", deviceType: "tablet" }, { })
      expect(ret.browser.deviceType).to.equal('tablet')
    })

    it('should remove "orientation" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Android", osVersion: "4.4", browser: "Android Browser", browserVersion: null, device: "Samsung Galaxy S4 Emulator", orientation: "xyz"}, { })
      expect(ret.browser.deviceOrientation).to.be.undefined
    })

    it('should retain "orientation" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Android", osVersion: "4.4", browser: "Android Browser", browserVersion: null, device: "Samsung Galaxy S4 Emulator", orientation: "portrait" }, { })
      expect(ret.browser.deviceOrientation).to.equal('portrait')
    })

    it('should remove "resolution" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0", resolution: "xyz"}, { })
      expect(ret.browser.screenResolution).to.be.undefined
    })

    it('should retain "resolution" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0", resolution: "1280x1024"}, { })
      expect(ret.browser.screenResolution).to.equal('1280x1024')
    })

    it('should remove "autoAcceptAlerts" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "iOS", osVersion: "8.1", browser: "Mobile Safari", browserVersion: null, device: "iPhone 5 Simulator" }, { autoAcceptAlerts: 120 })
      expect(ret.capabilities.autoAcceptAlerts).to.be.undefined
    })

    it('should retain "autoAcceptAlerts" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "iOS", osVersion: "8.1", browser: "Mobile Safari", browserVersion: null, device: "iPhone 5 Simulator" }, { autoAcceptAlerts: false })
      expect(ret.capabilities.autoAcceptAlerts).to.be.false
    })

    it('should remove "automationEngine" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Android", osVersion: "4.4", browser: "Android Browser", browserVersion: null, device: "Samsung Galaxy S4 Emulator"}, { automationEngine: "xyz"})
      expect(ret.capabilities.automationName).to.be.undefined
    })

    it('should retain "automationEngine" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Android", osVersion: "4.4", browser: "Android Browser", browserVersion: null, device: "Samsung Galaxy S4 Emulator"},{ automationEngine: "Selendroid" })
      expect(ret.capabilities.automationName).to.equal('Selendroid')
    })

    it('should remove "captureHtml" capability if value provided is unsupported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { captureHtml: "xyz" })
      expect(ret.capabilities.captureHtml).to.be.undefined
    })

    it('should retain "captureHtml" capability if Chrome is the browser and provided value is supported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { captureHtml: true })
      expect(ret.capabilities.captureHtml).to.be.true
    })

    it('should remove "captureLogs" capability if value provided is unsupported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { captureLogs: "xyz" })
      expect(ret.capabilities.recordLogs).to.be.undefined
    })

    it('should retain "captureLogs" capability if Chrome is the browser and provided value is supported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { captureLogs: true })
      expect(ret.capabilities.recordLogs).to.be.true
    })

  })

  describe('selenium', function() {

    this.timeout(0)

    it('should convert "Android Browser" to "Browser"', function() {
      let ret = Values.selenium({ os: "Android", osVersion: "4.4", browser: "Android Browser", browserVersion: null, device: "Samsung Galaxy S4 Emulator" }, { timeout: 120 })
      expect(ret.browser.browserName).to.equal('Browser')
    })

    it('should convert "Mobile Safari" to "Safari"', function() {
      let ret = Values.selenium({ os: "iOS", osVersion: "8.1", browser: "Mobile Safari", browserVersion: null, device: "iPad 2 Simulator" }, { timeout: 120 })
      expect(ret.browser.browserName).to.equal('Safari')
    })

  })

})
