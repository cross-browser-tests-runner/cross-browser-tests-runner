var
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should(),
  Appveyor = require('./../../../../../lib/ci/environments/appveyor').Appveyor

describe('in', function() {

  it('should return true if relevant env vars are set', function() {
    if(!process.env.APPVEYOR_JOB_ID) {
      process.env.APPVEYOR_JOB_ID = 1
      expect(Appveyor.in).to.be.true
      delete process.env.APPVEYOR_JOB_ID
    }
    else {
      expect(Appveyor.in).to.be.true
    }
  })

})

describe('project', function() {

  it('should return a string if relevant env vars are set', function() {
    if(!process.env.APPVEYOR_REPO_NAME) {
      process.env.APPVEYOR_REPO_NAME = 'a/b'
      expect(Appveyor.project).to.equal('a/b')
      delete process.env.APPVEYOR_REPO_NAME
    }
    else {
      expect(Appveyor.project).to.not.be.empty
    }
  })

})

describe('session', function() {

  it('should return a string if relevant env vars are set', function() {
    if(!process.env.APPVEYOR_JOB_NUMBER && !process.env.APPVEYOR_BUILD_NUMBER) {
      process.env.APPVEYOR_BUILD_NUMBER = '4'
      process.env.APPVEYOR_JOB_NUMBER = '1'
      expect(Appveyor.session).to.match(/^APPVEYOR\-4\.1\-/)
      delete process.env.APPVEYOR_JOB_NUMBER
      delete process.env.APPVEYOR_BUILD_NUMBER
    }
    else {
      expect(Appveyor.session).to.not.be.empty
    }
  })

})

describe('commit', function() {

  it('should return a string if relevant env vars are set', function() {
    if(!process.env.APPVEYOR_REPO_COMMIT) {
      process.env.APPVEYOR_REPO_COMMIT = 'hex'
      expect(Appveyor.commit).to.equal('hex')
      delete process.env.APPVEYOR_REPO_COMMIT
    }
    else {
      expect(Appveyor.commit).to.not.be.empty
    }
  })

})
