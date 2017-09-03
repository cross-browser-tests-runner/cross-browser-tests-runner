'use strict';

var
  expect = require('chai').expect,
  options = require('./../../../../../../lib/platforms/browserstack/tunnel/options'),
  Options = options.Options,
  OptionsVars = options.OptionsVars

describe('Options', function() {

  describe('process', function() {

    var options

    it('should throw error if BrowserStack access key is in neither input nor environment', function() {
      var env_key = process.env.BROWSERSTACK_ACCESS_KEY
      var log_level = process.env.LOG_LEVEL
      function tester() {
        delete process.env.BROWSERSTACK_ACCESS_KEY
        if(log_level) delete process.env.LOG_LEVEL
        options = new Options()
        options.process()
      }
      expect(tester).to.throw(Error)
      process.env.BROWSERSTACK_ACCESS_KEY = env_key
      if(log_level) process.env.LOG_LEVEL = log_level
    })

    it('its output must include "--key" argument', function() {
      options = new Options()
      var args = options.process({ })
      expect(args.indexOf('--key')).to.not.equal(-1)
    })

    it('its output must include either "--force" or "--local-identifier" argument', function() {
      options = new Options()
      var args = options.process({ })
      expect(args.indexOf('--force')).to.not.equal(-1)
      expect(args.indexOf('--local-identifier')).to.equal(-1)
      args = options.process({ localIdentifier : 'my-id' })
      expect(args.indexOf('--force')).to.equal(-1)
      expect(args.indexOf('--local-identifier')).to.not.equal(-1)
    })

    it('its output should retain "verbose" input argument', function() {
      options = new Options()
      var args = options.process({ verbose : 3})
      var idx = args.indexOf('--verbose')
      expect(idx).to.not.equal(-1)
      expect(args.indexOf('3')).to.equal(idx + 1)
    })

    it('its output should include verbose=1 if logger is created with INFO level', function() {
      var saveLevel = process.env.LOG_LEVEL || undefined
      process.env.LOG_LEVEL = 'INFO'
      options = new Options()
      var args = options.process({ })
      expect(args.indexOf('--verbose')).to.not.equal(-1)
      expect(args.indexOf('1')).to.not.equal(-1)
      delete process.env.LOG_LEVEL
      if (saveLevel) process.env.LOG_LEVEL = saveLevel
    })

    it('its output should include verbose=2 if logger is created with DEBUG level', function() {
      var saveLevel = process.env.LOG_LEVEL || undefined
      process.env.LOG_LEVEL = 'DEBUG'
      options = new Options()
      var args = options.process({ })
      expect(args.indexOf('--verbose')).to.not.equal(-1)
      expect(args.indexOf('2')).to.not.equal(-1)
      delete process.env.LOG_LEVEL
      if (saveLevel) process.env.LOG_LEVEL = saveLevel
    })

    it('its output should not include verbose parameter if logger is created with ERROR level', function() {
      var saveLevel = process.env.LOG_LEVEL || undefined
      process.env.LOG_LEVEL = 'ERROR'
      options = new Options()
      var args = options.process({ })
      expect(args.indexOf('--verbose')).to.equal(-1)
      delete process.env.LOG_LEVEL
      if (saveLevel) process.env.LOG_LEVEL = saveLevel
    })

  })

})
