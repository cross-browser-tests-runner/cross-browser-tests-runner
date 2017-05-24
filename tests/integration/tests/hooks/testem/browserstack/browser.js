var
  path = require('path'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Process = require('./../../../../../../lib/core/process').Process

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('browser.js', function() {

  this.timeout(0)

  it('should fail without any arguments', function() {
    var proc = new Process()
    return proc
    .create('node', [ path.resolve(process.cwd(), 'bin/hooks/testem/browserstack/browser.js') ], {
      onstderr: function(stderr) {
        expect(stderr).to.contain('failed to create test - StatusCodeError: 400')
        expect(stderr).to.contain('required option os missing in')
      }
    })
    .should.be.fulfilled
  })

  it('should fail with bad arguments', function() {
    var proc = new Process()
    return proc
    .create('node', [ path.resolve(process.cwd(), 'bin/hooks/testem/browserstack/browser.js'), "--os", "Windows", "--osVersion", "None", "--browser", "firefox", "--browserVersion", "43.0" ], {
      onstderr: function(stderr) {
        expect(stderr).to.contain('failed to create test - StatusCodeError: 400')
        expect(stderr).to.contain('{"error":"422 - {\\\"message\\\":\\\"Validation Failed\\\",\\\"errors\\\":[{\\\"field\\\":\\\"url\\\",\\\"code\\\":\\\"can\'t be blank\\\"},{\\\"field\\\":\\\"os_version\\\",\\\"code\\\":\\\"invalid\\\"}]}"}')
      }
    })
    .should.be.fulfilled
  })

  it('should create a test for valid arguments and then stop run and exit when killed', function() {
    var proc = new Process(), tried = false
    return proc
    .create('node', [ path.resolve(process.cwd(), 'bin/hooks/testem/browserstack/browser.js'), "--os", "Windows", "--osVersion", "10", "--browser", "firefox", "--browserVersion", "43.0", "http://localhost:3000/tests/pages/tests.html" ], {
      onstdout: function(stdout) {
        if(!tried && stdout.match(/created test/)) {
          tried = true
          proc.stop()
        }
      }
    })
    .should.be.fulfilled
  })

  it('should create a test for valid arguments and then stop run with screenshots and exit when killed', function() {
    var proc = new Process(), tried = false
    return proc
    .create('node', [ path.resolve(process.cwd(), 'bin/hooks/testem/browserstack/browser.js'), "--os", "Windows", "--osVersion", "10", "--browser", "firefox", "--browserVersion", "43.0", "--screenshots", "--video", "http://localhost:3000/tests/pages/tests.html" ], {
      onstdout: function(stdout) {
        if(!tried && stdout.match(/created test/)) {
          tried = true
          proc.stop()
        }
      }
    })
    .should.be.fulfilled
  })
})
