var
  expect = require('chai').expect,
  RemoteBinary = require('./../../../../../lib/core/interfaces/remotebinary').RemoteBinary

describe('exists', function() {
  it('should throw an error', function() {
    var tester = function() { (new RemoteBinary()).exists() }
    expect(tester).to.throw(Error)
  })
})

describe('fetch', function() {
  it('should throw an error', function() {
    var tester = function() { (new RemoteBinary()).fetch() }
    expect(tester).to.throw(Error)
  })
})

describe('remove', function() {
  it('should throw an error', function() {
    var tester = function() { (new RemoteBinary()).remove() }
    expect(tester).to.throw(Error)
  })
})
