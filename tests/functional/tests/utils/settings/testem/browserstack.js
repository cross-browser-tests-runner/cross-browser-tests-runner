var
  path = require('path'),
  Bluebird = require('bluebird'),
  fs = Bluebird.promisifyAll(require('fs')),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Process = require('./../../../../../../lib/core/process').Process,
  utils = require('./../../../testutils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('BrowserStack', function() {

  this.timeout(0)

  it('should fail for unsupported argument', function() {
    var proc = new Process()
    return proc
    .create('node', [ path.resolve(process.cwd(), 'bin/utils/settings/testem/browserstack.js'), '--unknown' ], {
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
    .create('node', [ path.resolve(process.cwd(), 'bin/utils/settings/testem/browserstack.js'), '--help' ], {
      onstdout: function(stdout) {
        expect(stdout).to.contain("browserstack.js [--help|-h] [--input|-i <cbtr-settings-file>] [--output|-o <testem-settings-file>]")
      }
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should create testem.json for an input cbtr.json', function() {
    var proc = new Process(),
      inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/browserstack/js-testing/desktop-1.yml')
    return proc.create('node', [
      path.resolve(process.cwd(), 'bin/utils/settings/cbtr.js'),
      '--input', inputFile
    ], {
      onstdout: function(stdout) {
        expect(stdout).to.contain('Created cross-browser-tests-runner settings file -')
      },
      onstderr: function(stderr) {
        utils.log.error(stderr)
      }
    })
    .then(() => {
      var outputFile = path.resolve(process.cwd(), 'cbtr.json')
      expect(fs.existsSync(outputFile)).to.be.true
      var proc2 = new Process()
      return proc2.create('node', [
        path.resolve(process.cwd(), 'bin/utils/settings/testem/browserstack.js')
      ], {
        onstdout: function(stdout) {
          if(stdout.match(/Are you using multiple tunnels with different identifiers/)) {
            proc2.proc.stdin.write('y\n')
          }
          else if(stdout.match(/Do you need to take screenshots of your tests once completed/)) {
            proc2.proc.stdin.write('y\n')
          }
          else if(stdout.match(/Do you need to take video of your test/)) {
            proc2.proc.stdin.write('y\n')
          }
          else if(stdout.match(/Please provide a timeout value/)) {
            proc2.proc.stdin.write('60\n')
          }
        }
      })
    })
    .then(() => {
      var outputFile = path.resolve(process.cwd(), 'testem.json')
      expect(fs.existsSync(outputFile)).to.be.true
      return fs.unlinkAsync(outputFile)
    })
    .then(() => {
      var outputFile = path.resolve(process.cwd(), 'cbtr.json')
      return fs.unlinkAsync(outputFile)
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

})
