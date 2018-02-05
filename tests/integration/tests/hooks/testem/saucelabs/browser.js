var
  path = require('path'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Process = require('./../../../../../../lib/core/process').Process,
  utils = require('./../../../utils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('browser.js', function() {

  this.timeout(0)

  it('should fail for an unsupported command line option', function() {
    var proc = new Process(), out = ''
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/hooks/testem/saucelabs/browser.js', [
        '--unknown'
      ]), {
      onstderr: function(stderr) {
        out += stderr
      }
    })
    .then(() => {
      expect(out).to.contain('Unknown option: --unknown')
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should print help if "--help" command line option is provided', function() {
    var proc = new Process(), out = ''
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/hooks/testem/saucelabs/browser.js', [
        '--help'
      ]), {
      onstdout: function(stdout) {
        out += stdout
      }
    })
    .then(() => {
      expect(out).to.contain("browser.js [--help|-h] [--config <config-file>] [--os <os>] [--osVersion <os-version>] [--browser <browser>] [--browserVersion <browser-version>] [--device <device> ] [--orientation <orientation>] [--size <size>] [--local] [--localIdentifier <identifier>] [--video] [--screenshots] [--timeout <timeout-in-sec>] [--framework <test-framework>] [--project <project>] [--test <test>] [--build <build>]")
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should fail if no command line input options are provided', function() {
    var proc = new Process(), out = ''
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/hooks/testem/saucelabs/browser.js'), {
      onstderr: function(stderr) {
        out += stderr
      }
    })
    .then(() => {
      expect(out).to.contain('failed to create test - StatusCodeError: 400')
      expect(out).to.contain('required option os missing')
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should fail if invalid command line input arguments are provided', function() {
    var proc = new Process(), out = '', tried = false
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/hooks/testem/saucelabs/browser.js', [
        "--os", "Windows", "--osVersion", "None", "--browser", "firefox", "--browserVersion", "43.0", "http://www.piaxis.tech"
      ]), {
      onstdout: function(stdout) {
        if(!tried && stdout.match(/created test/)) {
          // this happens in the cases where job creation does not actually fail
          // as the first JS test status call does not get the 'test error' response
          // in which case we create the Job and all later APIs - status, stop etc.
          // take care of such construction. here not expecting the job creation
          // blocks this test and errors the builds (not seen locally because of
          // timing differences between our network and travis' network, and also
          // started seeing this locally with a higher internet speed)
          tried = true
          proc.stop()
        }
      },
      onstderr: function(stderr) {
        if(!stderr.match(/=======================================/) &&
          !stderr.match(/Writing coverage object/) &&
          !stderr.match(/Writing coverage reports at/) &&
          !stderr.match(/=============== Coverage summary ==========/))
        {
          out += stderr
        }
      }
    })
    .then(() => {
      if(out) {
        expect(out).to.contain('failed to create test - StatusCodeError: 400')
        expect(out).to.contain('failed to create test - StatusCodeError: 400 - {"error":"Platforms.SauceLabs.Job: job could not be created due to bad input, response is {\\"completed\\":false,\\"js tests\\":[{\\"status\\":\\"test error\\",\\"platform\\":[\\"Windows None\\",\\"firefox\\",\\"43.0\\"]')
      }
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should create a test and then stop run and cleanly exit when killed', function() {
    var proc = new Process(), tried = false, build = utils.buildDetails()
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/hooks/testem/saucelabs/browser.js', [
        "--os", "Windows", "--osVersion", "10", "--browser", "firefox", "--browserVersion", "43.0", "--build", build.build, "--test", build.test, "--project", build.project, "--framework", "custom", "http://127.0.0.1:3000/tests/pages/tests.html"
      ]), {
      onstdout: function(stdout) {
        if(!tried && stdout.match(/created test/)) {
          tried = true
          proc.stop()
        }
      }
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should create a test and then stop run after taking screenshots, if required, and cleanly exit when killed', function() {
    var proc = new Process(), tried = false, build = utils.buildDetails()
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/hooks/testem/saucelabs/browser.js', [
        "--os", "Windows", "--osVersion", "10", "--browser", "firefox", "--browserVersion", "43.0", "--build", build.build, "--test", build.test, "--project", build.project, "--screenshots", "--video", "--framework", "custom", "http://127.0.0.1:3000/tests/pages/tests.html"
      ]), {
      onstdout: function(stdout) {
        if(!tried && stdout.match(/created test/)) {
          tried = true
          proc.stop()
        }
      }
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })
})
