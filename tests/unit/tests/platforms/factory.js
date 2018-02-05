'use strict';

var
  expect = require('chai').expect,
  Factory = require('./../../../../lib/platforms/factory').Factory

describe('Factory', function() {

  describe('get', function() {

    it('should throw an error for invalid platform input', function() {
      function tester() {
        Factory.get()
      }
      expect(tester).to.throw(Error)
    })

    it('should throw an error for unsupported platform input', function() {
      function tester() {
        Factory.get('xysasaf')
      }
      expect(tester).to.throw(Error)
    })

    it('should return BrowserStack platform object for "browserstack" input', function() {
      var platform = Factory.get('browserstack')
      expect(platform).to.not.be.undefined
      expect(platform).to.not.be.null
      expect(platform.constructor.name).to.equal('Platform')
    })

    it('should return SauceLabs platform object for "saucelabs" input', function() {
      var platform = Factory.get('saucelabs')
      expect(platform).to.not.be.undefined
      expect(platform).to.not.be.null
      expect(platform.constructor.name).to.equal('Platform')
    })

    it('should return CrossBrowserTesting platform object for "crossbrowsertesting" input', function() {
      var platform = Factory.get('crossbrowsertesting')
      expect(platform).to.not.be.undefined
      expect(platform).to.not.be.null
      expect(platform.constructor.name).to.equal('Platform')
    })

  })
})
