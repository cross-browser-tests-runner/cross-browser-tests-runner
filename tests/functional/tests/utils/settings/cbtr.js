var
  path = require('path'),
  Bluebird = require('bluebird'),
  fs = Bluebird.promisifyAll(require('fs')),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Process = require('./../../../../../lib/core/process').Process

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('generic', function() {

  this.timeout(0)

  it('should fail for bad platform in input yaml file', function() {
    var proc = new Process(),
      inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/bad-platform.yml')
    return proc.create('node', [
      path.resolve(process.cwd(), 'bin/utils/settings/cbtr.js'),
      '--input', inputFile
    ], {
      onstdout: function(stdout) {
        console.log(stdout)
      },
      onstderr: function(stderr) {
        console.log(stderr)
        expect(stderr).to.contain('Unknown cross-browser testing platform "SomePlatform", valid options are: BrowserStack')
      }
    })
    .catch(err => {
      console.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should fail for bad os in input yaml file', function() {
    var proc = new Process(),
      inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/generic/bad-os.yml')
    return proc.create('node', [
      path.resolve(process.cwd(), 'bin/utils/settings/cbtr.js'),
      '--input', inputFile
    ], {
      onstdout: function(stdout) {
        console.log(stdout)
      },
      onstderr: function(stderr) {
        console.log(stderr)
        expect(stderr).to.contain('Unknown OS "SomeOs", valid options are: Windows, Mac OSX, Android, iOS, Windows Mobile, Opera OS, Ubuntu')
      }
    })
    .catch(err => {
      console.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should fail for bad os version in input yaml file', function() {
    var proc = new Process(),
      inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/generic/bad-os-version.yml')
    return proc.create('node', [
      path.resolve(process.cwd(), 'bin/utils/settings/cbtr.js'),
      '--input', inputFile
    ], {
      onstdout: function(stdout) {
        console.log(stdout)
      },
      onstderr: function(stderr) {
        console.log(stderr)
        expect(stderr).to.contain('Unknown OS version "SomeVersion" for os "Windows", valid options are: XP, Vista, 7, 8, 8.1, 10')
      }
    })
    .catch(err => {
      console.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should fail for bad browser in input yaml file', function() {
    var proc = new Process(),
      inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/generic/bad-browser.yml')
    return proc.create('node', [
      path.resolve(process.cwd(), 'bin/utils/settings/cbtr.js'),
      '--input', inputFile
    ], {
      onstdout: function(stdout) {
        console.log(stdout)
      },
      onstderr: function(stderr) {
        console.log(stderr)
        expect(stderr).to.contain('Unknown browser "SomeBrowser", valid options are: Chrome, Firefox, Internet Explorer, Opera, Safari, Edge, Yandex, IE Mobile, Mobile Safari, Android Browser, Opera Mobile Browser')
      }
    })
    .catch(err => {
      console.error(err)
      throw err
    })
    .should.be.fulfilled
  })
})

describe('BrowserStack', function() {

  this.timeout(0)

  it('should fail for unsupported test in input yaml file', function() {
    var proc = new Process(),
      inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/unsup-test.yml')
    return proc.create('node', [
      path.resolve(process.cwd(), 'bin/utils/settings/cbtr.js'),
      '--input', inputFile
    ], {
      onstdout: function(stdout) {
        console.log(stdout)
      },
      onstderr: function(stderr) {
        console.log(stderr)
        expect(stderr).to.contain('Unsupported test type "SomeTest" for "BrowserStack" platform, valid options are: JS, Selenium')
      }
    })
    .catch(err => {
      console.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should fail for unsupported os in input yaml file', function() {
    var proc = new Process(),
      inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/unsup-os.yml')
    return proc.create('node', [
      path.resolve(process.cwd(), 'bin/utils/settings/cbtr.js'),
      '--input', inputFile
    ], {
      onstdout: function(stdout) {
        console.log(stdout)
      },
      onstderr: function(stderr) {
        console.log(stderr)
        expect(stderr).to.contain('Unsupported OS "Ubuntu" for test type "JS" for "BrowserStack" platform, valid options are: Windows, Mac OSX, Opera OS, Windows Mobile, Android, iOS')
      }
    })
    .catch(err => {
      console.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should fail for unsupported os version in input yaml file', function() {
    var proc = new Process(),
      inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/unsup-os-version.yml')
    return proc.create('node', [
      path.resolve(process.cwd(), 'bin/utils/settings/cbtr.js'),
      '--input', inputFile
    ], {
      onstdout: function(stdout) {
        console.log(stdout)
      },
      onstderr: function(stderr) {
        console.log(stderr)
        expect(stderr).to.contain('Unsupported version "Vista" for os "Windows" for test type "JS" for "BrowserStack" platform, valid options are: 7, 8, 10, XP, 8.1')
      }
    })
    .catch(err => {
      console.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should fail for unsupported browser in input yaml file', function() {
    var proc = new Process(),
      inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/unsup-browser.yml')
    return proc.create('node', [
      path.resolve(process.cwd(), 'bin/utils/settings/cbtr.js'),
      '--input', inputFile
    ], {
      onstdout: function(stdout) {
        console.log(stdout)
      },
      onstderr: function(stderr) {
        console.log(stderr)
        expect(stderr).to.contain('Unsupported browser "Mobile Safari" on "Windows 7" for test type "JS" for "BrowserStack" platform, valid options are: Opera, Safari, Chrome, Internet Explorer, Firefox, Yandex')
      }
    })
    .catch(err => {
      console.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should fail for unsupported browser version in input yaml file', function() {
    var proc = new Process(),
      inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/unsup-browser-version.yml')
    return proc.create('node', [
      path.resolve(process.cwd(), 'bin/utils/settings/cbtr.js'),
      '--input', inputFile
    ], {
      onstdout: function(stdout) {
        console.log(stdout)
      },
      onstderr: function(stderr) {
        console.log(stderr)
        expect(stderr).to.contain('Unsupported version "10.0" for browser "Chrome" on "Windows 7" for test type "JS" for "BrowserStack" platform, valid options are:')
      }
    })
    .catch(err => {
      console.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should fail for unsupported device in input yaml file', function() {
    var proc = new Process(),
      inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/bad/browserstack/unsup-device.yml')
    return proc.create('node', [
      path.resolve(process.cwd(), 'bin/utils/settings/cbtr.js'),
      '--input', inputFile
    ], {
      onstdout: function(stdout) {
        console.log(stdout)
      },
      onstderr: function(stderr) {
        console.log(stderr)
        expect(stderr).to.contain('Unsupported device "Nokia Lumia" for browser "IE Mobile" on "Windows Mobile 8.1" for test type "JS" for "BrowserStack" platform, valid options are: Nokia Lumia 930, Nokia Lumia 925, Nokia Lumia 630, Nokia Lumia 520')
      }
    })
    .catch(err => {
      console.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should create cbtr.json for valid desktop browsers in input yaml file', function() {
    var proc = new Process(),
      inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/browserstack/desktop-1.yml')
    return proc.create('node', [
      path.resolve(process.cwd(), 'bin/utils/settings/cbtr.js'),
      '--input', inputFile
    ], {
      onstdout: function(stdout) {
        expect(stdout).to.contain('Created cross-browser-tests-runner settings file -')
      },
      onstderr: function(stderr) {
        console.log(stderr)
      }
    })
    .then(() => {
      var outputFile = path.resolve(process.cwd(), 'cbtr.json')
      expect(fs.existsSync(outputFile)).to.equal.true
      return fs.unlinkAsync(outputFile)
    })
    .catch(err => {
      console.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should create cbtr.json for valid mobile browsers in input yaml file', function() {
    var proc = new Process(),
      inputFile = path.resolve(process.cwd(), 'tests/functional/samples/browsers/browserstack/mobile-1.yml')
    return proc.create('node', [
      path.resolve(process.cwd(), 'bin/utils/settings/cbtr.js'),
      '--input', inputFile
    ], {
      onstdout: function(stdout) {
        expect(stdout).to.contain('Created cross-browser-tests-runner settings file -')
      },
      onstderr: function(stderr) {
        console.log(stderr)
      }
    })
    .then(() => {
      var outputFile = path.resolve(process.cwd(), 'cbtr.json')
      expect(fs.existsSync(outputFile)).to.equal.true
      return fs.unlinkAsync(outputFile)
    })
    .catch(err => {
      console.error(err)
      throw err
    })
    .should.be.fulfilled
  })

})
