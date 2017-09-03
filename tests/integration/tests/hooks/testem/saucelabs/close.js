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

describe('close.js', function() {

  this.timeout(0)

  it('should fail if an unsupported command line option is provided', function() {
    var proc = new Process(), out = ''
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/hooks/testem/saucelabs/close.js', [
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
      utils.nodeProcCoverageArgs('bin/hooks/testem/saucelabs/close.js', [
        '--help'
      ]), {
      onstdout: function(stdout) {
        out += stdout
      }
    })
    .then(() => {
      expect(out).to.contain("close.js [--help|-h] [--config|-c <config-file>]")
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should silently complete and return even if no runs exist yet', function() {
    var proc = new Process(), out = ''
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/hooks/testem/saucelabs/close.js'), {
      onstdout: function(stdout) {
        out += stdout
      }
    })
    .then(() => {
      expect(out).to.contain('closed saucelabs-testem runs')
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should close the runs and platforms once called after a test getting created successfully', function() {
    var proc = new Process(), tried = false, build = utils.buildDetails(), out = ''
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/hooks/testem/saucelabs/browser.js', [
        "--os", "Windows", "--osVersion", "10", "--browser", "firefox", "--browserVersion", "43.0", "--build", build.build, "--test", build.test, "--project", build.project, "http://www.piaxis.tech"
      ]), {
      onstdout: function(stdout) {
        if(!tried && stdout.match(/created test/)) {
          tried = true
          proc.stop()
        }
      }
    })
    .then(() => {
      proc = new Process()
      return proc.create('node',
        utils.nodeProcCoverageArgs('bin/hooks/testem/saucelabs/close.js'), {
        onstdout: function(stdout) {
          out += stdout
        }
      })
    })
    .then(() => {
      expect(out).to.contain('closed saucelabs-testem runs')
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

})
