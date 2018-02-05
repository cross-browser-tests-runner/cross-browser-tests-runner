var
  path = require('path'),
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  chaiAsPromised = require('chai-as-promised'),
  Env = require('./../../../../lib/core/env').Env,
  Process = require('./../../../../lib/core/process').Process,
  BinaryVars = require('./../../../../lib/platforms/browserstack/tunnel/binary').BinaryVars,
  bsUtils = require('./../../../unit/tests/platforms/browserstack/utils'),
  utils = require('./../testutils')

chai.use(chaiAsPromised)
chai.use(chaiHttp)

var
  expect = chai.expect,
  should = chai.should(),
  request = chai.request

const
  TestDataWithoutErrors = require('./test-data-without-errors.json')

describe('cases', function() {

  this.timeout(0)

  if(!Env.isWindows) {
    it('should handle failures in closing the platforms (simulated by removing execute permissions from tunnel binary executable)', function() {
      var proc = new Process(), out = ''
      return proc.create(
        'node',
        utils.nodeProcCoverageArgs('bin/server/server.js', [
          '--native-runner',
          '--config',
          'tests/functional/conf/native/jasmine-1/tiny.json',
        ]), {
        onstdout: function(stdout) {
          if(!stdout.match(/=============== Coverage summary ==========/)) {
            console.log(stdout.trim())
          }
          if(stdout.match(/Chrome 40.0 Windows 7/)) {
            utils.safeChmod(BinaryVars.path, '0400').then(() => {
              utils.log.debug('Changed mode to read-only')
            })
          }
        },
        onstderr: function(stderr) {
          out += stderr
          utils.errorWithoutCovLines(stderr)
        }
      })
      .then(() => {
        return utils.safeChmod(BinaryVars.path, '0755')
      })
      .then(() => {
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
    var proc = new Process(), out = '', host = 'http://build.cross-browser-tests-runner.org:8000', began = false
    return proc.create(
      'node',
      utils.nodeProcCoverageArgs('bin/server/server.js', [
        '--native-runner',
        '--config',
        'tests/functional/conf/native/jasmine-1/tiny.json',
      ]), {
      onstdout: function(stdout) {
        if(!stdout.match(/=============== Coverage summary ==========/)) {
          console.log(stdout.trim())
        }
        if(stdout.match(/Chrome 40.0 Windows 7/) && !began) {
          began = true
          var run, test
          request(host)
          .get('/cbtr/status')
          .then(res => {
            expect(res).to.have.status(200)
            run = Object.keys(res.body)[0]
            test = res.body[run][0]
            utils.log.debug('Found run %s, test %s from native runner', run, test)
            return request(host)
            .post('/cbtr/run?a=b')
            .send(TestDataWithoutErrors)
          })
          .catch(err => {
            expect(err).to.have.status(400)
            return request(host)
            .post('/cbtr/run?cbtr_run=&cbtr_test=')
            .send(TestDataWithoutErrors)
          })
          .catch(err => {
            expect(err).to.have.status(400)
            return request(host)
            .post('/cbtr/run?cbtr_run=' + run + '&cbtr_test=')
            .send(TestDataWithoutErrors)
          })
          .catch(err => {
            expect(err).to.have.status(400)
            return request(host)
            .post('/cbtr/run?cbtr_run=some-run&cbtr_test=' + test)
            .send(TestDataWithoutErrors)
          })
          .catch(err => {
            expect(err).to.have.status(404)
            return request(host)
            .post('/cbtr/run?cbtr_run=' + run + '&cbtr_test=some-test')
            .send(TestDataWithoutErrors)
          })
          .catch(err => {
            expect(err).to.have.status(404)
            return request(host)
            .post('/cbtr/run?cbtr_run=' + run + '&cbtr_test=' + test)
            .send(TestDataWithoutErrors)
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
        'tests/functional/conf/native/jasmine-1/no-browsers.json'
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
        'tests/functional/conf/native/jasmine-1/bad-browsers.json'
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

  if(process.version > 'v6') {
    it('should cause the "unknown run" race condition and handle it successfully and not report with "did not respond"', function() {
      var proc = new Process(), out = '', err = ''
      return proc.create(
        'node',
        utils.nodeProcCoverageArgs('bin/server/server.js', [
          '--native-runner',
          '--errors-only',
          '--config',
          'tests/functional/conf/native/jasmine-1/fast-and-slow.json'
        ]), {
        onstdout: function(stdout) {
          out += stdout
          if(!stdout.match(/=============== Coverage summary ==========/)) {
            console.log(stdout.trim())
          }
        },
        onstderr: function(stderr) {
          utils.errorWithoutCovLines(stderr)
          err += stderr
        }
      })
      .then(() => {
        expect(err).to.not.match(/Chrome 60\.0 Windows 10.*did not respond/)
        expect(out).to.not.match(/Chrome 60\.0 Windows 10.*did not respond/)
        expect(err).to.match(/Manager unknown run/)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })
  }

  it('should ignore a cross-browser testing platform in a Jasmine 1.x test configuration if it does not have JS browsers defined; but run the tests for other valid platform in the same configuration, and print only error cases without stack trace, if "--errors-only" and "--omit-traces" command line options are provided', function() {
    var proc = new Process(), out = ''
    return proc.create(
      'node',
      utils.nodeProcCoverageArgs('bin/server/server.js', [
        '--native-runner',
        '--errors-only',
        '--omit-traces',
        '--config',
        'tests/functional/conf/native/jasmine-1/bad-platform.json'
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

  if(process.version > 'v6') {

    it('should ignore a cross-browser testing platform in a Selenium test configuration if it does not have browsers specified; but should complete the tests for the other platform with valid browsers specified', function() {
      var proc = new Process(), out = ''
      return proc.create(
        'node',
        utils.nodeProcCoverageArgs('bin/server/server.js', [
          '--native-runner',
          '--config',
          'tests/functional/conf/native/selenium/bad-platform.json'
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
