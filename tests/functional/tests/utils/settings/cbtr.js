var
  path = require('path'),
  Bluebird = require('bluebird'),
  fs = Bluebird.promisifyAll(require('fs')),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Process = require('./../../../../../lib/core/process').Process,
  Env = require('./../../../../../lib/core/env').Env,
  utils = require('./../../testutils')

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
        expect(out).to.contain('Unknown cross-browser testing platform "SomePlatform", valid options are: BrowserStack, SauceLabs')
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
      expect(out).to.contain('Unknown cross-browser testing platform "SomePlatform", valid options are: BrowserStack, SauceLabs')
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should fail if an unsupported os is specified in input yaml file', function() {
    var proc = new Process(), out = '',
      inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/generic/bad-os.yml')
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
      expect(out).to.contain('Unknown OS "SomeOs", valid options are: Android, Linux, Mac OSX, Opera OS, Ubuntu, Windows, Windows Mobile, iOS')
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should fail if an unsupported os version is specified in input yaml file', function() {
    var proc = new Process(), out = '',
      inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/generic/bad-os-version.yml')
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
      expect(out).to.contain('Unknown OS version "SomeVersion" for os "Windows", valid options are: 10, 7, 8, 8.1, Vista, XP')
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should fail if an unsupported browser is specified in input yaml file', function() {
    var proc = new Process(), out = '',
      inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/generic/bad-browser.yml')
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
      expect(out).to.contain('Unknown browser "SomeBrowser", valid options are: Android Browser Selenium, Android Browser, Chrome, Edge, Firefox, IE Mobile, Internet Explorer, Mobile Safari iPad, Mobile Safari iPhone, Mobile Safari, Opera Mobile Browser, Opera, Safari, Yandex')
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
      expect(out).to.contain('Unsupported type for browserVersion boolean')
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

})

describe('BrowserStack', function() {

  this.timeout(0)

  it('should fail if an unsupported test type is specified in input yaml file', function() {
    var proc = new Process(), out = '',
      inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/unsup-test.yml')
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
      expect(out).to.contain('Unsupported test type "SomeTest" for "BrowserStack" platform, valid options are: JS, Selenium')
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  describe('JS', function() {

    it('should fail if an unsupported os is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/js-testing/unsup-os.yml')
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
        expect(out).to.contain('Unsupported OS "Ubuntu" for test type "JS" for "BrowserStack" platform, valid options are: Android, Mac OSX, Windows, Windows Mobile, iOS')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail if an unsupported os version is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/js-testing/unsup-os-version.yml')
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
        expect(out).to.contain('Unsupported version "Vista" for os "Windows" for test type "JS" for "BrowserStack" platform, valid options are: 10, 7, 8, 8.1, XP')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail if an unsupported browser is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/js-testing/unsup-browser.yml')
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
        expect(out).to.contain('Unsupported browser "Mobile Safari" on "Windows 7" for test type "JS" for "BrowserStack" platform, valid options are: Chrome, Firefox, Internet Explorer, Opera, Safari, Yandex')
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
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/js-testing/unsup-browser-version.yml')
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
        expect(out).to.contain('Unsupported version "10.0" for browser "Chrome" on "Windows XP" for test type "JS" for "BrowserStack" platform, valid options are:')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail if an unsupported device is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/js-testing/unsup-device.yml')
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
        expect(out).to.contain('Unsupported device "Nokia Lumia" for browser "IE Mobile" on "Windows Mobile 8.1" for test type "JS" for "BrowserStack" platform, valid options are: Nokia Lumia 520, Nokia Lumia 630, Nokia Lumia 925, Nokia Lumia 930')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should successfully create cbtr.json for an input yaml file with valid desktop browsers', function() {
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
        return fs.unlinkAsync(outputFile)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should successfully create cbtr.json for an input yaml file with valid mobile browsers', function() {
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
        return fs.unlinkAsync(outputFile)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  })

  describe('Selenium', function() {

    it('should fail if an unsupported os is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/selenium/unsup-os.yml')
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
        expect(out).to.contain('Unsupported OS "Ubuntu" for test type "Selenium" for "BrowserStack" platform, valid options are: Android, Mac OSX, Windows, iOS')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail if an unsupported os version is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/selenium/unsup-os-version.yml')
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
        expect(out).to.contain('Unsupported version "Vista" for os "Windows" for test type "Selenium" for "BrowserStack" platform, valid options are: 10, 7, 8, 8.1, XP')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail if an unsupported browser is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/selenium/unsup-browser.yml')
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
        expect(out).to.contain('Unsupported browser "Mobile Safari" on "Windows 7" for test type "Selenium" for "BrowserStack" platform, valid options are: Chrome, Firefox, Internet Explorer, Opera')
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
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/selenium/unsup-browser-version.yml')
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
        expect(out).to.contain('Unsupported version "10.0" for browser "Chrome" on "Windows XP" for test type "Selenium" for "BrowserStack" platform, valid options are:')
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail if an unsupported device is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/selenium/unsup-device.yml')
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
        expect(out).to.contain('Unsupported device "Nokia Lumia" for browser "Mobile Safari iPad" on "iOS 5.1" for test type "Selenium" for "BrowserStack" platform, valid options are: iPad 3rd')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should successfully create cbtr.json for input yaml file with valid desktop browsers', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/browserstack/selenium/desktop-1.yml')
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
        return fs.unlinkAsync(outputFile)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should successfully create cbtr.json for input yaml file with valid mobile browsers', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/browserstack/selenium/mobile-1.yml')
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
        return fs.unlinkAsync(outputFile)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  })

})

describe('SauceLabs', function() {

  this.timeout(0)

  it('should fail if an unsupported test is specified in input yaml file', function() {
    var proc = new Process(), out = '',
      inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/saucelabs/unsup-test.yml')
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
      expect(out).to.contain('Unsupported test type "SomeTest" for "SauceLabs" platform, valid options are: JS, Selenium')
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  describe('JS', function() {

    it('should fail if an unsupported os is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/saucelabs/js-testing/unsup-os.yml')
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
        expect(out).to.contain('Unsupported OS "Ubuntu" for test type "JS" for "SauceLabs" platform, valid options are: Linux, Mac OSX, Windows')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail if an unsupported os version is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/saucelabs/js-testing/unsup-os-version.yml')
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
        expect(out).to.contain('Unknown OS version "10.7" for os "Mac OSX", valid options are: 10.10, 10.11, 10.12, 10.9, El Capitan, Lion, Mavericks, Mountain Lion, Sierra, Snow Leopard, Yosemite')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail if an unsupported browser is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/saucelabs/js-testing/unsup-browser.yml')
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
        expect(out).to.contain('Unsupported browser "Mobile Safari" on "Windows 7" for test type "JS" for "SauceLabs" platform, valid options are: Chrome, Firefox, Internet Explorer')
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
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/saucelabs/js-testing/unsup-browser-version.yml')
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
        expect(out).to.contain('Unsupported version "10.1" for browser "Chrome" on "Windows 7" for test type "JS" for "SauceLabs" platform, valid options are:')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should successfully create cbtr.json for input yaml file with valid desktop browsers', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/saucelabs/js-testing/desktop-1.yml')
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
        return fs.unlinkAsync(outputFile)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  })

  describe('Selenium', function() {

    it('should fail if an unsupported os is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/saucelabs/selenium/unsup-os.yml')
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
        expect(out).to.contain('Unsupported OS "Ubuntu" for test type "Selenium" for "SauceLabs" platform, valid options are: Android, Linux, Mac OSX, Windows, iOS')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail if an unsupported os version is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/saucelabs/selenium/unsup-os-version.yml')
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
        expect(out).to.contain('Unsupported version "Vista" for os "Windows" for test type "Selenium" for "SauceLabs" platform, valid options are: 10, 7, 8, 8.1')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail if an unsupported browser is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/saucelabs/selenium/unsup-browser.yml')
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
        expect(out).to.contain('Unsupported browser "Mobile Safari" on "Windows 7" for test type "Selenium" for "SauceLabs" platform, valid options are: Chrome, Firefox, Internet Explorer')
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
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/saucelabs/selenium/unsup-browser-version.yml')
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
        expect(out).to.contain('Unsupported version "10.0" for browser "Chrome" on "Windows 7" for test type "Selenium" for "SauceLabs" platform, valid options are:')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail if an unsupported device is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/saucelabs/selenium/unsup-device.yml')
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
        expect(out).to.contain('Unsupported device "Nokia Lumia" for browser "Safari" on "iOS 10.3" for test type "Selenium" for "SauceLabs" platform, valid options are: iPad Air 2 Simulator, iPad Air Simulator, iPad Pro (12.9 inch) Simulator, iPad Pro (9.7 inch) Simulator, iPad Simulator, iPhone 5 Simulator, iPhone 5s Simulator, iPhone 6 Plus Simulator, iPhone 6 Simulator, iPhone 6s Plus Simulator, iPhone 6s Simulator, iPhone 7 Plus Simulator, iPhone 7 Simulator, iPhone SE Simulator, iPhone Simulator')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should successfully create cbtr.json for input yaml file with valid desktop browsers', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/saucelabs/selenium/desktop-1.yml')
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
        return fs.unlinkAsync(outputFile)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should successfully create cbtr.json for input yaml file with valid mobile browsers', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/saucelabs/selenium/mobile-1.yml')
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
        return fs.unlinkAsync(outputFile)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  })

})
