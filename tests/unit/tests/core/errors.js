'use strict';

var
  expect = require('chai').expect,
  errors = require('./../../../../lib/core/errors'),
  InputError = errors.InputError

describe('errors', function() {

  describe('InputError', function() {

    it('should work as a throw-and-catch-able Error subtype', function() {
      function tester() { throw new InputError('XYZ') }
      expect(tester).to.throw(InputError)
    })

    it('should return "InputError" as name as expected out of Error subtypes', function() {
      expect(InputError.prototype.name).to.equal('InputError')
      expect((new InputError('XYZ')).name).to.equal('InputError')
    })

  })

})
