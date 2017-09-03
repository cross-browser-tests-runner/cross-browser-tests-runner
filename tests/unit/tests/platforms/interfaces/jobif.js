'use strict';

var
  expect = require('chai').expect,
  JobIF = require('./../../../../../lib/platforms/interfaces/jobif').JobIF

describe('JobIF', function() {

  describe('stop', function() {
    it('should throw an error', function() {
      var tester = function() { (new JobIF()).stop() }
      expect(tester).to.throw(Error)
    })
  })

  describe('status', function() {
    it('should throw an error', function() {
      var tester = function() { (new JobIF()).status() }
      expect(tester).to.throw(Error)
    })
  })

  describe('screenshot', function() {
    it('should throw an error', function() {
      var tester = function() { (new JobIF()).screenshot() }
      expect(tester).to.throw(Error)
    })
  })

})
