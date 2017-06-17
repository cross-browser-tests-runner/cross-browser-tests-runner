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

  it('should fail for unsupported argument', function() {
    var proc = new Process()
    return proc
    .create('node', [ path.resolve(process.cwd(), 'bin/hooks/testem/browserstack/close.js'), '--unknown' ], {
      onstderr: function(stderr) {
        expect(stderr).to.contain('Unknown option: --unknown')
      }
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should print help', function() {
    var proc = new Process()
    return proc
    .create('node', [ path.resolve(process.cwd(), 'bin/hooks/testem/browserstack/close.js'), '--help' ], {
      onstdout: function(stdout) {
        expect(stdout).to.contain("close.js [--help|-h] [--config|-c <config-file>]")
      }
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should successfully run whether any runs exist or not', function() {
    var proc = new Process()
    return proc
    .create('node', [ path.resolve(process.cwd(), 'bin/hooks/testem/browserstack/close.js') ], {
      onstdout: function(stdout) {
        expect(stdout).to.contain('closed browserstack-testem runs')
      }
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should successfully close runs after a test for valid arguments is created', function() {
    var proc = new Process(), tried = false
    return proc
    .create('node', [ path.resolve(process.cwd(), 'bin/hooks/testem/browserstack/browser.js'), "--os", "Windows", "--osVersion", "10", "--browser", "firefox", "--browserVersion", "43.0", "http://www.piaxis.tech" ], {
      onstdout: function(stdout) {
        if(!tried && stdout.match(/created test/)) {
          tried = true
          proc.stop()
        }
      }
    })
    .then(() => {
      proc = new Process()
      return proc
      .create('node', [ path.resolve(process.cwd(), 'bin/hooks/testem/browserstack/close.js') ], {
        onstdout: function(stdout) {
          expect(stdout).to.contain('closed browserstack-testem runs')
        }
      })
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

})
