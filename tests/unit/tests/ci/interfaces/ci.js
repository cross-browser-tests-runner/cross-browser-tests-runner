'use strict';

var
  expect = require('chai').expect,
  CI = require('./../../../../../lib/ci/interfaces/ci').CI

describe('in', function() {
  it('should throw an error', function() {
    var tester = function() { return CI.in }
    expect(tester).to.throw(Error)
  })
})

describe('project', function() {
  it('should throw an error', function() {
    var tester = function() { return CI.project }
    expect(tester).to.throw(Error)
  })
})

describe('session', function() {
  it('should throw an error', function() {
    var tester = function() { return CI.session }
    expect(tester).to.throw(Error)
  })
})

describe('commit', function() {
  it('should throw an error', function() {
    var tester = function() { return CI.commit }
    expect(tester).to.throw(Error)
  })
})
