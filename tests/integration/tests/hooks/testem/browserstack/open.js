var
  path = require('path'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Process = require('./../../../../../../lib/core/process').Process,
  bsUtils = require('./../../../../../unit/tests/platforms/browserstack/utils'),
  utils = require('./../../../utils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('open.js', function() {

  this.timeout(0)

  it('should fail for unsupported argument', function() {
    var proc = new Process()
    return proc
    .create('node', [ path.resolve(process.cwd(), 'bin/hooks/testem/browserstack/open.js'), '--unknown' ], {
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
    .create('node', [ path.resolve(process.cwd(), 'bin/hooks/testem/browserstack/open.js'), '--help' ], {
      onstdout: function(stdout) {
        expect(stdout).to.contain("open.js [--help|-h] [--config <config-file>] [--local] [--localIdentifier <identifier>]")
      }
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should silently run without any arguments', function() {
    var proc = new Process()
    return proc
    .create('node', [ path.resolve(process.cwd(), 'bin/hooks/testem/browserstack/open.js') ], {
      onstdout: function(stdout) {
        expect(stdout).to.contain('opened testem/browserstack')
      }
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should work for valid single local capability', function() {
    var proc = new Process(), tried = false
    return proc
    .create('node', [ path.resolve(process.cwd(), 'bin/hooks/testem/browserstack/open.js'), "--local" ], {
      onstdout: function(stdout) {
        expect(stdout).to.contain('opened testem/browserstack')
      }
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should work for valid multiple tunnels capabilities', function() {
    var proc = new Process(), tried = false
    return proc
    .create('node', [ path.resolve(process.cwd(), 'bin/hooks/testem/browserstack/open.js'), "--local", "--localIdentifier", "my-id-1", "--localIdentifier", "my-id-2" ], {
      onstdout: function(stdout) {
        expect(stdout).to.contain('opened testem/browserstack')
      }
    })
    .then(() => {
      return bsUtils.ensureZeroTunnels()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

})
