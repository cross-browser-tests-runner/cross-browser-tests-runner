var
  expect = require('chai').expect,
  Test = require('./../../../../../lib/core/interfaces/test').Test

describe('create', function() {
  it('should throw an error', function() {
    var tester = function() { (new Test()).create() }
    expect(tester).to.throw(Error)
  })
})

describe('status', function() {
  it('should throw an error', function() {
    var tester = function() { (new Test()).status() }
    expect(tester).to.throw(Error)
  })
})

describe('stop', function() {
  it('should throw an error', function() {
    var tester = function() { (new Test()).stop() }
    expect(tester).to.throw(Error)
  })
})
