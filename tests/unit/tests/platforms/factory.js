'use strict';

var
  expect = require('chai').expect,
  Factory = require('./../../../../lib/platforms/factory').Factory

describe('get', function() {

  it('should throw an error for invalid input', function() {
    function tester() {
      Factory.get()
    }
    expect(tester).to.throw(Error)
  })

  it('should throw an error for unsupported platform', function() {
    function tester() {
      Factory.get('xysasaf')
    }
    expect(tester).to.throw(Error)
  })

  it('should return BrowserStack platform object', function() {
    var platform = Factory.get('browserstack')
    expect(platform).to.not.be.undefined
    expect(platform).to.not.be.null
    expect(platform.constructor.name).to.equal('Platform')
  })

})
