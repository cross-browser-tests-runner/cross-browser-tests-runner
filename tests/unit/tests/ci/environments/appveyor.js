var
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should(),
  Appveyor = require('./../../../../../lib/ci/environments/appveyor').Appveyor

describe('in', function() {

  it('should return true if relevant env vars are set', function() {
    process.env.APPVEYOR_JOB_ID = 1
    expect(Appveyor.in).to.be.true
    delete process.env.APPVEYOR_JOB_ID
  })

})

describe('project', function() {

  it('should return a string if relevant env vars are set', function() {
    process.env.APPVEYOR_PROJECT_SLUG = 'a/b'
    expect(Appveyor.project).to.equal('a/b')
    delete process.env.APPVEYOR_PROJECT_SLUG
  })

})

describe('session', function() {

  it('should return a string if relevant env vars are set', function() {
    process.env.APPVEYOR_JOB_NAME = '4.1'
    expect(Appveyor.session).to.equal('Appveyor 4.1')
    delete process.env.APPVEYOR_JOB_NAME
  })

})

describe('commit', function() {

  it('should return a string if relevant env vars are set', function() {
    process.env.APPVEYOR_REPO_COMMIT = 'hex'
    expect(Appveyor.commit).to.equal('hex')
    delete process.env.APPVEYOR_REPO_COMMIT
  })

})
