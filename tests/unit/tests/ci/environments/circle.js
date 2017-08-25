var
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should(),
  Circle = require('./../../../../../lib/ci/environments/circle').Circle

describe('in', function() {

  it('should return true if relevant env vars are set', function() {
    if(!process.env.CIRCLE_BUILD_URL) {
      process.env.CIRCLE_BUILD_URL = 1
      expect(Circle.in).to.be.true
      delete process.env.CIRCLE_BUILD_URL
    }
    else {
      expect(Circle.in).to.be.true
    }
  })

})

describe('project', function() {

  it('should return a string if relevant env vars are set', function() {
    if(!process.env.CIRCLE_PROJECT_USERNAME && !process.env.CIRCLE_PROJECT_REPONAME) {
      process.env.CIRCLE_PROJECT_USERNAME = 'a'
      process.env.CIRCLE_PROJECT_REPONAME = 'b'
      expect(Circle.project).to.equal('a/b')
      delete process.env.CIRCLE_PROJECT_USERNAME
      delete process.env.CIRCLE_PROJECT_REPONAME
    }
    else {
      expect(Circle.project).to.not.be.empty
    }
  })

})

describe('session', function() {

  it('should return a string if relevant env vars are set', function() {
    if(!process.env.CIRCLE_BUILD_NUM) {
      process.env.CIRCLE_BUILD_NUM = 4
      process.env.CIRCLE_NODE_INDEX = 1
      expect(Circle.session).to.match(/CIRCLE\-4\.1/)
      delete process.env.CIRCLE_BUILD_NUM
      delete process.env.CIRCLE_NODE_INDEX
    }
    else {
      expect(Circle.session).to.not.be.empty
    }
  })

})

describe('commit', function() {

  it('should return a string if relevant env vars are set', function() {
    if(!process.env.CIRCLE_SHA1) {
      process.env.CIRCLE_SHA1 = 'hex'
      expect(Circle.commit).to.equal('hex')
      delete process.env.CIRCLE_SHA1
    }
    else {
      expect(Circle.commit).to.not.be.empty
    }
  })

})
