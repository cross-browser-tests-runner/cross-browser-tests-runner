var
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should(),
  Circle = require('./../../../../../lib/ci/environments/circle').Circle

describe('in', function() {

  it('should return true if relevant env vars are set', function() {
    process.env.CIRCLE_BUILD_URL = 1
    expect(Circle.in).to.be.true
    delete process.env.CIRCLE_BUILD_URL
  })

})

describe('project', function() {

  it('should return a string if relevant env vars are set', function() {
    process.env.CIRCLE_PROJECT_USERNAME = 'a'
    process.env.CIRCLE_PROJECT_REPONAME = 'b'
    expect(Circle.project).to.equal('a/b')
    delete process.env.CIRCLE_PROJECT_USERNAME
    delete process.env.CIRCLE_PROJECT_REPONAME
  })

})

describe('session', function() {

  it('should return a string if relevant env vars are set', function() {
    process.env.CIRCLE_BUILD_NUM = 4
    process.env.CIRCLE_NODE_INDEX = 1
    expect(Circle.session).to.equal('CircleCI 4.1')
    delete process.env.CIRCLE_BUILD_NUM
    delete process.env.CIRCLE_NODE_INDEX
  })

})

describe('commit', function() {

  it('should return a string if relevant env vars are set', function() {
    process.env.CIRCLE_SHA1 = 'hex'
    expect(Circle.commit).to.equal('hex')
    delete process.env.CIRCLE_SHA1
  })

})
