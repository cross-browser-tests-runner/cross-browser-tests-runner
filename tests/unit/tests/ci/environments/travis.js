var
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should(),
  Travis = require('./../../../../../lib/ci/environments/travis').Travis

describe('Travis', function() {

  describe('in', function() {

    it('should return true if relevant env variables are set', function() {
      if(!process.env.TRAVIS_BUILD_ID) {
        process.env.TRAVIS_BUILD_ID = 1
        expect(Travis.in).to.be.true
        delete process.env.TRAVIS_BUILD_ID
      }
      else {
        expect(Travis.in).to.be.true
      }
    })

  })

  describe('project', function() {

    it('should return a string in expected format "{username}/{repo}" if relevant env variables are set', function() {
      if(!process.env.TRAVIS_REPO_SLUG) {
        process.env.TRAVIS_REPO_SLUG = 'a/b'
        expect(Travis.project).to.equal('a/b')
        delete process.env.TRAVIS_REPO_SLUG
      }
      else {
        expect(Travis.project).to.not.be.empty
      }
    })

  })

  describe('session', function() {

    it('should return a string in expected format "TRAVIS-{build_no}-{job_no}-{uuid}" if relevant env variables are set', function() {
      if(!process.env.TRAVIS_BUILD_NUMBER && !process.env.TRAVIS_JOB_NUMBER) {
        process.env.TRAVIS_BUILD_NUMBER = '4'
        process.env.TRAVIS_JOB_NUMBER = '1'
        expect(Travis.session).to.match(/^TRAVIS\-4\.1\-/)
        delete process.env.TRAVIS_JOB_NUMBER
        delete process.env.TRAVIS_BUILD_NUMBER
      }
      else {
        expect(Travis.session).to.not.be.empty
      }
    })

  })

  describe('commit', function() {

    it('should return a commit sha1 string if relevant env variables are set', function() {
      if(!process.env.TRAVIS_COMMIT) {
        process.env.TRAVIS_COMMIT = 'hex'
        expect(Travis.commit).to.equal('hex')
        delete process.env.TRAVIS_COMMIT
      }
      else {
        expect(Travis.commit).to.not.be.empty
      }
    })

  })

})
