var
  expect = require('chai').expect,
  Tunnel = require('./../../../../../lib/platforms/interfaces/tunnel').Tunnel

describe('start', function() {
  it('should throw an error', function() {
    var tester = function() { (new Tunnel()).start() }
    expect(tester).to.throw(Error)
  })
})

describe('stop', function() {
  it('should throw an error', function() {
    var tester = function() { (new Tunnel()).stop() }
    expect(tester).to.throw(Error)
  })
})

describe('status', function() {
  it('should throw an error', function() {
    var tester = function() { (new Tunnel()).status() }
    expect(tester).to.throw(Error)
  })
})

describe('check', function() {
  it('should throw an error', function() {
    var tester = function() { (new Tunnel()).check() }
    expect(tester).to.throw(Error)
  })
})

describe('fetch', function() {
  it('should throw an error', function() {
    var tester = function() { (new Tunnel()).fetch() }
    expect(tester).to.throw(Error)
  })
})

describe('remove', function() {
  it('should throw an error', function() {
    var tester = function() { (new Tunnel()).remove() }
    expect(tester).to.throw(Error)
  })
})
