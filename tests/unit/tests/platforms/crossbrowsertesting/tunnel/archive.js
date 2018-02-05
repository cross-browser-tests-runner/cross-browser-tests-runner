'use strict';

var
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  fs = require('fs'),
  path = require('path'),
  nock = require('nock'),
  Env = require('./../../../../../../lib/core/env').Env,
  archive = require('./../../../../../../lib/platforms/crossbrowsertesting/tunnel/archive'),
  Archive = archive.Archive,
  ArchiveVars = archive.ArchiveVars,
  utils = require('./../utils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('Archive', function() {

  describe('exists', function() {

    var archive = new Archive()

    it('should return a boolean value', function() {
      expect(archive.exists()).to.be.a('boolean')
    })
  })

  describe('remove', function() {

    this.timeout(0)

    it('should remove the locally stored archive and extracted files', function() {
      var archive = new Archive()
      return archive.remove()
      .then(function() {
        return fs.statAsync(ArchiveVars.path)
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

    var archive = null
    this.timeout(0)

    it('should retry in case HTTP requests fail and eventually bail out once retries are exhausted', function() {
      var url = ArchiveVars.url.replace(/^.*crossbrowsertesting\.com/, '')
      nock('https://app.crossbrowsertesting.com').get(url).times(5).replyWithError('simulating request failure')
      archive = new Archive()
      return archive.fetch()
      .catch(err => {
        if(err && (!err.message || !err.message.match(/aborting download as max retries of downloading have failed/))) {
          utils.log.error('error: ', err)
        }
        expect(err.message).to.contain('aborting download as max retries of downloading have failed')
        expect(fs.existsSync(ArchiveVars.path)).to.be.false
        nock.cleanAll()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should be able to download and locally store the archive', function() {
      archive = new Archive()
      return archive.fetch()
      .then(function() {
        expect(fs.existsSync(ArchiveVars.path)).to.be.true
      })
      .should.be.fulfilled
    })

    var statBefore = null

    it('should not attempt downloading if the archive exists locally', function() {
      statBefore = fs.statSync(ArchiveVars.path)
      archive = new Archive()
      return archive.fetch()
      .then(function() {
        var statAfter = fs.statSync(ArchiveVars.path)
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

  describe('extract', function() {

    var archive = null
    this.timeout(0)

    it('should be able to extract files from the downloaded archive in specified extraction location', function() {
      archive = new Archive()
      return archive.extract()
      .then(() => {
        var stat = fs.statSync(ArchiveVars.binary)
        expect(stat).to.not.be.null
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
