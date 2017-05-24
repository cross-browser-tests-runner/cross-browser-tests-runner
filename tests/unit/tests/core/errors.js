'use strict';

var
  errors = require('./../../../../lib/core/errors'),
  expect = require('chai').expect

describe('InternalError', function() {

  it('should work as an Error subclass', function() {
    function tester() { throw new errors.InternalError('XYZ') }
    expect(tester).to.throw(Error)
  })

})
