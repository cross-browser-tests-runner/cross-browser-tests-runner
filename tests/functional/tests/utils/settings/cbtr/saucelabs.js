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
        expect(out).to.contain('Unsupported OS "Ubuntu" for test type "JS" for "SauceLabs" platform, valid options are: Android, Linux, OS X, Windows, iOS')
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
        expect(out).to.contain('Unsupported version "Snow Leopard" for os "OS X" for test type "JS" for "SauceLabs" platform, valid options are: El Capitan, Mavericks, Sierra, Yosemite')
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

    it('should fail if an unsupported device is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/saucelabs/js-testing/unsup-device.yml')
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
        expect(out).to.contain('Unsupported device "Nokia Lumia" for browser "Mobile Safari" on "iOS 10.3" for test type "JS" for "SauceLabs" platform, valid options are: iPad Air 2 Simulator, iPad Air Simulator, iPad Pro (12.9 inch) Simulator, iPad Pro (9.7 inch) Simulator, iPad Simulator, iPhone 5 Simulator, iPhone 5s Simulator, iPhone 6 Plus Simulator, iPhone 6 Simulator, iPhone 6s Plus Simulator, iPhone 6s Simulator, iPhone 7 Plus Simulator, iPhone 7 Simulator, iPhone SE Simulator, iPhone Simulator')
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
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/saucelabs/js-testing/unsup-property.yml')
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
        expect(out).to.contain('Unsupported property "someProperty" with value "304x310" for the browser/platform combination {"TestType":"JS","os":"iOS","osVersion":"10.3","browser":"Mobile Safari","browserVersion":"None","device":"iPhone 7 Simulator","someProperty":"304x310"}')
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
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/saucelabs/js-testing/unsup-standard-property.yml')
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
        expect(out).to.contain('Unsupported property "browserVersion" with value "304x310" for the browser/platform combination {"TestType":"JS","os":"iOS","osVersion":"10.3","browser":"Mobile Safari","browserVersion":"304x310","device":"iPhone 7 Simulator"}')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail if a property not supported by SauceLabs is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/saucelabs/js-testing/unsup-platform-property.yml')
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
        expect(out).to.contain('Unsupported property "isPhysicalDevice" with value "true" for the browser/platform combination {"TestType":"JS","os":"iOS","osVersion":"10.3","browser":"Mobile Safari","browserVersion":"None","device":"iPhone 7 Simulator","isPhysicalDevice":true}')
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
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/saucelabs/js-testing/unsup-property-value.yml')
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
        expect(out).to.contain('Invalid property "deviceType" with value "abc" for the browser/platform combination {"TestType":"JS","os":"iOS","osVersion":"10.3","browser":"Mobile Safari","browserVersion":"None","device":"iPhone 7 Simulator","deviceType":"abc"}')
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
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/saucelabs/js-testing/inapplicable-property.yml')
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
        expect(out).to.contain('Invalid property "resolution" with value "100x300" for the browser/platform combination {"TestType":"JS","os":"iOS","osVersion":"10.3","browser":"Mobile Safari","browserVersion":"None","device":"iPhone 7 Simulator","resolution":"100x300"}')
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

    it('should successfully create cbtr.json for input yaml file with valid mobile browsers', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/saucelabs/js-testing/mobile-1.yml')
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
        expect(out).to.contain('Unsupported OS "Ubuntu" for test type "Selenium" for "SauceLabs" platform, valid options are: Android, Linux, OS X, Windows, iOS')
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
        expect(out).to.contain('Unsupported device "Nokia Lumia" for browser "Mobile Safari" on "iOS 10.3" for test type "Selenium" for "SauceLabs" platform, valid options are: iPad Air 2 Simulator, iPad Air Simulator, iPad Pro (12.9 inch) Simulator, iPad Pro (9.7 inch) Simulator, iPad Simulator, iPhone 5 Simulator, iPhone 5s Simulator, iPhone 6 Plus Simulator, iPhone 6 Simulator, iPhone 6s Plus Simulator, iPhone 6s Simulator, iPhone 7 Plus Simulator, iPhone 7 Simulator, iPhone SE Simulator, iPhone Simulator')
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
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/saucelabs/selenium/unsup-property.yml')
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
        expect(out).to.contain('Unsupported property "someProperty" with value "abc" for the browser/platform combination {"TestType":"Selenium","os":"Windows","osVersion":"7","browser":"Chrome","browserVersion":"41.0","device":null,"someProperty":"abc"}')
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
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/saucelabs/selenium/unsup-standard-property.yml')
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
        expect(out).to.contain('Unsupported property "os" with value "abc" for the browser/platform combination {"TestType":"Selenium","os":"abc","osVersion":"7","browser":"Chrome","browserVersion":"41.0","device":null}')
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should fail if a property not supported by SauceLabs is specified in input yaml file', function() {
      var proc = new Process(), out = '',
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/saucelabs/selenium/unsup-platform-property.yml')
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
        expect(out).to.contain('Unsupported property "isPhysicalDevice" with value "false" for the browser/platform combination {"TestType":"Selenium","os":"Windows","osVersion":"7","browser":"Chrome","browserVersion":"41.0","device":null,"isPhysicalDevice":false}')
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
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/saucelabs/selenium/unsup-property-value.yml')
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
        expect(out).to.contain('Invalid property "resolution" with value "400x300" for the browser/platform combination {"TestType":"Selenium","os":"Windows","osVersion":"7","browser":"Chrome","browserVersion":"41.0","device":null,"resolution":"400x300"}')
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
        inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/saucelabs/selenium/inapplicable-property.yml')
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
        expect(out).to.contain('Invalid property "orientation" with value "portrait" for the browser/platform combination {"TestType":"Selenium","os":"Windows","osVersion":"7","browser":"Chrome","browserVersion":"41.0","device":null,"orientation":"portrait"}')
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
