var
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Process = require('./../../../lib/core/process').Process,
  utils = require('./testutils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('Server', function() {

  this.timeout(0)

  it('should print help if "--help" command line option is provided', function() {
    var proc = new Process(), out = ''
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/server/server.js', [
        '--help'
      ]), {
      onstdout: function(stdout) {
        out += stdout
      }
    })
    .then(() => {
      expect(out).to.contain('server.js [--help|-h] [--config|-c <config-file>] [--native-runner|-n] [--errors-only|-e] [--omit-traces|-o] [--error-reports-only|-E] [--omit-report-traces|-O]')
      expect(out).to.contain('Defaults:\n config              cbtr.json in project root, or CBTR_SETTINGS env var\n native-runner       false\n errors-only         false\n omit-traces         false\n error-reports-only  false\n omit-report-traces  false')
      expect(out).to.contain('Options:\n help                print this help\n config              cross-browser-tests-runner settings file\n native-runner       if the server should work as native test runner\n errors-only         (native runner only) print only the specs that failed\n omit-traces         (native runner only) print only the error message and no stack traces\n error-reports-only  (native runner only) report only the error specs from browser\n omit-report-traces  (native runner only) do not include stack traces in reports sent by browser')
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should print help if an unsupported command line option is provided', function() {
    var proc = new Process(), out = ''
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/server/server.js', [
        '--xyz'
      ]), {
      onstdout: function(stdout) {
        out += stdout
      }
    })
    .then(() => {
      expect(out).to.contain('server.js [--help|-h] [--config|-c <config-file>] [--native-runner|-n] [--errors-only|-e] [--omit-traces|-o] [--error-reports-only|-E] [--omit-report-traces|-O]')
      expect(out).to.contain('Defaults:\n config              cbtr.json in project root, or CBTR_SETTINGS env var\n native-runner       false\n errors-only         false\n omit-traces         false\n error-reports-only  false\n omit-report-traces  false')
      expect(out).to.contain('Options:\n help                print this help\n config              cross-browser-tests-runner settings file\n native-runner       if the server should work as native test runner\n errors-only         (native runner only) print only the specs that failed\n omit-traces         (native runner only) print only the error message and no stack traces\n error-reports-only  (native runner only) report only the error specs from browser\n omit-report-traces  (native runner only) do not include stack traces in reports sent by browser')
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

})
