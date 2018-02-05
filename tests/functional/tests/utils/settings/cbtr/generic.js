var
  path = require('path'),
  Bluebird = require('bluebird'),
  fs = Bluebird.promisifyAll(require('fs')),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Process = require('./../../../../../../lib/core/process').Process,
  Env = require('./../../../../../../lib/core/env').Env,
  utils = require('./../../../testutils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('generic', function() {

  this.timeout(0)

  it('should fail if an unknown command line option is provided', function() {
    var proc = new Process(), out = ''
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/utils/settings/cbtr.js', ['--unknown']), {
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
      utils.nodeProcCoverageArgs('bin/utils/settings/cbtr.js', ['--help']), {
      onstdout: function(stdout) {
        out += stdout
      }
    })
    .then(() => {
      expect(out).to.contain("cbtr.js [--help|-h] [--input|-i <browsers-yaml-file>] [--output|-o <cbtr-settings-file>]")
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  if(!Env.isWindows) {
    it('should be able to pick and use default input file (CWD/.cbtr-browsers.yml)', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/bad-platform.yml'),
        autoUseFile = path.resolve(process.cwd(), '.cbtr-browsers.yml')
      return utils.copyFileAsync(inputFile, autoUseFile)
      .then(() => {
        return proc.create('node',
          utils.nodeProcCoverageArgs('bin/utils/settings/cbtr.js', [ ]), {
          onstdout: function(stdout) {
            utils.log.debug(stdout)
          },
          onstderr: function(stderr) {
            utils.errorWithoutCovLines(stderr)
            out += stderr
          }
        })
      })
      .then(() => {
        expect(out).to.contain('Unknown cross-browser testing platform "SomePlatform", valid options are: BrowserStack, CrossBrowserTesting, SauceLabs')
        fs.unlinkSync(autoUseFile)
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })
  }

  it('should fail if an unsupported platform is specified in input yaml file', function() {
    var proc = new Process(), out = '',
      inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/bad-platform.yml')
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/utils/settings/cbtr.js', [
        '--input', inputFile
      ]), {
      onstdout: function(stdout) {
        utils.log.debug(stdout)
      },
      onstderr: function(stderr) {
        utils.errorWithoutCovLines(stderr)
        out += stderr
      }
    })
    .then(() => {
      expect(out).to.contain('Unknown cross-browser testing platform "SomePlatform", valid options are: BrowserStack, CrossBrowserTesting, SauceLabs')
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should fail if an unsupported browser version is specified in input yaml file', function() {
    var proc = new Process(), out = '',
      inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/generic/bad-browser-version.yml')
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/utils/settings/cbtr.js', [
        '--input', inputFile
      ]), {
      onstdout: function(stdout) {
        utils.log.debug(stdout)
      },
      onstderr: function(stderr) {
        utils.errorWithoutCovLines(stderr)
        out += stderr
      }
    })
    .then(() => {
      expect(out).to.contain('Unsupported value "false" for browserVersion')
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  function newProc(input) {
    var proc = new Process()
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/utils/settings/cbtr.js', [
        '--input', input, '--update'
      ]), {
      onstdout: function(stdout) {
      },
      onstderr: function(stderr) {
      }
    })
  }

  it('should be able to merge new config with existing config', function() {
    var proc = new Process(),
      outputFile = path.resolve(process.cwd(), 'cbtr.json')
      inputFile1 = path.resolve(process.cwd(), 'tests/functional/samples/browsers/browserstack/js-testing/desktop-1.yml'),
      inputFile2 = path.resolve(process.cwd(), 'tests/functional/samples/browsers/browserstack/js-testing/mobile-1.yml'),
      inputFile3 = path.resolve(process.cwd(), 'tests/functional/samples/browsers/saucelabs/js-testing/desktop-1.yml'),
      inputFile4 = path.resolve(process.cwd(), 'tests/functional/samples/browsers/browserstack/js-testing/mobile-1.yml'),
      inputFile5 = path.resolve(process.cwd(), 'tests/functional/samples/browsers/browserstack/selenium/desktop-1.yml')
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/utils/settings/cbtr.js', [
        '--input', inputFile1
      ]), {
      onstdout: function(stdout) {
      },
      onstderr: function(stderr) {
      }
    })
    .then(() => {
      expect(fs.existsSync(outputFile)).to.be.true
      return newProc(inputFile2)
    })
    .then(() => {
      expect(fs.existsSync(outputFile)).to.be.true
      return newProc(inputFile3)
    })
    .then(() => {
      expect(fs.existsSync(outputFile)).to.be.true
      return newProc(inputFile4)
    })
    .then(() => {
      expect(fs.existsSync(outputFile)).to.be.true
      return newProc(inputFile5)
    })
    .then(() => {
      return fs.unlinkAsync(outputFile)
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

})
