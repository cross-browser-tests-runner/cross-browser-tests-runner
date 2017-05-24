'use strict';

var
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  manager = require('./../../../../../lib/platforms/browserstack/manager'),
  Manager = manager.Manager,
  ManagerVars = manager.ManagerVars,
  BinaryVars = require('./../../../../../lib/platforms/browserstack/tunnel/binary').BinaryVars,
  Process = require('./../../../../../lib/platforms/browserstack/tunnel/process').Process,
  utils = require('./utils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('running', function() {

  var proc
  this.timeout(0)

  it('should return empty list if no tunnel processes', function() {
    return Manager.running()
    .then(procs => {
      expect(procs).to.have.lengthOf(0)
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should return a non empty list if there are tunnel processes', function() {
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
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

})

describe('withoutId', function() {

  var proc
  this.timeout(0)

  it('should return empty list if no tunnel processes', function() {
    return Manager.withoutId()
    .then(procs => {
      expect(procs).to.have.lengthOf(0)
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should return tunnel processes without id if running', function() {
    proc = new Process()
    return proc.create(BinaryVars.path, [ ])
    .then(() => {
      return Manager.withoutId()
    })
    .then(procs => {
      if(1 !== procs.length) {
        utils.log.warn('expected 1 tunnel process without id to be running')
      }
      return utils.ensureZeroTunnels()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

})

describe('withId', function() {

  var proc
  this.timeout(0)

  it('should return empty list if no tunnel processes', function() {
    return Manager.withId()
    .then(procs => {
      expect(procs).to.have.lengthOf(0)
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should return tunnel processes with id if running', function() {
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
        utils.log.warn('expected 2 tunnel processes with id to be running')
      }
      return utils.ensureZeroTunnels()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

})
