const
  Env = require('./../../../../lib/core/env').Env
  chai = require('chai'),
  expect = chai.expect

describe('Env', function() {

  describe('isWindows', function() {

    it('should be a boolean value', function() {
      expect(Env.isWindows).to.be.a('boolean')
    })

    it('should represent being on or off Windows accurately', function() {
      if(!process.platform.match(/win[0-9]/)) {
        expect(Env.isWindows).to.be.false
      }
      else {
        expect(Env.isWindows).to.be.true
      }
    })

  })

  describe('platform', function() {

    it('should equal "windows" if on Windows', function() {
      if(process.platform.match(/win[0-9]/)) {
        expect(Env.platform).to.equal('windows')
      }
      else {
        expect(Env.platform).not.to.equal('windows')
      }
    })

    it('should equal "linux" if on Linux', function() {
      if(process.platform.match(/linux/)) {
        expect(Env.platform).to.equal('linux')
      }
      else {
        expect(Env.platform).not.to.equal('linux')
      }
    })

    it('should equal "osx" if on Mac OSX', function() {
      if(process.platform.match(/darwin/)) {
        expect(Env.platform).to.equal('osx')
      }
      else {
        expect(Env.platform).not.to.equal('osx')
      }
    })

  })

  describe('arch', function() {

    it('should equal "64" if on a 64-bit platform', function() {
      if(process.arch.match(/64/)) {
        expect(Env.arch).to.equal('64')
      }
      else {
        expect(Env.arch).to.equal('32')
      }
    })

    it('should equal "32" if on a 32-bit platform', function() {
      if(!process.arch.match(/64/)) {
        expect(Env.arch).to.equal('32')
      }
      else {
        expect(Env.arch).to.equal('64')
      }
    })

  })

})
