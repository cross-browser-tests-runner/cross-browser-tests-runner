'use strict';

var
  expect = require('chai').expect,
  Platform = require('./../../../../../lib/platforms/interfaces/platform').Platform

describe('open', function() {
  it('should throw an error', function() {
    var tester = function() { (new Platform()).open() }
    expect(tester).to.throw(Error)
  })
})

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

describe('close', function() {
  it('should throw an error', function() {
    var tester = function() { (new Platform()).close() }
    expect(tester).to.throw(Error)
  })
})

describe('browserKeys', function() {
  it('should throw an error', function() {
    var tester = function() { Platform.browserKeys() }
    expect(tester).to.throw(Error)
  })
})

describe('capabilitiesKeys', function() {
  it('should throw an error', function() {
    var tester = function() { Platform.capabilitiesKeys() }
    expect(tester).to.throw(Error)
  })
})

describe('required', function() {
  it('should throw an error', function() {
    var tester = function() { return Platform.required }
    expect(tester).to.throw(Error)
  })
})
