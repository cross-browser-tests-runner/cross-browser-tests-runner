'use strict';

var
  expect = require('chai').expect,
  ScriptJob = require('./../../../../../lib/platforms/interfaces/scriptjob').ScriptJob

describe('ScriptJob', function() {

  describe('create', function() {
    it('should throw an error', function() {
      var tester = function() { (new ScriptJob()).create() }
      expect(tester).to.throw(Error)
    })
  })

  describe('run', function() {
    it('should throw an error', function() {
      var tester = function() { (new ScriptJob()).run() }
      expect(tester).to.throw(Error)
    })
  })

  describe('stop', function() {
    it('should throw an error', function() {
      var tester = function() { (new ScriptJob()).stop() }
      expect(tester).to.throw(Error)
    })
  })

  describe('status', function() {
    it('should throw an error', function() {
      var tester = function() { (new ScriptJob()).status() }
      expect(tester).to.throw(Error)
    })
  })

  describe('hasScreenshotOption', function() {
    it('should throw an error', function() {
      var tester = function() { (new ScriptJob()).hasScreenshotOption() }
      expect(tester).to.throw(Error)
    })
  })

  describe('screenshot', function() {
    it('should throw an error', function() {
      var tester = function() { (new ScriptJob()).screenshot() }
      expect(tester).to.throw(Error)
    })
  })

  describe('markStatus', function() {
    it('should throw an error', function() {
      var tester = function() { (new ScriptJob()).markStatus() }
      expect(tester).to.throw(Error)
    })
  })

})
