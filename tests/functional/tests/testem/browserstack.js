var
  path = require('path'),
  Bluebird = require('bluebird'),
  fs = Bluebird.promisifyAll(require('fs')),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Process = require('./../../../../lib/core/process').Process

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('BrowserStack', function() {

  this.timeout(0)

  it('should work in testem ci mode for a jasmine-1.x test', function() {
    var proc = new Process(), out = ''
    return proc
    .create('node', [
        path.resolve(process.cwd(), 'node_modules/.bin/testem'),
        'ci',
        '-f',
        path.resolve(process.cwd(), 'tests/functional/conf/testem/jasmine-1.json')
    ], {
      onstdout: function(stdout) {
        out += stdout
        console.log(stdout)
      },
      onstderr: function(stderr) {
        console.log(stderr)
      }
    })
    .then(() => {
      expect(out).to.contain('Safari 9.1 - sum should return the sum of two numbers.')
      expect(out).to.contain('Safari 9.1 - mult should return the product of two numbers.')
      expect(out).to.contain('Firefox 43.0 - sum should return the sum of two numbers.')
      expect(out).to.contain('Firefox 43.0 - mult should return the product of two numbers.')
      expect(out).to.contain('Chrome 51.0 - sum should return the sum of two numbers.')
      expect(out).to.contain('Chrome 51.0 - mult should return the product of two numbers.')
      expect(out).to.contain('IE 11.0 - sum should return the sum of two numbers.')
      expect(out).to.contain('IE 11.0 - mult should return the product of two numbers.')
      expect(out).to.contain('# tests 8')
      expect(out).to.contain('# pass  8')
      return true
    })
    .should.be.fulfilled
  })

  it('should work in testem ci mode for a jasmine-1.x test using bin links', function() {
    var proc = new Process(), out = ''
    var unlinkPromises = [
      fs.unlinkAsync(path.resolve(process.cwd(), 'node_modules/.bin/cbtr-testem-browserstack-browser')),
      fs.unlinkAsync(path.resolve(process.cwd(), 'node_modules/.bin/cbtr-testem-browserstack-open')),
      fs.unlinkAsync(path.resolve(process.cwd(), 'node_modules/.bin/cbtr-testem-browserstack-close'))
    ]
    var linkPromises = [
      fs.symlinkAsync(path.resolve(process.cwd(), 'bin/hooks/testem/browserstack/browser.js'),
        path.resolve(process.cwd(), 'node_modules/.bin/cbtr-testem-browserstack-browser')),
      fs.symlinkAsync(path.resolve(process.cwd(), 'bin/hooks/testem/browserstack/open.js'),
        path.resolve(process.cwd(), 'node_modules/.bin/cbtr-testem-browserstack-open')),
      fs.symlinkAsync(path.resolve(process.cwd(), 'bin/hooks/testem/browserstack/close.js'),
        path.resolve(process.cwd(), 'node_modules/.bin/cbtr-testem-browserstack-close'))
    ]
    return Bluebird.all(unlinkPromises)
    .catch(err => {
      return Bluebird.all(linkPromises)
    })
    .then(ret => {
      return Bluebird.all(linkPromises)
    })
    .then(ret => {
      return proc
      .create('node', [
        path.resolve(process.cwd(), 'node_modules/.bin/testem'),
        'ci',
        '-f',
        path.resolve(process.cwd(), 'tests/functional/conf/testem/jasmine-1-bin-links.json')
      ], {
        onstdout: function(stdout) {
          out += stdout
          console.log(stdout)
        },
        onstderr: function(stderr) {
          console.log(stderr)
        }
      })
    })
    .then(() => {
      expect(out).to.contain('Safari 9.1 - sum should return the sum of two numbers.')
      expect(out).to.contain('Safari 9.1 - mult should return the product of two numbers.')
      expect(out).to.contain('Firefox 43.0 - sum should return the sum of two numbers.')
      expect(out).to.contain('Firefox 43.0 - mult should return the product of two numbers.')
      expect(out).to.contain('Chrome 51.0 - sum should return the sum of two numbers.')
      expect(out).to.contain('Chrome 51.0 - mult should return the product of two numbers.')
      expect(out).to.contain('IE 11.0 - sum should return the sum of two numbers.')
      expect(out).to.contain('IE 11.0 - mult should return the product of two numbers.')
      expect(out).to.contain('# tests 8')
      expect(out).to.contain('# pass  8')
      return true
    })
    .should.be.fulfilled
  })
})
