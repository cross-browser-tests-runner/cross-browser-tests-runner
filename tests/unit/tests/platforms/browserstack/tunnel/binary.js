'use strict';

var
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  fs = require('fs'),
  nock = require('nock'),
  binary = require('./../../../../../../lib/platforms/browserstack/tunnel/binary'),
  Binary = binary.Binary,
  BinaryVars = binary.BinaryVars,
  utils = require('./../utils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('Binary', function() {

  describe('exists', function() {

    var binary = new Binary()

    it('should return a boolean value', function() {
      expect(binary.exists()).to.be.a('boolean')
    })
  })

  describe('remove', function() {

    this.timeout(0)

    it('should remove the locally stored exectuable binary', function() {
      var binary = new Binary()
      return binary.remove()
      .then(function() {
        return fs.statAsync(BinaryVars.path)
      })
      .catch(err => {
        if(err && (!err.code || 'ENOENT' !== err.code)) {
          utils.log.error('error: ', err)
        }
        expect(err).to.not.be.undefined
        expect(err.code).to.not.be.undefined
        expect(err.code).to.equal('ENOENT')
        expect(err.syscall).to.not.be.undefined
        expect(err.syscall).to.be.oneOf(['stat', 'unlink'])
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })
  })

  describe('fetch', function() {

    var binary = null
    this.timeout(0)

    it('should retry if HTTP requests fail and eventually bail out once retries are exhausted', function() {
      var url = BinaryVars.url.replace(/^.*amazonaws\.com/, '')
      nock('https://s3.amazonaws.com').get(url).times(5).replyWithError('simulating request failure')
      binary = new Binary()
      return binary.fetch()
      .catch(err => {
        if(err && (!err.message || !err.message.match(/aborting download as max retries of downloading have failed/))) {
          utils.log.error('error: ', err)
        }
        expect(err.message).to.contain('aborting download as max retries of downloading have failed')
        expect(fs.existsSync(BinaryVars.path)).to.be.false
        nock.cleanAll()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should be able to download the executable binary and store it locally', function() {
      binary = new Binary()
      return binary.fetch()
      .then(function() {
        expect(fs.existsSync(BinaryVars.path)).to.be.true
      })
      .should.be.fulfilled
    })

    var statBefore = null

    it('should not attempt downloading if the executable binary exists locally', function() {
      statBefore = fs.statSync(BinaryVars.path)
      binary = new Binary()
      return binary.fetch()
      .then(function() {
        var statAfter = fs.statSync(BinaryVars.path)
        expect(statBefore).to.not.be.null
        expect(statBefore.ctime).to.deep.equal(statAfter.ctime)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  })

})
