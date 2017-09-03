'use strict';

var
  expect = require('chai').expect,
  options = require('./../../../../../../lib/platforms/saucelabs/tunnel/options'),
  Options = options.Options,
  OptionsVars = options.OptionsVars

describe('Options', function() {

  describe('process', function() {

    var options

    it('should fail if SauceLabs access key is in neither input nor environment', function() {
      var env_key = process.env.SAUCE_ACCESS_KEY
      function tester() {
        delete process.env.SAUCE_ACCESS_KEY
        options = new Options()
        options.process()
      }
      expect(tester).to.throw('needs SAUCE_ACCESS_KEY environment variable to be defined if "apiKey" argument is not provided')
      process.env.SAUCE_ACCESS_KEY = env_key
    })

    it('should fail if SauceLabs user name is in neither input nor environment', function() {
      var env_key = process.env.SAUCE_USERNAME
      function tester() {
        delete process.env.SAUCE_USERNAME
        options = new Options()
        options.process()
      }
      expect(tester).to.throw('needs SAUCE_USERNAME environment variable to be defined if "user" argument is not provided')
      process.env.SAUCE_USERNAME = env_key
    })

    it('its output must include "--api-key" and "--user" arguments', function() {
      options = new Options()
      var args = options.process({ })
      expect(args.indexOf('--api-key')).to.not.equal(-1)
      expect(args.indexOf('--user')).to.not.equal(-1)
    })

  })

})
