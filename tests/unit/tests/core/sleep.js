const
  sleep = require('./../../../../lib/core/sleep')
  chai = require('chai'),
  expect = chai.expect

describe('sleep', function() {

  describe('msleep', function() {

    it('should sleep for 20ms', function() {
      const b = (new Date().getTime())
      sleep.msleep(20)
      const c = (new Date()).getTime()
      expect(c - b).to.be.at.least(20)
    })

    it('should sleep for 500ms', function() {
      const b = (new Date().getTime())
      sleep.msleep(500)
      const c = (new Date()).getTime()
      expect(c - b).to.be.at.least(500)
    })

    it('should sleep for 1000ms', function() {
      const b = (new Date().getTime())
      sleep.msleep(1000)
      const c = (new Date()).getTime()
      expect(c - b).to.be.at.least(1000)
    })

    it('should sleep for 3000ms', function() {
      const b = (new Date().getTime())
      sleep.msleep(3000)
      const c = (new Date()).getTime()
      expect(c - b).to.be.at.least(3000)
    })

  })

  describe('sleep', function() {

    it('should sleep for 1s', function() {
      const b = (new Date().getTime())
      sleep.sleep(1)
      const c = (new Date()).getTime()
      expect(c - b).to.be.at.least(1000)
    })

    it('should sleep for 2s', function() {
      const b = (new Date().getTime())
      sleep.sleep(2)
      const c = (new Date()).getTime()
      expect(c - b).to.be.at.least(2000)
    })

    it('should sleep for 4s', function() {
      const b = (new Date().getTime())
      sleep.msleep(4000)
      const c = (new Date()).getTime()
      expect(c - b).to.be.at.least(4000)
    })

  })

})
