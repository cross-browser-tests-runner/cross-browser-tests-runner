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

describe('settings', function() {

  describe('get', function() {

    it('should return empty settings by default', function() {
      var ret = settings()
      expect(Object.keys(ret)).to.have.lengthOf(0)
    })

    it('should be able to use a given input config file to read settings from', function() {
      var configFile = 'tests/unit/samples/cbtr-1.json'
      var ret = settings(configFile)
      expect(ret).to.have.all.keys('mykey', 'mykey2')
      expect(ret.mykey).to.equal(1)
      expect(ret.mykey2).to.equal('abc')
    })

    it('should be able to use default config file (cbtr.json in process cwd) to read settings from', function() {
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

    it('should be able to use value of CBTR_SETTINGS env variable as the path of config file to read', function() {
      process.env.CBTR_SETTINGS = path.resolve(process.cwd(), 'tests/unit/samples/cbtr-1.json')
      var ret = settings()
      delete process.env.CBTR_SETTINGS
      expect(ret).to.have.all.keys('mykey', 'mykey2')
      expect(ret.mykey).to.equal(1)
      expect(ret.mykey2).to.equal('abc')
    })

    it('should be able to tolerate a config file with bad syntax and return empty settings', function() {
      var configFile = 'tests/unit/samples/bad-cbtr-1.json'
      var ret = settings(configFile)
      expect(ret).to.deep.equal({ })
    })

  })

})
