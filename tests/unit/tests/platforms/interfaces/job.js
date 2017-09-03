'use strict';

var
  expect = require('chai').expect,
  Job = require('./../../../../../lib/platforms/interfaces/job').Job

describe('Job', function() {

  describe('create', function() {
    it('should throw an error', function() {
      var tester = function() { Job.create() }
      expect(tester).to.throw(Error)
    })
  })

  describe('createMultiple', function() {
    it('should throw an error', function() {
      var tester = function() { Job.createMultiple() }
      expect(tester).to.throw(Error)
    })
  })

  describe('stop', function() {
    it('should throw an error', function() {
      var tester = function() { (new Job()).stop() }
      expect(tester).to.throw(Error)
    })
  })

  describe('status', function() {
    it('should throw an error', function() {
      var tester = function() { (new Job()).status() }
      expect(tester).to.throw(Error)
    })
  })

  describe('screenshot', function() {
    it('should throw an error', function() {
      var tester = function() { (new Job()).screenshot() }
      expect(tester).to.throw(Error)
    })
  })

})
