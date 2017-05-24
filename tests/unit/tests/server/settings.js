'use strict';

var
  settings = require('./../../../../bin/server/settings'),
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

  it('should return default settings in default case', function() {
    var ret = settings()
    expect(Object.keys(ret)).to.have.lengthOf(2)
    expect(ret).to.have.all.keys('port', 'host')
  })

  it('should be able to use a config file', function() {
    var configFile = 'tests/unit/samples/cbtr-server-1.json'
    var ret = settings(configFile)
    expect(ret).to.have.all.keys('port', 'host')
    expect(ret.port).to.equal(8999)
  })

  it('should be able to use default config file', function() {
    return fs.writeFileAsync(path.resolve(process.cwd(), 'cbtr.json'), '{"server":{"host":"192.168.0.1"}}')
    .then(() => {
      var ret = settings()
      expect(ret).to.have.all.keys('port', 'host')
      expect(ret.host).to.equal('192.168.0.1')
      return fs.unlinkAsync(path.resolve(process.cwd(), 'cbtr.json'))
    })
    .catch(err => {
      utils.log.warn('unexpected error', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should be able to use environment variable', function() {
    process.env.CBTR_SETTINGS = path.resolve(process.cwd(), 'tests/unit/samples/cbtr-server-1.json')
    var ret = settings()
    delete process.env.CBTR_SETTINGS
    expect(ret).to.have.all.keys('port', 'host')
    expect(ret.port).to.equal(8999)
  })

  it('should be able to ignore bad file', function() {
    var configFile = 'tests/unit/samples/bad-cbtr-1.json'
    var ret = settings(configFile)
    expect(ret).to.have.all.keys('port', 'host')
  })

})
