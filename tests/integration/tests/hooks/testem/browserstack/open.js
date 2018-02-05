var
  path = require('path'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Env = require('./../../../../../../lib/core/env').Env,
  Process = require('./../../../../../../lib/core/process').Process,
  BinaryVars = require('./../../../../../../lib/platforms/browserstack/tunnel/binary').BinaryVars,
  utils = require('./../../../utils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('open.js', function() {

  this.timeout(0)

  it('should fail if an unsupported command line option is provided', function() {
    var proc = new Process(), out = ''
    return proc.create(
      'node',
      utils.nodeProcCoverageArgs('bin/hooks/testem/browserstack/open.js', [
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
    return proc.create(
      'node',
      utils.nodeProcCoverageArgs('bin/hooks/testem/browserstack/open.js', [
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

  if(!Env.isWindows) {
    it('should fail for internal errors (simulated with renmaing tunnel binary)', function() {
      var proc = new Process(), err = ''
      return utils.safeChmod(BinaryVars.path, '0400')
      .then(() => {
        return proc.create(
          'node',
          utils.nodeProcCoverageArgs('bin/hooks/testem/browserstack/open.js', [
            "--local", "--localIdentifier", "testem-hooks-tunnel"
          ]), {
          onstderr: function(stderr) {
            console.error(stderr)
            err += stderr
          }
        })
      })
      .then(() => {
        return utils.safeChmod(BinaryVars.path, '0755')
      })
      .then(() => {
        if(!err.match(/{"error":"spawn EACCES"}/)) {
          utils.log.warn('Expected open to fail with spawn EACCESS')
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

  it('should work if "--local" command line option is provided', function() {
    var proc = new Process(), out = ''
    return proc.create(
      'node',
      utils.nodeProcCoverageArgs('bin/hooks/testem/browserstack/open.js', [
        "--local",
        "--localIdentifier", "testem-hooks-tunnel"
      ]), {
      onstdout: function(stdout) {
        out += stdout
      }
    })
    .then(() => {
      expect(out).to.contain('opened testem/browserstack')
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

})
