'use strict';

var
  expect = require('chai').expect,
  Options = require('./../../../../lib/core/options').Options

const VARS = {
  allowedOptions: [
    'key',
    'only',
    'proxy',
    'localIdentifier',
    'forceProxy',
    'localProxy',
    'pacFile',
    'parallelRuns',
    'verbose',
    'logFile'
  ]
}

describe('Options', function() {

  describe('process', function() {

    var options

    it('should throw error for unexpected user input', function() {
      options = new Options(VARS.allowedOptions)
      function tester() {
        options.process({ abc : 1 })
      }
      expect(tester).to.throw('Options: unexpected user option ')
    })

    it('should work for empty input silently', function() {
      options = new Options(VARS.allowedOptions)
      var args = options.process()
      expect(args).to.deep.equal([ ])
    })

    it('should convert camelCase input parameter to hyphen-separated-lowercase parameter', function() {
      options = new Options(VARS.allowedOptions)
      var args = options.process({ localIdentifier : 'my-id'})
      expect(args.indexOf('--local-identifier')).to.not.equal(-1)
      expect(args.indexOf('localIdentifier')).to.equal(-1)
      expect(args.indexOf('--localIdentifier')).to.equal(-1)
    })

    it('should convert Object type input parameter to hyphen-separated-lowercase hierarchially', function() {
      options = new Options(VARS.allowedOptions)
      var args = options.process({ proxy : { host : '127.0.0.1', port : 2301 } })
      expect(args.indexOf('--proxy-host')).to.not.equal(-1)
      expect(args.indexOf('--proxy-port')).to.not.equal(-1)
      expect(args.indexOf('--proxy')).to.equal(-1)
      expect(args.indexOf('--host')).to.equal(-1)
      expect(args.indexOf('--port')).to.equal(-1)
    })

    it('should convert non-String type values to String type values', function() {
      options = new Options(VARS.allowedOptions)
      var args = options.process({ proxy : { host : '127.0.0.1', port : 2301 }, verbose: 3 })
      expect(args.indexOf('2301')).to.not.equal(-1)
      expect(args.indexOf('3')).to.not.equal(-1)
    })

    it('should work for Boolean type arguments', function() {
      options = new Options(VARS.allowedOptions)
      var args = options.process({ only: { version : true }, key: true, verbose: 3 })
      expect(args.length).to.equal(4)
      expect(args.indexOf('3')).to.not.equal(-1)
      expect(args.indexOf('--only-version')).to.not.equal(-1)
      expect(args.indexOf('--key')).to.not.equal(-1)
    })

  })

})
