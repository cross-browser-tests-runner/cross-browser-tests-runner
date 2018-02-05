var
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  chaiAsPromised = require('chai-as-promised'),
  Process = require('./../../../../lib/core/process').Process,
  utils = require('./../testutils')

chai.use(chaiAsPromised)
chai.use(chaiHttp)

var
  expect = chai.expect,
  should = chai.should(),
  request = chai.request

describe('retries', function() {

  this.timeout(0)

  if(process.version > 'v6') {

    it('should retry a job that failed due to platform errors for a supported browser/platform configuration', function() {
      var proc = new Process(), out = ''
      return proc.create(
        'node',
        utils.nodeProcCoverageArgs('bin/server/server.js', [
          '--native-runner',
          '--config',
          'tests/functional/conf/native/jasmine-1/error-from-platform.json'
        ]), {
        onstdout: function(stdout) {
          if(!stdout.match(/=============== Coverage summary ==========/)) {
            console.log(stdout.trim())
            out += stdout
          }
        },
        onstderr: function(stderr) {
          out += stderr
          utils.errorWithoutCovLines(stderr)
        }
      })
      .then(() => {
        expect(out).to.contain('UnsupportedOperationError: The requested combination of browser, version and OS is currently unsupported in this version of Selenium (WebDriver): "Browser 7.0."')
        expect(out).to.contain('run of tests was unsuccessful')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  }

  it('should perform as many retries as mentioned in a Jasmine 1.x test configuration to attempt completing tests across all browsers specified in the configuration', function() {
    var proc = new Process(), out = ''
    return proc.create(
      'node',
      utils.nodeProcCoverageArgs('bin/server/server.js', [
        '--native-runner',
        '--config',
        'tests/functional/conf/native/jasmine-1/retries.json'
      ]), {
      onstdout: function(stdout) {
        out += stdout
        if(!stdout.match(/=============== Coverage summary ==========/)) {
          console.log(stdout.trim())
        }
      },
      onstderr: function(stderr) {
        utils.errorWithoutCovLines(stderr)
      }
    })
    .then(() => {
      if(!out.match(/✓.*should return the sum of two numbers/)) {
        utils.log.warn('no sum tests were run')
      }
      if(!out.match(/✓.*should return the product of two numbers/)) {
        utils.log.warn('no product tests were run')
      }
      if(!out.match(/browser Android Browser Amazon Kindle Fire HD 8.9 Android 4.0 for url http:\/\/build\.cross\-browser\-tests\-runner\.org:8000\/tests\/functional\/code\/tests\/jasmine\/html\/tests.html did not respond with results/)) {
        utils.log.warn('expected Android device to not respond and time out')
      }
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should not perform any retries for failed tests if the Jasmine 1.x test configuration specifies 0 retries, and complete the test run with just one try of each test whether it works or not', function() {
    var proc = new Process(), out = ''
    return proc.create(
      'node',
      utils.nodeProcCoverageArgs('bin/server/server.js', [
        '--native-runner',
        '--config',
        'tests/functional/conf/native/jasmine-1/0-retries.json'
      ]), {
      onstdout: function(stdout) {
        out += stdout
        if(!stdout.match(/=============== Coverage summary ==========/)) {
          console.log(stdout.trim())
        }
      },
      onstderr: function(stderr) {
        utils.errorWithoutCovLines(stderr)
      }
    })
    .then(() => {
      if(!out.match(/✓.*should return the sum of two numbers/)) {
        utils.log.warn('no sum tests were run')
      }
      if(!out.match(/✓.*should return the product of two numbers/)) {
        utils.log.warn('no product tests were run')
      }
      if(!out.match(/browser Android Browser Amazon Kindle Fire HD 8.9 Android 4.0 for url http:\/\/build\.cross\-browser\-tests\-runner\.org:8000\/tests\/functional\/code\/tests\/jasmine\/html\/tests-ok.html did not respond with results/)) {
        utils.log.warn('expected Android device to not respond and time out')
      }
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

})
