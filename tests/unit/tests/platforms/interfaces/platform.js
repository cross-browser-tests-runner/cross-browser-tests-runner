var
  expect = require('chai').expect,
  Platform = require('./../../../../../lib/platforms/interfaces/platform').Platform

describe('run', function() {
  it('should throw an error', function() {
    var tester = function() { (new Platform()).run() }
    expect(tester).to.throw(Error)
  })
})

describe('runMultiple', function() {
  it('should throw an error', function() {
    var tester = function() { (new Platform()).runMultiple() }
    expect(tester).to.throw(Error)
  })
})

describe('stop', function() {
  it('should throw an error', function() {
    var tester = function() { (new Platform()).stop() }
    expect(tester).to.throw(Error)
  })
})

describe('status', function() {
  it('should throw an error', function() {
    var tester = function() { (new Platform()).status() }
    expect(tester).to.throw(Error)
  })
})

describe('browserKeys', function() {
  it('should throw an error', function() {
    var tester = function() { (new Platform()).browserKeys() }
    expect(tester).to.throw(Error)
  })
})

describe('capabilitiesKeys', function() {
  it('should throw an error', function() {
    var tester = function() { (new Platform()).capabilitiesKeys() }
    expect(tester).to.throw(Error)
  })
})

describe('required', function() {
  it('should throw an error', function() {
    var tester = function() { (new Platform()).required }
    expect(tester).to.throw(Error)
  })
})
