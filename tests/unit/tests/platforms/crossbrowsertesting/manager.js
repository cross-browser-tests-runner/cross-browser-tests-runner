'use strict';

var
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  manager = require('./../../../../../lib/platforms/crossbrowsertesting/manager'),
  Manager = manager.Manager,
  BinaryVars = require('./../../../../../lib/platforms/crossbrowsertesting/tunnel/binary').BinaryVars,
  Process = require('./../../../../../lib/platforms/crossbrowsertesting/tunnel/process').Process,
  utils = require('./utils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('Manager', function() {

  describe('running', function() {

    var proc
    this.timeout(0)

    it('should return an empty array if there are no running tunnel processes', function() {
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

    it('should return a non empty array of Process objects pertaining to running tunnels', function() {
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

    it('should return an empty array if there are no running tunnel processes', function() {
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

    it('should return an array of Process objects pertaining to running tunnel processes without identifiers', function() {
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
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  })

  describe('withId', function() {

    var proc
    this.timeout(0)

    it('should throw an error', function() {
      let checker = () => {
        Manager.withId()
      }
      expect(checker).to.throw('this platform does not use identifiers for tunnels')
    })

  })

})
