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

  it('should fail for unsupported argument', function() {
    var proc = new Process()
    return proc
    .create('node', [ path.resolve(process.cwd(), 'bin/utils/quick-start.js'), '--unknown' ], {
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

  it('should fail for no platform and runner arguments', function() {
    var proc = new Process(), out = ''
    return proc
    .create('node', [ path.resolve(process.cwd(), 'bin/utils/quick-start.js') ], {
      onstderr: function(stderr) {
        out += stderr
      }
    })
    .then(() => {
      expect(out).to.contain('No platform specified')
      expect(out).to.contain('No runner specified')
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should fail for unsupported platform and runner arguments', function() {
    var proc = new Process(), out = ''
    return proc
    .create('node', [ path.resolve(process.cwd(), 'bin/utils/quick-start.js'), '--platform', 'abc', '--runner', 'def' ], {
      onstderr: function(stderr) {
        out += stderr
      }
    })
    .then(() => {
      expect(out).to.contain('Unknown platform: abc')
      expect(out).to.contain('Unknown runner: def')
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
    .create('node', [ path.resolve(process.cwd(), 'bin/utils/quick-start.js'), '--help' ], {
      onstdout: function(stdout) {
        expect(stdout).to.contain("quick-start.js [--help|-h] [--platform|-p <cross-browser platform>] [--runner|-o <tests-runner>]")
      }
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should create cbtr.json and testem.json', function() {
    var proc = new Process(), out = ''
    return proc.create('node', [
      path.resolve(process.cwd(), 'bin/utils/quick-start.js'),
      '--platform', 'browserstack', '--runner', 'testem'
    ], {
      onstdout: function(stdout) {
        out += stdout
      }
    })
    .then(() => {  
      expect(out).to.contain('Updating browsers for platform: browserstack')
      expect(out).to.contain('Creating global cross-browser-tests-runner settings from sample browsers for browserstack')
      expect(out).to.contain('Creating testem config for browserstack platform using cross-browser-tests-runner settings')
      expect(out).to.contain('Done! Run "npm start" and then execute your testem tests after specifying the test files and other required details in the runner config')
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
