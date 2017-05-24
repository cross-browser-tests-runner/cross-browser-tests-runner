var
  path = require('path'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Process = require('./../../../../../../lib/core/process').Process,
  utils = require('./../../../../../unit/tests/platforms/browserstack/utils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('open.js', function() {

  this.timeout(0)

  it('should silently run without any arguments', function() {
    var proc = new Process()
    return proc
    .create('node', [ path.resolve(process.cwd(), 'bin/hooks/testem/browserstack/open.js') ], {
      onstdout: function(stdout) {
        expect(stdout).to.contain('opened testem/browserstack')
      }
    })
    .should.be.fulfilled
  })

  it('should silently run with bad arguments', function() {
    var proc = new Process()
    return proc
    .create('node', [ path.resolve(process.cwd(), 'bin/hooks/testem/browserstack/open.js'), "--os", "Windows" ], {
      onstdout: function(stdout) {
        expect(stdout).to.contain('opened testem/browserstack')
      }
    })
    .should.be.fulfilled
  })

  it('should work for valid single capabilities', function() {
    var proc = new Process(), tried = false
    return proc
    .create('node', [ path.resolve(process.cwd(), 'bin/hooks/testem/browserstack/open.js'), "--local" ], {
      onstdout: function(stdout) {
        expect(stdout).to.contain('opened testem/browserstack')
      }
    })
    .should.be.fulfilled
  })

  it('should work for valid multiple capabilities', function() {
    var proc = new Process(), tried = false
    return proc
    .create('node', [ path.resolve(process.cwd(), 'bin/hooks/testem/browserstack/open.js'), "--local", "--localIdentifier", "my-id-1", "--localIdentifier", "my-id-2" ], {
      onstdout: function(stdout) {
        expect(stdout).to.contain('opened testem/browserstack')
      }
    })
    .then(() => {
      return utils.ensureZeroTunnels()
    })
    .should.be.fulfilled
  })

})
