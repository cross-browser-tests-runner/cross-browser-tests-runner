var
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should(),
  Factory = require('./../../../../lib/ci/factory').Factory

describe('get', function() {

  it('should throw an error in case no ci env vars are set', function() {
    function tester() { return Factory.get() }
    expect(tester).to.throw(Error)
  })

  it('should return Travis if relevant env vars are set', function() {
    process.env.TRAVIS_BUILD_ID = 1
    expect(Factory.get().prototype.constructor.name).to.equal('Travis')
    delete process.env.TRAVIS_BUILD_ID
  })

  it('should return Circle if relevant env vars are set', function() {
    process.env.CIRCLE_BUILD_URL = 1
    expect(Factory.get().prototype.constructor.name).to.equal('Circle')
    delete process.env.CIRCLE_BUILD_URL
  })

  it('should return Appveyor if relevant env vars are set', function() {
    process.env.APPVEYOR_JOB_ID = 1
    expect(Factory.get().prototype.constructor.name).to.equal('Appveyor')
    delete process.env.APPVEYOR_JOB_ID
  })

})
