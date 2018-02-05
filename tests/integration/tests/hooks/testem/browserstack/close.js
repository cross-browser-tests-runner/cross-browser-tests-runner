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

describe('close.js', function() {

  this.timeout(0)

  it('should fail if an unsupported command line option is provided', function() {
    var proc = new Process(), out = ''
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/hooks/testem/browserstack/close.js', [
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
      utils.nodeProcCoverageArgs('bin/hooks/testem/browserstack/close.js', [
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

  if(!Env.isWindows) {
    it('should fail to close for internal errors (simulated by removing execute permissions from tunnel binary)', function() {
      var proc = new Process(), out = '', err = ''
      return utils.safeChmod(BinaryVars.path, '0400')
      .then(() => {
        return proc.create('node',
          utils.nodeProcCoverageArgs('bin/hooks/testem/browserstack/close.js'), {
          onstdout: function(stdout) {
            out += stdout
          },
          onstderr: function(stderr) {
            utils.errorWithoutCovLines(stderr)
            err += stderr
          }
        })
      })
      .then(() => {
        return utils.safeChmod(BinaryVars.path, '0755')
      })
      .then(() => {
        expect(err).to.contain('failed to close browserstack-testem runs')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })
  }

  it('should successfully run and complete even if no runs exist', function() {
    var proc = new Process(), out = ''
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/hooks/testem/browserstack/close.js'), {
      onstdout: function(stdout) {
        out += stdout
      }
    })
    .then(() => {
      expect(out).to.contain('closed browserstack-testem runs')
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should successfully close runs and the platform once called after a test getting created', function() {
    var proc = new Process(), tried = false, build = utils.buildDetails(), out = ''
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/hooks/testem/browserstack/browser.js', [
        "--os", "Windows", "--osVersion", "XP", "--browser", "Chrome", "--browserVersion", "31.0", "--build", build.build, "--test", build.test, "--project", build.project, "http://www.piaxis.tech"
      ]), {
      onstdout: function(stdout) {
        if(!tried && stdout.match(/created test/)) {
          tried = true
          proc.stop()
        }
      }
    })
    .then(() => {
      var proc2 = new Process()
      return proc2.create('node',
        utils.nodeProcCoverageArgs('bin/hooks/testem/browserstack/close.js'), {
        onstdout: function(stdout) {
          out += stdout
        },
        onstderr: function(stderr) {
          utils.errorWithoutCovLines(stderr)
        }
      })
    })
    .then(() => {
      expect(out).to.contain('closed browserstack-testem runs')
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

})
