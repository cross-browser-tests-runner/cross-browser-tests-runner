'use strict';

var
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  fs = require('fs'),
  path = require('path'),
  nock = require('nock'),
  RemoteFile = require('./../../../../lib/core/remotefile').RemoteFile,
  utils = require('./utils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

const
  HOST = 'http://www.piaxis.tech',
  URL_PATH = '/img/landing-1.jpg',
  URL = HOST + URL_PATH,
  FILE_PATH = path.resolve(__dirname, 'landing-1.jpg'),
  MAX_RETRIES = 5,
  FACTOR = 1,
  MIN_TIMEOUT = 1000

describe('RemoteFile', function() {

  describe('exists', function() {

    it('should return a boolean value', function() {
      var remoteFile = new RemoteFile(URL, FILE_PATH)
      expect(remoteFile.exists()).to.be.a('boolean')
    })
  })

  describe('remove', function() {

    this.timeout(0)

    it('should remove locally stored binary', function() {
      var remoteFile = new RemoteFile(URL, FILE_PATH)
      return remoteFile.remove()
      .then(function() {
        return fs.statAsync(remoteFile.path)
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

    var remoteFile = null
    this.timeout(0)

    it('should rety if HTTP requests fail and eventually bail out after exhausting retries', function() {
      remoteFile = new RemoteFile(URL, FILE_PATH, MAX_RETRIES, FACTOR, MIN_TIMEOUT)
      nock(HOST).get(URL_PATH).times(5).replyWithError('simulating request failure')
      return remoteFile.fetch()
      .catch(err => {
        if(err && (!err.message || !err.message.match(/aborting download as max retries of downloading have failed/))) {
          utils.log.error('error: ', err)
        }
        expect(err.message).to.contain('aborting download as max retries of downloading have failed')
        expect(fs.existsSync(remoteFile.path)).to.be.false
        nock.cleanAll()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should be able to download the binary', function() {
      remoteFile = new RemoteFile(URL, FILE_PATH, MAX_RETRIES, FACTOR, MIN_TIMEOUT)
      return remoteFile.fetch()
      .then(function() {
        expect(fs.existsSync(remoteFile.path)).to.be.true
      })
      .should.be.fulfilled
    })

    it('should not attempt downloading if the binary exists locally', function() {
      remoteFile = new RemoteFile(URL, FILE_PATH, MAX_RETRIES, FACTOR, MIN_TIMEOUT)
      var statBefore = fs.statSync(remoteFile.path)
      return remoteFile.fetch()
      .then(function() {
        var statAfter = fs.statSync(remoteFile.path)
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
