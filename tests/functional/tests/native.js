var
  path = require('path'),
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

const TestDataWithErrors = {
  "suites": [
    {
      "description": "sum",
      "specs": [],
      "suites": [
        {
          "description": "suite 1",
          "specs": [
            {
              "description": "should return the sum of two numbers",
              "duration": 87,
              "passed": true,
              "skipped": false,
              "failures": []
            }
          ],
          "suites": [],
          "passed": 1,
          "failed": 0,
          "skipped": 0,
          "total": 1,
          "duration": 87
        },
        {
          "description": "suite 2",
          "specs": [
            {
              "description": "should treat 0 as 1",
              "duration": 5,
              "passed": false,
              "skipped": false,
              "failures": [
                {
                  "type": "expect",
                  "matcherName": "toEqual",
                  "expected": 3,
                  "actual": 2,
                  "message": "Expected 2 to equal 3.",
                  "trace": {
                    "stack": "Error: Expected 2 to equal 3.\n    at new jasmine.ExpectationResult (https://cdnjs.cloudflare.com/ajax/libs/jasmine/1.3.1/jasmine.js:114:32)\n    at matchersClass.toEqual (https://cdnjs.cloudflare.com/ajax/libs/jasmine/1.3.1/jasmine.js:1235:29)\n    at jasmine.Spec.<anonymous> (http://127.0.0.1:7982/tests/functional/code/tests/jasmine/js/test.js:9:25)\n    at jasmine.Block.execute (https://cdnjs.cloudflare.com/ajax/libs/jasmine/1.3.1/jasmine.js:1064:17)\n    at jasmine.Queue.next_ (https://cdnjs.cloudflare.com/ajax/libs/jasmine/1.3.1/jasmine.js:2096:31)\n    at jasmine.Queue.start (https://cdnjs.cloudflare.com/ajax/libs/jasmine/1.3.1/jasmine.js:2049:8)\n    at jasmine.Spec.execute (https://cdnjs.cloudflare.com/ajax/libs/jasmine/1.3.1/jasmine.js:2376:14)\n    at jasmine.Queue.next_ (https://cdnjs.cloudflare.com/ajax/libs/jasmine/1.3.1/jasmine.js:2096:31)\n    at jasmine.Queue.start (https://cdnjs.cloudflare.com/ajax/libs/jasmine/1.3.1/jasmine.js:2049:8)\n    at jasmine.Suite.execute (https://cdnjs.cloudflare.com/ajax/libs/jasmine/1.3.1/jasmine.js:2521:14)",
                    "message": "Expected 2 to equal 3."
                  }
                }
              ]
            }
          ],
          "suites": [],
          "passed": 0,
          "failed": 1,
          "skipped": 0,
          "total": 1,
          "duration": 5
        }
      ],
      "passed": 1,
      "failed": 1,
      "skipped": 0,
      "total": 2,
      "duration": 92
    },
    {
      "description": "mult",
      "specs": [],
      "suites": [
        {
          "description": "suite 1",
          "specs": [
            {
              "description": "should return the product of two numbers",
              "duration": 0,
              "passed": true,
              "skipped": false,
              "failures": []
            }
          ],
          "suites": [],
          "passed": 1,
          "failed": 0,
          "skipped": 0,
          "total": 1,
          "duration": 0
        },
        {
          "description": "suite 2",
          "specs": [
            {
              "description": "should treat 1 as 0",
              "duration": 0,
              "passed": false,
              "skipped": false,
              "failures": [
                {
                  "type": "expect",
                  "matcherName": "toEqual",
                  "expected": 0,
                  "actual": 2,
                  "message": "Expected 2 to equal 0.",
                  "trace": {
                    "stack": "Error: Expected 2 to equal 0.\n    at new jasmine.ExpectationResult (https://cdnjs.cloudflare.com/ajax/libs/jasmine/1.3.1/jasmine.js:114:32)\n    at matchersClass.toEqual (https://cdnjs.cloudflare.com/ajax/libs/jasmine/1.3.1/jasmine.js:1235:29)\n    at jasmine.Spec.<anonymous> (http://127.0.0.1:7982/tests/functional/code/tests/jasmine/js/test.js:22:26)\n    at jasmine.Block.execute (https://cdnjs.cloudflare.com/ajax/libs/jasmine/1.3.1/jasmine.js:1064:17)\n    at jasmine.Queue.next_ (https://cdnjs.cloudflare.com/ajax/libs/jasmine/1.3.1/jasmine.js:2096:31)\n    at jasmine.Queue.start (https://cdnjs.cloudflare.com/ajax/libs/jasmine/1.3.1/jasmine.js:2049:8)\n    at jasmine.Spec.execute (https://cdnjs.cloudflare.com/ajax/libs/jasmine/1.3.1/jasmine.js:2376:14)\n    at jasmine.Queue.next_ (https://cdnjs.cloudflare.com/ajax/libs/jasmine/1.3.1/jasmine.js:2096:31)\n    at jasmine.Queue.start (https://cdnjs.cloudflare.com/ajax/libs/jasmine/1.3.1/jasmine.js:2049:8)\n    at jasmine.Suite.execute (https://cdnjs.cloudflare.com/ajax/libs/jasmine/1.3.1/jasmine.js:2521:14)",
                    "message": "Expected 2 to equal 0."
                  }
                }
              ]
            }
          ],
          "suites": [],
          "passed": 0,
          "failed": 1,
          "skipped": 0,
          "total": 1,
          "duration": 0
        }
      ],
      "passed": 1,
      "failed": 1,
      "skipped": 0,
      "total": 2,
      "duration": 0
    },
    {
      "description": "always true",
      "specs": [],
      "suites": [
        {
          "description": "suite 1",
          "specs": [
            {
              "description": "should say 1 is 1",
              "duration": 0,
              "passed": true,
              "skipped": false,
              "failures": []
            }
          ],
          "suites": [],
          "passed": 1,
          "failed": 0,
          "skipped": 0,
          "total": 1,
          "duration": 0
        },
        {
          "description": "suite 2",
          "specs": [
            {
              "description": "should say 1 is not 0",
              "duration": 0,
              "passed": true,
              "skipped": false,
              "failures": []
            }
          ],
          "suites": [],
          "passed": 1,
          "failed": 0,
          "skipped": 0,
          "total": 1,
          "duration": 0
        }
      ],
      "passed": 2,
      "failed": 0,
      "skipped": 0,
      "total": 2,
      "duration": 0
    }
  ],
  "passed": 4,
  "failed": 2,
  "skipped": 0,
  "total": 6,
  "duration": 92
},
TestDataWithoutErrors = {
  "suites": [
    {
      "description": "sum",
      "specs": [
        {
          "description": "should return the sum of two numbers",
          "duration": 7,
          "passed": true,
          "skipped": false,
          "failures": []
        }
      ],
      "suites": [],
      "passed": 1,
      "failed": 0,
      "skipped": 0,
      "total": 1,
      "duration": 7
    },
    {
      "description": "mult",
      "specs": [
        {
          "description": "should return the product of two numbers",
          "duration": 0,
          "passed": true,
          "skipped": false,
          "failures": []
        }
      ],
      "suites": [],
      "passed": 1,
      "failed": 0,
      "skipped": 0,
      "total": 1,
      "duration": 0
    }
  ],
  "passed": 2,
  "failed": 0,
  "skipped": 0,
  "total": 2,
  "duration": 7
}


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

  it('should work successfully for a valid Jasmine 1.x test configuration and print failed test cases only, if "--errors-only" command line option is provided', function() {
    var proc = new Process(), out = '', confName = (process.version > 'v6' ? '1.json' : '1-no-sauce.json')
    return proc.create(
      'node',
      utils.nodeProcCoverageArgs('bin/server/server.js', [
        '--native-runner',
        '--errors-only',
        '--config',
        'tests/functional/conf/native/jasmine-1/' + confName
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

  if(process.version > 'v6') {

    it('should complete all tests specified in a Selenium test configuration', function() {
      var proc = new Process(), out = '', host = 'http://build.cross-browser-tests-runner.org:8000', askedStatus = false
      return proc.create(
        'node',
        utils.nodeProcCoverageArgs('bin/server/server.js', [
          '--native-runner',
          '--config',
          'tests/functional/conf/native/selenium/1.json'
        ]), {
        onstdout: function(stdout) {
          out += stdout
          if(!stdout.match(/=============== Coverage summary ==========/)) {
            console.log(stdout.trim())
          }
          if(!askedStatus) {
            askedStatus = true
            request(host)
            .get('/cbtr/status')
            .then(res => {
              expect(res).to.have.status(200)
              expect(res.body).to.deep.equal({ })
            })
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
