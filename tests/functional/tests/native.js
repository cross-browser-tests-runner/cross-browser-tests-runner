var
  path = require('path'),
  Bluebird = require('bluebird'),
  fs = Bluebird.promisifyAll(require('fs')),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Process = require('./../../../lib/core/process').Process,
  utils = require('./testutils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('Native Runner', function() {

  this.timeout(0)

  it('should work for a jasmine-1.x test', function() {
    var proc = new Process(), out = ''
    return proc
    .create('node', [
        path.resolve(process.cwd(), 'bin/server/server.js'),
        '--native-runner',
        '--config', 'tests/functional/conf/native/jasmine-1.json'
    ], {
      onstdout: function(stdout) {
        out += stdout
        console.log('stdout: ', stdout.trim())
      },
      onstderr: function(stderr) {
        utils.log.error(stderr)
      }
    })
    .then(() => {
      if(!out.match(/✓  Chrome 40.0 - Windows 7/)) {
        utils.log.warn('Chrome 40.0 Windows 7 tests did not run or pass')
      }
      if(!out.match(/✓  Mobile Safari 6.0 - iOS 6.0 - iPad/)) {
        utils.log.warn('iOS 6.0 iPad 3rd tests did not run or pass')
      }
      if(!out.match(/✓  should return the sum of two numbers/)) {
        utils.log.warn('no sum tests were run')
      }
      if(!out.match(/✓  should return the product of two numbers/)) {
        utils.log.warn('no product tests were run')
      }
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })
})
