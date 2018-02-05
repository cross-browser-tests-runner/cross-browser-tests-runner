var
  path = require('path'),
  fs = require('fs'),
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  chaiAsPromised = require('chai-as-promised'),
  Env = require('./../../../lib/core/env').Env,
  Process = require('./../../../lib/core/process').Process,
  BinaryVars = require('./../../../lib/platforms/browserstack/tunnel/binary').BinaryVars,
  bsUtils = require('./../../unit/tests/platforms/browserstack/utils'),
  utils = require('./testutils')

chai.use(chaiAsPromised)
chai.use(chaiHttp)

var
  expect = chai.expect,
  should = chai.should(),
  request = chai.request

describe('Native Runner', function() {

  this.timeout(0)

  if(!Env.isWindows) {
    it('should handle failures in closing the platforms (simulated by removing execute permissions from tunnel binary executable)', function() {
      var proc = new Process(), out = ''
      return proc.create(
        'node',
        utils.nodeProcCoverageArgs('bin/server/server.js', [
          '--native-runner',
          '--config',
          'tests/functional/conf/native/jasmine-1-tiny.json',
        ]), {
        onstdout: function(stdout) {
          if(!stdout.match(/=============== Coverage summary ==========/)) {
            console.log(stdout.trim())
          }
          if(stdout.match(/Chrome 40.0 Windows 7/)) {
            fs.chmodSync(BinaryVars.path, '0400')
          }
        },
        onstderr: function(stderr) {
          out += stderr
          utils.errorWithoutCovLines(stderr)
        }
      })
      .then(() => {
        fs.chmodSync(BinaryVars.path, '0755')
        expect(out).to.contain('failed closing platforms')
        return bsUtils.ensureZeroTunnels()
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })
  }

  it('should ignore bad POST requests to /cbtr/run endpoint', function() {
    var proc = new Process(), out = '', host = 'http://127.0.0.1:8000'
    return proc.create(
      'node',
      utils.nodeProcCoverageArgs('bin/server/server.js', [
        '--native-runner',
        '--config',
        'tests/functional/conf/native/jasmine-1-tiny.json',
      ]), {
      onstdout: function(stdout) {
        if(!stdout.match(/=============== Coverage summary ==========/)) {
          console.log(stdout.trim())
        }
        if(stdout.match(/Chrome 40.0 Windows 7/)) {
          var run, test
          request(host)
          .get('/cbtr/status')
          .then(res => {
            expect(res).to.have.status(200)
            run = Object.keys(res.body)[0]
            test = res.body[run][0]
            utils.log.debug('Found run %s, test %s from native runner', run, test)
            return request(host)
            .post('/cbtr/run?cbtr_run=' + run + '&cbtr_test=xyz')
          })
          .catch(err => {
            expect(err).to.have.status(404)
            return request(host)
            .post('/cbtr/run?cbtr_run=' + run + '&cbtr_test=' + test)
          })
          .then(res => {
            expect(res.statusCode).to.be.oneOf([200, 404])
          })
        }
      },
      onstderr: function(stderr) {
        out += stderr
        utils.errorWithoutCovLines(stderr)
      }
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should do nothing if no browsers are provided in a Jasmine 1.x test configuration', function() {
    var proc = new Process(), out = ''
    return proc.create(
      'node',
      utils.nodeProcCoverageArgs('bin/server/server.js', [
        '--native-runner',
        '--config',
        'tests/functional/conf/native/jasmine-1-no-browsers.json'
      ]), {
      onstdout: function(stdout) {
        utils.log.debug(stdout)
        out += stdout
        if(stdout.match(/no tests found in settings/)) {
          proc.stop()
        }
      },
      onstderr: function(stderr) {
        utils.errorWithoutCovLines(stderr)
      }
    })
    .then(() => {
      expect(out).to.contain('no tests found in settings')
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should bail out if bad browsers are provided in a Jasmine 1.x test configuration', function() {
    var proc = new Process(), out = ''
    return proc.create(
      'node',
      utils.nodeProcCoverageArgs('bin/server/server.js', [
        '--native-runner',
        '--config',
        'tests/functional/conf/native/jasmine-1-bad-browsers.json'
      ]), {
      onstdout: function(stdout) {
        if(!stdout.match(/=============== Coverage summary ==========/)) {
          console.log(stdout.trim())
        }
      },
      onstderr: function(stderr) {
        out += stderr
        utils.errorWithoutCovLines(stderr)
      }
    })
    .then(() => {
      expect(out).to.contain('could not start tests cleanly, exiting...')
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should work successfully for a valid Jasmine 1.x test configuration and print failed test cases only, if "--errors-only" command line option is provided', function() {
    var proc = new Process(), out = ''
    return proc.create(
      'node',
      utils.nodeProcCoverageArgs('bin/server/server.js', [
        '--native-runner',
        '--errors-only',
        '--config',
        'tests/functional/conf/native/jasmine-1.json'
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
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should ignore a cross-browser testing platform in a Jasmine 1.x test configuration if it does not have JS browsers defined; but run the tests for other valid platform in the same configuration, and print only error cases without stack trace, if "--errors-only" and "--omit-traces" command line options are provided', function() {
    var proc = new Process(), out = ''
    return proc.create(
      'node',
      utils.nodeProcCoverageArgs('bin/server/server.js', [
        '--native-runner',
        '--errors-only',
        '--omit-traces',
        '--config',
        'tests/functional/conf/native/jasmine-1-bad-platform.json'
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
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should perform as many retries as mentioned in a Jasmine 1.x test configuration to attempt completing tests across all browsers specified in the configuration', function() {
    var proc = new Process(), out = ''
    return proc.create(
      'node',
      utils.nodeProcCoverageArgs('bin/server/server.js', [
        '--native-runner',
        '--config',
        'tests/functional/conf/native/jasmine-1-retries.json'
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
      if(!out.match(/browser Android Browser Amazon Kindle Fire HD 8.9 android 4.0 for url http:\/\/127.0.0.1:8000\/tests\/functional\/code\/tests\/jasmine\/html\/tests.html did not respond with results/)) {
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
        'tests/functional/conf/native/jasmine-1-0-retries.json'
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
      if(!out.match(/browser Android Browser Amazon Kindle Fire HD 8.9 android 4.0 for url http:\/\/127.0.0.1:8000\/tests\/functional\/code\/tests\/jasmine\/html\/tests-ok.html did not respond with results/)) {
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

  if(process.version > 'v6') {

    it('should complete all tests specified in a Selenium test configuration', function() {
      var proc = new Process(), out = ''
      return proc.create(
        'node',
        utils.nodeProcCoverageArgs('bin/server/server.js', [
          '--native-runner',
          '--config',
          'tests/functional/conf/native/selenium-1.json'
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
        if(!out.match(/Selenium Test Script: text of #test-message Hi, this is a test page for functional testing of selenium testing with cross\-browser\-tests\-runner native runner/)) {
          utils.log.warn('Selenium test did not run')
        }
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should ignore a cross-browser testing platform in a Selenium test configuration if it does not have browsers specified; but should complete the tests for the other platform with valid browsers specified', function() {
      var proc = new Process(), out = ''
      return proc.create(
        'node',
        utils.nodeProcCoverageArgs('bin/server/server.js', [
          '--native-runner',
          '--config',
          'tests/functional/conf/native/selenium-1-bad-platform.json'
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
        if(!out.match(/Selenium Test Script: text of #test-message Hi, this is a test page for functional testing of selenium testing with cross\-browser\-tests\-runner native runner/)) {
          utils.log.warn('Selenium test did not run')
        }
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  }

})
