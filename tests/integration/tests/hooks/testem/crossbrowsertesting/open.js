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

describe('open.js', function() {

  this.timeout(0)

  it('should fail if an unsupported command line option is provided', function() {
    var proc = new Process(), out = ''
    return proc
    .create('node',
      utils.nodeProcCoverageArgs('bin/hooks/testem/crossbrowsertesting/open.js', [
        '--unknown'
      ]), {
      onstderr: function(stderr) {
        out += stderr
      }
    })
    .then(() => {
      expect(out).to.contain('Unknown option: --unknown')
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should print help if "--help" command line option is provided', function() {
    var proc = new Process(), out = ''
    return proc
    .create('node',
      utils.nodeProcCoverageArgs('bin/hooks/testem/crossbrowsertesting/open.js', [
        '--help'
      ]), {
      onstdout: function(stdout) {
        out += stdout
      }
    })
    .then(() => {
      expect(out).to.contain("open.js [--help|-h] [--config <config-file>] [--local] [--localIdentifier <identifier>]")
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should silently run and complete even if no command line options are provided', function() {
    var proc = new Process(), out = ''
    return proc
    .create('node',
      utils.nodeProcCoverageArgs('bin/hooks/testem/crossbrowsertesting/open.js'), {
      onstdout: function(stdout) {
        out += stdout
      }
    })
    .then(() => {
      expect(out).to.contain('opened testem/crossbrowsertesting')
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should work if "--local" command line option is provided', function() {
    var proc = new Process(), tried = false, out = ''
    return proc
    .create('node',
      utils.nodeProcCoverageArgs('bin/hooks/testem/crossbrowsertesting/open.js', [
        "--local"
      ]), {
      onstdout: function(stdout) {
        out += stdout
      }
    })
    .then(() => {
      expect(out).to.contain('opened testem/crossbrowsertesting')
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

})
