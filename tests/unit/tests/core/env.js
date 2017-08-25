const
  Env = require('./../../../../lib/core/env').Env
  chai = require('chai'),
  expect = chai.expect

describe('isWindows', function() {

  it('should be a boolean', function() {
    expect(Env.isWindows).to.be.a('boolean')
  })

  it('should detect Windows accurately', function() {
    if(!process.platform.match(/win[0-9]/)) {
      expect(Env.isWindows).to.be.false
    }
    else {
      expect(Env.isWindows).to.be.true
    }
  })

})
