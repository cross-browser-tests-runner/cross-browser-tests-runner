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
      expect(out).to.contain('required option browser missing')
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
        "--os", "Windows", "--osVersion", "None", "--browser", "Firefox", "--browserVersion", "43.0", "http://www.piaxis.tech"
      ]), {
      onstdout: function(stdout) {
        // do nothing
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
        expect(out).to.contain('invalid osVersion \\"None\\" for os \\"Windows\\"')
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

    it('should create a test and then stop run and cleanly exit when killed', function() {
      var proc = new Process(), tried = false, build = utils.buildDetails()
      return proc.create('node',
        utils.nodeProcCoverageArgs('bin/hooks/testem/saucelabs/browser.js', [
          "--os", "OS X", "--osVersion", "Sierra", "--browser", "Chrome", "--browserVersion", "52.0", "--build", build.build, "--test", build.test, "--project", build.project, "http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html"
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
          "--os", "Windows", "--osVersion", "7", "--browser", "Firefox", "--browserVersion", "37.0", "--build", build.build, "--test", build.test, "--project", build.project, "--screenshots", "--video", "http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html"
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

  }

})
