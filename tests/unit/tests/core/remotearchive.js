'use strict';

var
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  fs = require('fs'),
  path = require('path'),
  nock = require('nock'),
  RemoteArchive = require('./../../../../lib/core/remotearchive').RemoteArchive,
  utils = require('./utils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

const
  HOST = 'http://www.piaxis.tech',
  URL_PATH_1 = '/sample.tar.gz',
  URL_PATH_2 = '/sample.tgz',
  URL_PATH_3 = '/sample.zip',
  URL_PATH_4 = '/sample.tar.bz2',
  FILE_PATH_1 = path.resolve(__dirname, 'sample.tar.gz'),
  FILE_PATH_2 = path.resolve(__dirname, 'sample.tgz'),
  FILE_PATH_3 = path.resolve(__dirname, 'sample.zip'),
  FILE_PATH_4 = path.resolve(__dirname, 'sample.tar.bz2'),
  EXTR_TO_1 = path.resolve(__dirname, 'dist-tar-gz'),
  EXTR_TO_2 = path.resolve(__dirname, 'dist-tgz'),
  EXTR_TO_3 = path.resolve(__dirname, 'dist-zip'),
  MAX_RETRIES = 5,
  FACTOR = 1,
  MIN_TIMEOUT = 1000

describe('RemoteArchive', function() {

  describe('exists', function() {

    it('should return a boolean value', function() {
      var remoteArchive = new RemoteArchive(HOST + URL_PATH_1, FILE_PATH_1)
      expect(remoteArchive.exists()).to.be.a('boolean')
    })

  })

  describe('remove', function() {

    this.timeout(0)

    it('should remove the locally stored binary', function() {
      var remoteArchive = new RemoteArchive(HOST + URL_PATH_1, FILE_PATH_1)
      return remoteArchive.remove()
      .then(function() {
        return fs.statAsync(remoteArchive.path)
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

    var remoteArchive = null
    this.timeout(0)

    it('should retry in case of HTTP request failures and eventually bail out once retries are exhausted', function() {
      remoteArchive = new RemoteArchive(HOST + URL_PATH_1, FILE_PATH_1, '', MAX_RETRIES, FACTOR, MIN_TIMEOUT)
      nock(HOST).get(HOST + URL_PATH_1).times(5).replyWithError('simulating request failure')
      return remoteArchive.fetch()
      .catch(err => {
        if(err && (!err.message || !err.message.match(/aborting download as max retries of downloading have failed/))) {
          utils.log.error('error: ', err)
        }
        expect(err.message).to.contain('aborting download as max retries of downloading have failed')
        expect(fs.existsSync(remoteArchive.path)).to.be.false
        nock.cleanAll()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should be able to download the binary in case of HTTP requests working', function() {
      remoteArchive = new RemoteArchive(HOST + URL_PATH_1, FILE_PATH_1, '', MAX_RETRIES, FACTOR, MIN_TIMEOUT)
      return remoteArchive.fetch()
      .then(function() {
        expect(fs.existsSync(remoteArchive.path)).to.be.true
      })
      .should.be.fulfilled
    })

    it('should not attempt downloading if the binary exists locally', function() {
      remoteArchive = new RemoteArchive(HOST + URL_PATH_1, FILE_PATH_1, '', MAX_RETRIES, FACTOR, MIN_TIMEOUT)
      var statBefore = fs.statSync(remoteArchive.path)
      return remoteArchive.fetch()
      .then(function() {
        var statAfter = fs.statSync(remoteArchive.path)
        expect(statBefore).to.not.be.null
        expect(statBefore.ctime).to.deep.equal(statAfter.ctime)
        // test remove without extracting here
        return remoteArchive.remove()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  })

  describe('extract', function() {

    var remoteArchive = null
    this.timeout(0)

    it('should fail for an unsupported archive type (currently supported: zip, tar.gz, tgz)', function() {
      remoteArchive = new RemoteArchive(HOST + URL_PATH_4, FILE_PATH_4)
      expect(()=>{remoteArchive.extract()}).to.throw('Unsupported archive ')
    })

    it('should be able to extract a tar.gz extension archive', function() {
      remoteArchive = new RemoteArchive(HOST + URL_PATH_1, FILE_PATH_1, EXTR_TO_1, MAX_RETRIES, FACTOR, MIN_TIMEOUT)
      return remoteArchive.fetch()
      .then(() => {
        return remoteArchive.extract()
      })
      .then(() => {
        var statDwnld = fs.statSync(path.resolve(EXTR_TO_1, 'index.html'))
        expect(statDwnld).to.not.be.null
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should be able to extract a tgz extension archive', function() {
      remoteArchive = new RemoteArchive(HOST + URL_PATH_2, FILE_PATH_2, EXTR_TO_2, MAX_RETRIES, FACTOR, MIN_TIMEOUT)
      return remoteArchive.fetch()
      .then(() => {
        return remoteArchive.extract()
      })
      .then(() => {
        var statDwnld = fs.statSync(path.resolve(EXTR_TO_2, 'index.html'))
        expect(statDwnld).to.not.be.null
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should be able to extract a zip extension archive', function() {
      remoteArchive = new RemoteArchive(HOST + URL_PATH_3, FILE_PATH_3, EXTR_TO_3, MAX_RETRIES, FACTOR, MIN_TIMEOUT)
      return remoteArchive.fetch()
      .then(() => {
        return remoteArchive.extract()
      })
      .then(() => {
        var statDwnld = fs.statSync(path.resolve(EXTR_TO_3, 'index.html'))
        expect(statDwnld).to.not.be.null
        return remoteArchive.remove()
      })
      .then(() => {
        expect(fs.existsSync(remoteArchive.path)).to.be.false
        expect(fs.existsSync(remoteArchive.extractTo)).to.be.false
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  })

})
