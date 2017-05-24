var
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should(),
  Travis = require('./../../../../../lib/ci/environments/travis').Travis

describe('in', function() {

  it('should return true if relevant env vars are set', function() {
    process.env.TRAVIS_BUILD_ID = 1
    expect(Travis.in).to.be.true
    delete process.env.TRAVIS_BUILD_ID
  })

})

describe('project', function() {

  it('should return a string if relevant env vars are set', function() {
    process.env.TRAVIS_REPO_SLUG = 'a/b'
    expect(Travis.project).to.equal('a/b')
    delete process.env.TRAVIS_REPO_SLUG
  })

})

describe('session', function() {

  it('should return a string if relevant env vars are set', function() {
    process.env.TRAVIS_JOB_NUMBER = '4.1'
    expect(Travis.session).to.equal('Travis 4.1')
    delete process.env.TRAVIS_JOB_NUMBER
  })

})

describe('commit', function() {

  it('should return a string if relevant env vars are set', function() {
    process.env.TRAVIS_COMMIT = 'hex'
    expect(Travis.commit).to.equal('hex')
    delete process.env.TRAVIS_COMMIT
  })

})
