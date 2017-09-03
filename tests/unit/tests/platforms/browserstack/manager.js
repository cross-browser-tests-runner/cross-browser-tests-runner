'use strict';

var
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  manager = require('./../../../../../lib/platforms/browserstack/manager'),
  Manager = manager.Manager,
  BinaryVars = require('./../../../../../lib/platforms/browserstack/tunnel/binary').BinaryVars,
  Process = require('./../../../../../lib/platforms/browserstack/tunnel/process').Process,
  utils = require('./utils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('Manager', function() {

  describe('running', function() {

    var proc
    this.timeout(0)

    it('should return an empty array if there are no tunnel processes running', function() {
      return Manager.running()
      .then(procs => {
        expect(procs).to.have.lengthOf(0)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should return a non-empty array of Process objects if there are tunnel processes running', function() {
      proc = new Process()
      return proc.create(BinaryVars.path, [ ])
      .then(() => {
        return Manager.running()
      })
      .then(procs => {
        if(1 !== procs.length) {
          utils.log.warn('expected 1 tunnel process to be running')
        }
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  })

  describe('withoutId', function() {

    var proc
    this.timeout(0)

    it('should return an empty array if there are no tunnel processes running', function() {
      return Manager.withoutId()
      .then(procs => {
        expect(procs).to.have.lengthOf(0)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should return an array of Process objects pertaining to running tunnel processes without identifiers, if there are any running', function() {
      proc = new Process()
      return proc.create(BinaryVars.path, [ ])
      .then(() => {
        return Manager.withoutId()
      })
      .then(procs => {
        if(1 !== procs.length) {
          utils.log.warn('expected 1 tunnel process without identifier to be running')
        }
        return Manager.withId()
      })
      .then(procs => {
        expect(procs.length).to.equal(0)
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  })

  describe('withId', function() {

    var proc
    this.timeout(0)

    it('should return an empty array if there are no tunnel processes running', function() {
      return Manager.withId()
      .then(procs => {
        expect(procs).to.have.lengthOf(0)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should return an array of Process objects pertaining to running tunnel processes with identifiers, if there are any running', function() {
      proc = new Process()
      var proc2 = new Process()
      return proc.create(BinaryVars.path, [ '--local-identifier', 'my-test-id' ])
      .then(() => {
        return proc2.create(BinaryVars.path, [ '--local-identifier', 'my-test-id-2' ])
      })
      .then(() => {
        return Manager.withId()
      })
      .then(procs => {
        if(2 !== procs.length) {
          utils.log.warn('expected 2 tunnel processes with different identifiers to be running')
        }
        return Manager.withoutId()
      })
      .then(procs => {
        expect(procs.length).to.equal(0)
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  })

})
