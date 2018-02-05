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
        expect(out).to.contain('Unsupported OS "Ubuntu" for test type "JS" for "BrowserStack" platform, valid options are: Android, OS X, Windows, Windows Phone, iOS')
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
        expect(out).to.contain('Unsupported device "Nokia Lumia" for browser "IE Mobile" on "Windows Phone 8.1" for test type "JS" for "BrowserStack" platform, valid options are: Nokia Lumia 520, Nokia Lumia 630, Nokia Lumia 925, Nokia Lumia 930')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail if an unsupported property is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/js-testing/unsup-property.yml')
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
        expect(out).to.contain('Unsupported property "someProperty" with value "abc" for the browser/platform combination {"TestType":"JS","os":"Windows","osVersion":"XP","browser":"Chrome","browserVersion":"43.0","device":null,"someProperty":"abc"}')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail if a property which is a standard browser key is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/js-testing/unsup-standard-property.yml')
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
        expect(out).to.contain('Unsupported property "device" with value "abc" for the browser/platform combination {"TestType":"JS","os":"Windows","osVersion":"XP","browser":"Chrome","browserVersion":"43.0","device":"abc"}')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail if a property not supported by BrowserStack is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/js-testing/unsup-platform-property.yml')
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
        expect(out).to.contain('Unsupported property "deviceType" with value "abc" for the browser/platform combination {"TestType":"JS","os":"Windows","osVersion":"XP","browser":"Chrome","browserVersion":"43.0","device":null,"deviceType":"abc"}')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail if an applicable property with an unsupported value is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/js-testing/unsup-property-value.yml')
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
        expect(out).to.contain('Invalid property "resolution" with value "400x300" for the browser/platform combination {"TestType":"JS","os":"Windows","osVersion":"XP","browser":"Chrome","browserVersion":"43.0","device":null,"resolution":"400x300"}')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail if an inapplicable property is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/js-testing/inapplicable-property.yml')
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
        expect(out).to.contain('Invalid property "orientation" with value "portrait" for the browser/platform combination {"TestType":"JS","os":"Windows","osVersion":"XP","browser":"Firefox","browserVersion":"34.0","device":null,"orientation":"portrait"}')
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
        expect(out).to.contain('Unsupported OS "Ubuntu" for test type "Selenium" for "BrowserStack" platform, valid options are: Android, OS X, Windows, iOS')
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
        expect(out).to.contain('Unsupported device "Nokia Lumia" for browser "Mobile Safari" on "iOS 5.1" for test type "Selenium" for "BrowserStack" platform, valid options are: iPad 3rd, iPhone 4S')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail if an unsupported property is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/selenium/unsup-property.yml')
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
        expect(out).to.contain('Unsupported property "someProperty" with value "abc" for the browser/platform combination {"TestType":"Selenium","os":"iOS","osVersion":"5.1","browser":"Mobile Safari","browserVersion":"None","device":"iPhone 4S","someProperty":"abc"}')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail if a property which is a standard browser key is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/selenium/unsup-standard-property.yml')
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
        expect(out).to.contain('Unsupported property "osVersion" with value "abc" for the browser/platform combination {"TestType":"Selenium","os":"iOS","osVersion":"abc","browser":"Mobile Safari","browserVersion":"None","device":"iPhone 4S"}')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail if a property not supported by BrowserStack is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/selenium/unsup-platform-property.yml')
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
        expect(out).to.contain('Unsupported property "deviceType" with value "abc" for the browser/platform combination {"TestType":"Selenium","os":"iOS","osVersion":"5.1","browser":"Mobile Safari","browserVersion":"None","device":"iPhone 4S","deviceType":"abc"}')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail if an applicable property with an unsupported value is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/selenium/unsup-property-value.yml')
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
        expect(out).to.contain('Invalid property "orientation" with value "abc" for the browser/platform combination {"TestType":"Selenium","os":"iOS","osVersion":"5.1","browser":"Mobile Safari","browserVersion":"None","device":"iPhone 4S","orientation":"abc"}')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail if an inapplicable property is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/selenium/inapplicable-property.yml')
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
        expect(out).to.contain('Invalid property "resolution" with value "400x300" for the browser/platform combination {"TestType":"Selenium","os":"iOS","osVersion":"5.1","browser":"Mobile Safari","browserVersion":"None","device":"iPhone 4S","resolution":"400x300"}')
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
