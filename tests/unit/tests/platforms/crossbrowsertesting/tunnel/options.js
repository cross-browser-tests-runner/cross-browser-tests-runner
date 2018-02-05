'use strict';

var
  expect = require('chai').expect,
  options = require('./../../../../../../lib/platforms/crossbrowsertesting/tunnel/options'),
  Options = options.Options,
  OptionsVars = options.OptionsVars

describe('Options', function() {

  describe('process', function() {

    var options

    it('should fail if CrossBrowserTesting access key is in neither input nor environment', function() {
      var env_key = process.env.CROSSBROWSERTESTING_ACCESS_KEY
      function tester() {
        delete process.env.CROSSBROWSERTESTING_ACCESS_KEY
        options = new Options()
        options.process()
      }
      expect(tester).to.throw('needs CROSSBROWSERTESTING_ACCESS_KEY environment variable to be defined if "authkey" argument is not provided')
      process.env.CROSSBROWSERTESTING_ACCESS_KEY = env_key
    })

    it('should fail if CrossBrowserTesting user name is in neither input nor environment', function() {
      var env_key = process.env.CROSSBROWSERTESTING_USERNAME
      function tester() {
        delete process.env.CROSSBROWSERTESTING_USERNAME
        options = new Options()
        options.process()
      }
      expect(tester).to.throw('needs CROSSBROWSERTESTING_USERNAME environment variable to be defined if "username" argument is not provided')
      process.env.CROSSBROWSERTESTING_USERNAME = env_key
    })

    it('its output must include "--authkey" and "--username" arguments', function() {
      options = new Options()
      var args = options.process({ })
      expect(args.indexOf('--authkey')).to.not.equal(-1)
      expect(args.indexOf('--username')).to.not.equal(-1)
    })

    it('should process "--verbose" argument', function() {
      options = new Options()
      var args = options.process({verbose: true})
      expect(args.indexOf('--verbose')).to.not.equal(-1)
      expect(args.length).to.equal(5)
    })

  })

})
