'use strict';

var
  expect = require('chai').expect,
  errors = require('./../../../../lib/core/errors'),
  InputError = errors.InputError

describe('InputError', function() {

  it('should work as an Error subclass', function() {
    function tester() { throw new InputError('XYZ') }
    expect(tester).to.throw(InputError)
  })

  it('should return InputError as name', function() {
    expect(InputError.prototype.name).to.equal('InputError')
    expect((new InputError('XYZ')).name).to.equal('InputError')
  })

})
