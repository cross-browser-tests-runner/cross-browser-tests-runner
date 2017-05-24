'use strict';

var
  settings = require('./../../../../lib/core/settings'),
  Bluebird = require('bluebird'),
  fs = Bluebird.promisifyAll(require('fs')),
  path = require('path'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('get', function() {

  it('should return empty settings by default', function() {
    var ret = settings()
    expect(Object.keys(ret)).to.have.lengthOf(0)
  })

  it('should be able to use a config file', function() {
    var configFile = 'tests/unit/samples/cbtr-1.json'
    var ret = settings(configFile)
    expect(ret).to.have.all.keys('mykey', 'mykey2')
    expect(ret.mykey).to.equal(1)
    expect(ret.mykey2).to.equal('abc')
  })

  it('should be able to use default config file', function() {
    return fs.writeFileAsync(path.resolve(process.cwd(), 'cbtr.json'), '{"key1":2,"key2":"def"}')
    .then(() => {
      var ret = settings()
      expect(ret).to.have.all.keys('key1', 'key2')
      expect(ret.key1).to.equal(2)
      expect(ret.key2).to.equal('def')
      return fs.unlinkAsync(path.resolve(process.cwd(), 'cbtr.json'))
    })
    .catch(err => {
      utils.log.warn('unexpected error', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should be able to use environment variable', function() {
    process.env.CBTR_SETTINGS = path.resolve(process.cwd(), 'tests/unit/samples/cbtr-1.json')
    var ret = settings()
    delete process.env.CBTR_SETTINGS
    expect(ret).to.have.all.keys('mykey', 'mykey2')
    expect(ret.mykey).to.equal(1)
    expect(ret.mykey2).to.equal('abc')
  })

  it('should be able to ignore bad file', function() {
    var configFile = 'tests/unit/samples/bad-cbtr-1.json'
    var ret = settings(configFile)
    expect(ret).to.deep.equal({ })
  })

})
