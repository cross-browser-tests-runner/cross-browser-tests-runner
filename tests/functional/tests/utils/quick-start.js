var
  path = require('path'),
  Bluebird = require('bluebird'),
  fs = Bluebird.promisifyAll(require('fs')),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Process = require('./../../../../lib/core/process').Process,
  utils = require('./../testutils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('quick-start.js', function() {

  this.timeout(0)

  it('should fail if an unsupported command line option is provided', function() {
    var proc = new Process(), out = ''
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/utils/quick-start.js', ['--unknown']), {
      onstderr: function(data) {
        out += data
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

  it('should fail if any of "--platform" and "--runner" command line options are not provided', function() {
    var proc = new Process(), out = ''
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/utils/quick-start.js'), {
      onstderr: function(stderr) {
        out += stderr
      }
    })
    .then(() => {
      expect(out).to.contain('No platform specified')
      expect(out).to.contain('No runner specified')
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should fail if an unsupported "--platform" and an unsupported "--runner" command line options are provided', function() {
    var proc = new Process(), out = ''
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/utils/quick-start.js', [
        '--platform', 'abc', '--runner', 'def'
      ]), {
      onstderr: function(stderr) {
        out += stderr
      }
    })
    .then(() => {
      expect(out).to.contain('Unknown platform: abc')
      expect(out).to.contain('Unknown runner: def')
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
      utils.nodeProcCoverageArgs('bin/utils/quick-start.js', ['--help']), {
      onstdout: function(stdout) {
        out += stdout
      }
    })
    .then(() => {
      expect(out).to.contain("\nquick-start.js [--help|-h] [--platform|-p <cross-browser platform>] [--runner|-r <tests-runner>]\n\nOptions:\n help              print this help\n platform          browserstack|saucelabs|crossbrowsertesting\n runner            testem\n")
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should successfully create cbtr.json and testem.json for BrowserStack platform', function() {
    var proc = new Process(), out = ''
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/utils/quick-start.js', [
        '--platform', 'browserstack', '--runner', 'testem'
      ]), {
      onstdout: function(stdout) {
        out += stdout
      },
      onstderr: function(stderr) {
        utils.errorWithoutCovLines(stderr)
      }
    })
    .then(() => {
      expect(out).to.contain('Updating browsers for platform: browserstack')
      expect(out).to.contain('Creating global cross-browser-tests-runner settings from sample browsers for browserstack')
      expect(out).to.contain('Creating testem config for browserstack platform using cross-browser-tests-runner settings')
      expect(out).to.contain('Done! Start the server (./node_modules/.bin/cbtr-server) and then execute your testem tests after specifying the test files and other required details in the runner config')
      return true
    })
    .then(() => {
      return Bluebird.all([
        fs.unlinkAsync(path.resolve(process.cwd(), 'testem.json')),
        fs.unlinkAsync(path.resolve(process.cwd(), 'cbtr.json'))
      ])
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should successfully create cbtr.json and testem.json for SauceLabs platform', function() {
    var proc = new Process(), out = ''
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/utils/quick-start.js', [
        '--platform', 'saucelabs', '--runner', 'testem'
      ]), {
      onstdout: function(stdout) {
        out += stdout
      },
      onstderr: function(stderr) {
        utils.errorWithoutCovLines(stderr)
      }
    })
    .then(() => {
      expect(out).to.contain('Updating browsers for platform: saucelabs')
      expect(out).to.contain('Creating global cross-browser-tests-runner settings from sample browsers for saucelabs')
      expect(out).to.contain('Creating testem config for saucelabs platform using cross-browser-tests-runner settings')
      expect(out).to.contain('Done! Start the server (./node_modules/.bin/cbtr-server) and then execute your testem tests after specifying the test files and other required details in the runner config')
      return true
    })
    .then(() => {
      return Bluebird.all([
        fs.unlinkAsync(path.resolve(process.cwd(), 'testem.json')),
        fs.unlinkAsync(path.resolve(process.cwd(), 'cbtr.json'))
      ])
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should successfully create cbtr.json and testem.json for CrossBrowserTesting platform', function() {
    var proc = new Process(), out = ''
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/utils/quick-start.js', [
        '--platform', 'crossbrowsertesting', '--runner', 'testem'
      ]), {
      onstdout: function(stdout) {
        out += stdout
      },
      onstderr: function(stderr) {
        utils.errorWithoutCovLines(stderr)
      }
    })
    .then(() => {
      expect(out).to.contain('Updating browsers for platform: crossbrowsertesting')
      expect(out).to.contain('Creating global cross-browser-tests-runner settings from sample browsers for crossbrowsertesting')
      expect(out).to.contain('Creating testem config for crossbrowsertesting platform using cross-browser-tests-runner settings')
      expect(out).to.contain('Done! Start the server (./node_modules/.bin/cbtr-server) and then execute your testem tests after specifying the test files and other required details in the runner config')
      return true
    })
    .then(() => {
      return Bluebird.all([
        fs.unlinkAsync(path.resolve(process.cwd(), 'testem.json')),
        fs.unlinkAsync(path.resolve(process.cwd(), 'cbtr.json'))
      ])
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

})
