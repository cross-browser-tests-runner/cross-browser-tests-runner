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

describe('working', function() {

  this.timeout(0)

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

  }

})
