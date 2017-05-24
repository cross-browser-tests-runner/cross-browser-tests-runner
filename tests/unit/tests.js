'use strict'

/*var Promise = require('bluebird')

Promise.config({
  warnings: false,
  longStackTraces: true,
  cancellation: false,
  monitoring: false
})*/

describe('Unit Tests', function() {

  describe('Core', function() {
    require('./tests/core')
  })

  describe('CI', function() {
    require('./tests/ci')
  })

  describe('Platforms', function() {
    require('./tests/platforms')
  })

})
