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

  it('should fail if an unknown command line option is provided', function() {
    var proc = new Process(), out = ''
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/utils/settings/testem/browserstack.js', ['--unknown']), {
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
      utils.nodeProcCoverageArgs('bin/utils/settings/testem/browserstack.js', ['--help']), {
      onstdout: function(stdout) {
        out += stdout
      }
    })
    .then(() => {
      expect(out).to.contain("browserstack.js [--help|-h] [--input|-i <cbtr-settings-file>] [--output|-o <testem-settings-file>]")
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should fail to create testem.json if the input cbtr.json is invalid in the sense that is has no JS browsers specified', function() {
    var proc = new Process(), out = '',
      inputFile = path.resolve(process.cwd(), 'tests/functional/utils/bad-cbtr.json')
    var proc = new Process()
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/utils/settings/testem/browserstack.js', [
        '--input', inputFile
      ]), {
      onstderr: function(stderr) {
        out += stderr
      }
    })
    .then(() => {
      expect(out).to.contain('No browsers defined for JS testing using BrowserStack in')
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should successfully create testem.json for a valid cbtr.json input file', function() {
    var proc = new Process(), out = '',
      inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/browserstack/js-testing/desktop-1.yml')
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/utils/settings/cbtr.js', [
        '--input', inputFile
      ]), {
      onstdout: function(stdout) {
        out += stdout
      },
      onstderr: function(stderr) {
        utils.errorWithoutCovLines(stderr)
      }
    })
    .then(() => {
      expect(out).to.contain('Created cross-browser-tests-runner settings file -')
      var outputFile = path.resolve(process.cwd(), 'cbtr.json')
      expect(fs.existsSync(outputFile)).to.be.true
      var proc2 = new Process()
      return proc2.create('node',
        utils.nodeProcCoverageArgs('bin/utils/settings/testem/browserstack.js'), {
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
      outputFile = path.resolve(process.cwd(), 'cbtr.json')
      return fs.unlinkAsync(outputFile)
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should be able to update existing testem.json without overwriting it completely for a valid cbtr.json input file', function() {
    var proc = new Process(), out = '',
      inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/browserstack/js-testing/mobile-1.yml')
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/utils/settings/cbtr.js', [
        '--input', inputFile
      ]), {
      onstdout: function(stdout) {
        out += stdout
      },
      onstderr: function(stderr) {
        utils.errorWithoutCovLines(stderr)
      }
    })
    .then(() => {
      expect(out).to.contain('Created cross-browser-tests-runner settings file -')
      var outputFile = path.resolve(process.cwd(), 'cbtr.json')
      expect(fs.existsSync(outputFile)).to.be.true
      var proc2 = new Process()
      return proc2.create('node',
        utils.nodeProcCoverageArgs('bin/utils/settings/testem/browserstack.js'), {
        onstdout: function(stdout) {
          if(stdout.match(/Are you using multiple tunnels with different identifiers/)) {
            proc2.proc.stdin.write('n\n')
          }
          else if(stdout.match(/Do you need to take screenshots of your tests once completed/)) {
            proc2.proc.stdin.write('n\n')
          }
          else if(stdout.match(/Do you need to take video of your test/)) {
            proc2.proc.stdin.write('n\n')
          }
          else if(stdout.match(/Please provide a timeout value/)) {
            proc2.proc.stdin.write('abc\n')
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
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

})
