'use strict';

var
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Values = require('./../../../../../lib/platforms/browserstack/values').Values

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
      expect(()=>{Values.js({ os: "iOS", osVersion: "5.0", browser: "Mobile Safari", browserVersion: null, device: "abc" }, { })}).to.throw('invalid device "abc" for version "null" for browser "Mobile Safari" for osVersion "5.0" for os "iOS"')
    })

    it('should populate defaults if corresponding keys are not provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { })
      expect(ret.capabilities.timeout).to.equal(60)
    })

    it('should use input values of keys for which defaults exist', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { timeout: 120 })
      expect(ret.capabilities.timeout).to.equal(120)
    })

    it('should convert "Windows Phone" to "winphone"', function() {
      let ret = Values.js({ os: "Windows Phone", osVersion: "8.1", browser: "IE Mobile", browserVersion: null }, { timeout: 120 })
      expect(ret.browser.os).to.equal('winphone')
    })

    it('should not convert "Android Browser"', function() {
      let ret = Values.js({ os: "Android", osVersion: "4.3", browser: "Android Browser", browserVersion: null, device: "Samsung Galaxy S4" }, { timeout: 120 })
      expect(ret.browser.browser).to.equal('Android Browser')
    })

    it('should not convert "Mobile Safari"', function() {
      let ret = Values.js({ os: "iOS", osVersion: "3.2", browser: "Mobile Safari", browserVersion: null, device: "iPad" }, { timeout: 120 })
      expect(ret.browser.browser).to.equal('Mobile Safari')
    })

    it('should remove "build" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { build: 120 })
      expect(ret.capabilities.build).to.be.undefined
    })

    it('should retain "build" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { build: "abc" })
      expect(ret.capabilities.build).to.equal('abc')
    })

    it('should remove "project" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { project: 120 })
      expect(ret.capabilities.project).to.be.undefined
    })

    it('should retain "project" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { project: "abc" })
      expect(ret.capabilities.project).to.equal('abc')
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
      expect(ret.capabilities.timeout).to.be.undefined
    })

    it('should retain "timeout" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { timeout: 60 })
      expect(ret.capabilities.timeout).to.equal(60)
    })

    it('should remove "timezone" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { timezone: 120 })
      expect(ret.capabilities['browserstack.timezone']).to.be.undefined
    })

    it('should retain "timezone" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { timezone: "abc" })
      expect(ret.capabilities['browserstack.timezone']).to.equal('abc')
    })

    it('should remove "local" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { local: 120 })
      expect(ret.capabilities['browserstack.local']).to.be.undefined
    })

    it('should retain "local" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { local: true })
      expect(ret.capabilities['browserstack.local']).to.not.be.undefined
    })

    it('should remove "localIdentifier" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { localIdentifier: 120 })
      expect(ret.capabilities['browserstack.localIdentifier']).to.be.undefined
    })

    it('should retain "localIdentifier" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { localIdentifier: "my-local-id" })
      expect(ret.capabilities['browserstack.localIdentifier']).to.not.be.undefined
    })

    it('should remove "screenshots" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { screenshots: 120 })
      expect(ret.capabilities['browserstack.debug']).to.be.undefined
    })

    it('should retain "screenshots" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { screenshots: true })
      expect(ret.capabilities['browserstack.debug']).to.not.be.undefined
    })

    it('should remove "video" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { video: 120 })
      expect(ret.capabilities['browserstack.video']).to.be.undefined
    })

    it('should retain "video" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { video: false })
      expect(ret.capabilities['browserstack.video']).to.not.be.undefined
    })

    it('should remove "isPhysicalDevice" capability if it a device but not a supported one', function() {
      let ret = Values.js({ os: "Android", osVersion: "4.3", browser: "Android Browser", browserVersion: null, device: "Samsung Galaxy S4", isPhysicalDevice: true }, { })
      expect(ret.browser.realMobile).to.be.undefined
    })

    it('should remove "isPhysicalDevice" capability if it a supported device but value provided is not supported', function() {
      let ret = Values.js({ os: "Android", osVersion: "6.0", browser: "Android Browser", browserVersion: null, device: "Samsung Galaxy S7", isPhysicalDevice: 1 }, { })
      expect(ret.browser.realMobile).to.be.undefined
    })

    it('should retain "isPhysicalDevice" capability if it a supported device and value provided is supported', function() {
      let ret = Values.js({ os: "Android", osVersion: "6.0", browser: "Android Browser", browserVersion: null, device: "Samsung Galaxy S7", isPhysicalDevice: true }, { })
      expect(ret.browser.realMobile).to.be.true
    })

    it('should remove "seleniumVersion" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { seleniumVersion: "1.0" })
      expect(ret.capabilities['browserstack.selenium_version']).to.be.undefined
    })

    it('should retain "seleniumVersion" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { seleniumVersion: "3.0.0" })
      expect(ret.capabilities['browserstack.selenium_version']).to.equal('3.0.0')
    })

    it('should remove "seleniumVersion" capability if it has a supported value but not one which is outside restricted values for OS X Snow Leopard', function() {
      let ret = Values.js({ os: "OS X", osVersion: "Snow Leopard", browser: "Safari", browserVersion: "5.1" }, { seleniumVersion: "3.0.0" })
      expect(ret.capabilities['browserstack.selenium_version']).to.be.undefined
    })

    it('should retain "seleniumVersion" capability if it has a supported value which is also one of the restricted ones for OS X Snow Leopard', function() {
      let ret = Values.js({ os: "OS X", osVersion: "Snow Leopard", browser: "Safari", browserVersion: "5.1" }, { seleniumVersion: "2.37.0" })
      expect(ret.capabilities['browserstack.selenium_version']).to.equal('2.37.0')
    })

    it('should remove "appiumVersion" capability if it has an unsupported value', function() {
      let ret = Values.js({ os: "Android", osVersion: "4.3", browser: "Android Browser", browserVersion: null, device: "Samsung Galaxy S4" }, { appiumVersion: "1.0" })
      expect(ret.capabilities['browserstack.appium_version']).to.be.undefined
    })

    it('should retain "appiumVersion" capability if a supported value is provided', function() {
      let ret = Values.js({ os: "Android", osVersion: "4.3", browser: "Android Browser", browserVersion: null, device: "Samsung Galaxy S4"}, { appiumVersion: "1.5.3" })
      expect(ret.capabilities['browserstack.appium_version']).to.equal('1.5.3')
    })

    it('should remove "appiumVersion" capability if it has a supported value but not one which is outside restricted values for iOS', function() {
      let ret = Values.js({ os: "iOS", osVersion: "3.2", browser: "Mobile Safari", browserVersion: null, device: "iPad" }, { appiumVersion: "1.5.3" })
      expect(ret.capabilities['browserstack.appium_version']).to.be.undefined
    })

    it('should retain "appiumVersion" capability if a supported value is provided which is also the restricted values for iOS', function() {
      let ret = Values.js({ os: "iOS", osVersion: "3.2", browser: "Mobile Safari", browserVersion: null, device: "iPad" }, { appiumVersion: "1.7.0" })
      expect(ret.capabilities['browserstack.appium_version']).to.equal('1.7.0')
    })

    it('should remove "captureConsole" capability if it Chrome is not the browser', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { captureConsole: "disable" })
      expect(ret.capabilities['browserstack.console']).to.be.undefined
    })

    it('should remove "captureConsole" capability if Chrome is the browser but value provided is unsupported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { captureConsole: "xyz" })
      expect(ret.capabilities['browserstack.console']).to.be.undefined
    })

    it('should retain "captureConsole" capability if Chrome is the browser and provided value is supported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { captureConsole: "disable" })
      expect(ret.capabilities['browserstack.console']).to.equal('disable')
    })

    it('should remove "captureNetwork" capability if OS is not a desktop one', function() {
      let ret = Values.js({ os: "iOS", osVersion: "3.2", browser: "Mobile Safari", browserVersion: null, device: "iPad" }, { captureNetwork: false })
      expect(ret.capabilities['browserstack.networkLogs']).to.be.undefined
    })

    it('should remove "captureNetwork" capability if OS is a desktop one but value provided is unsupported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { captureNetwork: "xyz" })
      expect(ret.capabilities['browserstack.networkLogs']).to.be.undefined
    })

    it('should retain "captureNetwork" capability if OS is a desktop one and provided value is supported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { captureNetwork: true })
      expect(ret.capabilities['browserstack.networkLogs']).to.equal(true)
    })

    it('should remove "ieNoFlash" capability if browser is not Internet Explorer', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { ieNoFlash: false })
      expect(ret.capabilities['browserstack.ie.noFlash']).to.be.undefined
    })

    it('should remove "ieNoFlash" capability if browser is Internet Explorer but value provided is unsupported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Internet Explorer", browserVersion: "11.0" }, { ieNoFlash: "xyz" })
      expect(ret.capabilities['browserstack.ie.noFlash']).to.be.undefined
    })

    it('should retain "ieNoFlash" capability if browser is Internet Explorer and provided value is supported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Internet Explorer", browserVersion: "11.0" }, { ieNoFlash: true })
      expect(ret.capabilities['browserstack.ie.noFlash']).to.equal(true)
    })

    it('should remove "iePopups" capability if browser is not Internet Explorer', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { iePopups: false })
      expect(ret.capabilities['browserstack.ie.enablePopups']).to.be.undefined
    })

    it('should remove "iePopups" capability if browser is Internet Explorer but value provided is unsupported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Internet Explorer", browserVersion: "11.0" }, { iePopups: "xyz" })
      expect(ret.capabilities['browserstack.ie.enablePopups']).to.be.undefined
    })

    it('should retain "iePopups" capability if browser is Internet Explorer and provided value is supported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Internet Explorer", browserVersion: "11.0" }, { iePopups: false })
      expect(ret.capabilities['browserstack.ie.enablePopups']).to.equal(false)
    })

    it('should remove "ieCompat" capability if browser is not Internet Explorer', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { ieCompat: 11001 })
      expect(ret.capabilities['browserstack.ie.compatibility']).to.be.undefined
    })

    it('should remove "ieCompat" capability if browser is Internet Explorer but value provided is unsupported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Internet Explorer", browserVersion: "11.0" }, { ieCompat: "xyz" })
      expect(ret.capabilities['browserstack.ie.compatibility']).to.be.undefined
    })

    it('should retain "ieCompat" capability if browser is Internet Explorer and provided value is supported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Internet Explorer", browserVersion: "11.0" }, { ieCompat: 11001 })
      expect(ret.capabilities['browserstack.ie.compatibility']).to.equal(11001)
    })

    it('should remove "ieDriver" capability if browser is not Internet Explorer', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { ieDriver: "2.21" })
      expect(ret.capabilities['browserstack.ie.driver']).to.be.undefined
    })

    it('should remove "ieDriver" capability if browser is Internet Explorer but browserVersion is not supported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Internet Explorer", browserVersion: "11.0" }, { ieDriver: "2.21" })
      expect(ret.capabilities['browserstack.ie.driver']).to.be.undefined
    })

    it('should remove "ieDriver" capability if browser is Internet Explorer, browserVersion is supported, but value provided is unsupported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Internet Explorer", browserVersion: "11.0" }, { ieDriver: "xyz" })
      expect(ret.capabilities['browserstack.ie.driver']).to.be.undefined
    })

    it('should retain "ieDriver" capability if browser is Internet Explorer, browserVersion is supported and provided value is supported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Internet Explorer", browserVersion: "11.0" }, { ieDriver: "2.46" })
      expect(ret.capabilities['browserstack.ie.driver']).to.equal("2.46")
    })

    it('should remove "edgePopups" capability if browser is not Edge', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { edgePopups: false })
      expect(ret.capabilities['browserstack.edge.enablePopups']).to.be.undefined
    })

    it('should remove "edgePopups" capability if browser is Edge but value provided is unsupported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "10", browser: "Edge", browserVersion: "14.0" }, { edgePopups: "xyz" })
      expect(ret.capabilities['browserstack.edge.enablePopups']).to.be.undefined
    })

    it('should retain "edgePopups" capability if browser is Edge and provided value is supported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "10", browser: "Edge", browserVersion: "14.0" }, { edgePopups: false })
      expect(ret.capabilities['browserstack.edge.enablePopups']).to.equal(false)
    })

    it('should remove "safariPopups" capability if browser is not Safari', function() {
      let ret = Values.js({ os: "OS X", osVersion: "Yosemite", browser: "Chrome", browserVersion: "39.0" }, { safariPopups: false })
      expect(ret.capabilities['browserstack.safari.enablePopups']).to.be.undefined
    })

    it('should remove "safariPopups" capability if browser is Safari but value provided is unsupported', function() {
      let ret = Values.js({ os: "OS X", osVersion: "Yosemite", browser: "Safari", browserVersion: "8.0" }, { safariPopups: "xyz" })
      expect(ret.capabilities['browserstack.safari.enablePopups']).to.be.undefined
    })

    it('should retain "safariPopups" capability if browser is Safari and provided value is supported', function() {
      let ret = Values.js({ os: "OS X", osVersion: "Yosemite", browser: "Safari", browserVersion: "8.0" }, { safariPopups: false })
      expect(ret.capabilities['browserstack.safari.enablePopups']).to.equal(false)
    })

    it('should remove "safariAllCookies" capability if browser is not Safari', function() {
      let ret = Values.js({ os: "OS X", osVersion: "Yosemite", browser: "Chrome", browserVersion: "39.0" }, { safariAllCookies: false })
      expect(ret.capabilities['browserstack.safari.allowAllCookies']).to.be.undefined
    })

    it('should remove "safariAllCookies" capability if browser is Safari but value provided is unsupported', function() {
      let ret = Values.js({ os: "OS X", osVersion: "Yosemite", browser: "Safari", browserVersion: "8.0" }, { safariAllCookies: "xyz" })
      expect(ret.capabilities['browserstack.safari.allowAllCookies']).to.be.undefined
    })

    it('should retain "safariAllCookies" capability if browser is Safari and provided value is supported', function() {
      let ret = Values.js({ os: "OS X", osVersion: "Yosemite", browser: "Safari", browserVersion: "8.0" }, { safariAllCookies: false })
      expect(ret.capabilities['browserstack.safari.allowAllCookies']).to.equal(false)
    })

    it('should remove "safariDriver" capability if browser is not Safari', function() {
      let ret = Values.js({ os: "OS X", osVersion: "Yosemite", browser: "Chrome", browserVersion: "39.0" }, { safariDriver: "2.45" })
      expect(ret.capabilities['browserstack.safari.driver']).to.be.undefined
    })

    it('should remove "safariDriver" capability if browser is Safari but value provided is unsupported', function() {
      let ret = Values.js({ os: "OS X", osVersion: "Yosemite", browser: "Safari", browserVersion: "8.0" }, { safariDriver: "xyz" })
      expect(ret.capabilities['browserstack.safari.driver']).to.be.undefined
    })

    it('should retain "safariDriver" capability if browser is Safari and provided value is supported', function() {
      let ret = Values.js({ os: "OS X", osVersion: "Yosemite", browser: "Safari", browserVersion: "8.0" }, { safariDriver: "2.45" })
      expect(ret.capabilities['browserstack.safari.driver']).to.equal("2.45")
    })

    it('should remove "geckoDriver" capability if browser is not Firefox', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Chrome", browserVersion: "39.0" }, { geckoDriver: "0.15.0", seleniumVersion: '3.1.0' })
      expect(ret.capabilities['browserstack.geckodriver']).to.be.undefined
    })

    it('should remove "geckoDriver" capability if seleniumVersion is not in desired range', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { geckoDriver: "0.15.0", seleniumVersion: '2.37.0' })
      expect(ret.capabilities['browserstack.geckodriver']).to.be.undefined
    })

    it('should remove "geckoDriver" capability if browser is Firefox, seleniumVersion is in desired range, but an unsupported value is provided', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { geckoDriver: "0.1.0", seleniumVersion: '3.1.0' })
      expect(ret.capabilities['browserstack.geckodriver']).to.be.undefined
    })

    it('should remove "geckoDriver" capability if browser is Firefox, seleniumVersion is in desired range, and provided value is not one of restricted', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { geckoDriver: "0.15.0", seleniumVersion: '3.1.0' })
      expect(ret.capabilities['browserstack.geckodriver']).to.be.undefined
    })

    it('should retain "geckoDriver" capability if browser is Firefox, seleniumVersion is in desired range, and provided value is one of restricted', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0" }, { geckoDriver: "0.10.0", seleniumVersion: '3.1.0' })
      expect(ret.capabilities['browserstack.geckodriver']).to.equal('0.10.0')
    })

    it('should remove "orientation" capability if value provided is unsupported', function() {
      let ret = Values.js({ os: "iOS", osVersion: "3.2", browser: "Mobile Safari", browserVersion: null, device: "iPad", orientation: "abc" }, { })
      expect(ret.browser.deviceOrientation).to.be.undefined
    })

    it('should retain "orientation" capability if provided value is supported', function() {
      let ret = Values.js({ os: "iOS", osVersion: "3.2", browser: "Mobile Safari", browserVersion: null, device: "iPad", orientation: "landscape" }, { })
      expect(ret.browser.deviceOrientation).to.equal('landscape')
    })

    it('should remove "resolution" capability if it is not a desktop OS', function() {
      let ret = Values.js({ os: "iOS", osVersion: "3.2", browser: "Mobile Safari", browserVersion: null, device: "iPad", resolution: "abc" }, { })
      expect(ret.browser.resolution).to.be.undefined
    })

    it('should remove "resolution" capability if it is a desktop OS but the value is not supported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0", resolution: "abc" }, { })
      expect(ret.browser.resolution).to.be.undefined
    })

    it('should retain "resolution" capability if it is a desktop os and provided value is supported', function() {
      let ret = Values.js({ os: "Windows", osVersion: "8.1", browser: "Firefox", browserVersion: "39.0", resolution: "1024x768" }, { })
      expect(ret.browser.resolution).to.equal('1024x768')
    })

  })

  describe('selenium', function() {

    this.timeout(0)

    it('should convert "Android Browser" to "android"', function() {
      let ret = Values.selenium({ os: "Android", osVersion: "4.3", browser: "Android Browser", browserVersion: null, device: "Samsung Galaxy S4" }, { timeout: 120 })
      expect(ret.browser.browserName).to.equal('android')
    })

    it('should convert "Mobile Safari" to ipad if a supported ipad device is provided', function() {
      let ret = Values.selenium({ os: "iOS", osVersion: "5.0", browser: "Mobile Safari", browserVersion: null, device: "iPad 2 (5.0)" }, { timeout: 120 })
      expect(ret.browser.browserName).to.equal('ipad')
    })

    it('should convert "Mobile Safari" to iphone if a supported iphone device is provided', function() {
      let ret = Values.selenium({ os: "iOS", osVersion: "5.1", browser: "Mobile Safari", browserVersion: null, device: "iPhone 4S" }, { timeout: 120 })
      expect(ret.browser.browserName).to.equal('iphone')
    })

  })

})
