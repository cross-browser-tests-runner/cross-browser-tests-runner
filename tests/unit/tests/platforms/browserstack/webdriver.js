'use strict';

var
  chai = require('chai'),
  WebDriver = require('./../../../../../lib/platforms/browserstack/webdriver').WebDriver,
  Tunnel = require('./../../../../../lib/platforms/browserstack/tunnel').Tunnel,
  utils = require('./utils')

var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
var
  expect = chai.expect,
  should = chai.should()

const
  script = (driver, webdriver) => {
    return driver.getTitle()
    .then(function(title) {
      utils.log.debug(title)
      return true
    })
  }

if(process.version > 'v6') {

describe('create', function() {

  this.timeout(0)

  it('should fail in case of no capabilities', function() {
    var webDriver = new WebDriver('http://google.com')
    expect(function(){
      return webDriver.create()
    }).to.throw('Target browser must be a string, but is \<undefined\>; did you forget to call forBrowser\(\)\?')
  })

  it('should fail with an invalid browser name specified', function() {
    var webDriver = new WebDriver('http://google.com', {
      browser: 'SomeBrowser'
    })
    return webDriver.create()
    .should.be.rejectedWith('OS/Browser combination invalid')
  })

  it('should fail with valid browser name and unsupported browser version specified', function() {
    var webDriver = new WebDriver('http://google.com', {
      browser: 'Chrome',
      browser_version: '1.0'
    })
    return webDriver.create()
    .should.be.rejectedWith('OS/Browser combination invalid')
  })

  it('should fail with valid browser name and invalid OS details specified', function() {
    var webDriver = new WebDriver('http://google.com', {
      browser: 'Chrome',
      os: 'Linux',
      os_version: '10.0'
    })
    return webDriver.create()
    .should.be.rejectedWith('OS and OS Version not supported')
  })

  it('should fail with valid browser, valid OS, and invalid OS version specified', function() {
    var webDriver = new WebDriver('http://google.com', {
      browser: 'Chrome',
      os: 'Windows',
      os_version: 'NT'
    })
    return webDriver.create()
    .should.be.rejectedWith('OS and OS Version not supported')
  })

  it('should work with a valid browser name specified', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome'
    })
    return webDriver.create()
    .then(() => {
      return webDriver.driver.quit()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should work with valid browser name and browser version specified', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome',
      browser_version: '41.0'
    })
    return webDriver.create()
    .then(() => {
      return webDriver.driver.quit()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should work with valid browser and os details specified', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome',
      browser_version: '41.0',
      os: 'Windows',
      os_version: '8'
    })
    return webDriver.create()
    .then(() => {
      return webDriver.driver.quit()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

})

describe('run', function() {

  this.timeout(0)

  it('should fail if create() was not called', function() {
    var webDriver = new WebDriver()
    expect(() => { return webDriver.run() }).to.throw('Platforms.Core.WebDriver: Driver not created yet')
  })

  it('should fail for an empty url', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome'
    })
    var error
    return webDriver.create()
    .then(() => {
      return webDriver.run(script)
    })
    .catch(err => {
      error = err
      return webDriver.driver.quit()
    }).
    then(() => {
      throw error
    })
    .should.be.rejectedWith('Cannot navigate to invalid URL')
  })

  it('should work for a valid remote url', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://www.google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome'
    })
    return webDriver.create()
    .then(() => {
      return webDriver.run(script)
    })
    .then(() => {
      return webDriver.driver.quit()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should work for a valid remote url and screenshot capability', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://www.google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome',
      'browserstack.debug': true
    })
    return webDriver.create()
    .then(() => {
      return webDriver.run(script)
    })
    .then(() => {
      return webDriver.driver.quit()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should fail for a valid local url without local capabilities specified', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://localhost:3000/tests/pages/tests.html', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome'
    })
    var match
    return webDriver.create()
    .then(() => {
      return webDriver.run(script)
    })
    .then(() => {
      return webDriver.driver.getPageSource()
    })
    .then(source => {
      match = source.match(/localhost<\/strong> refused to connect./)
      return webDriver.driver.quit()
    })
    .then(() => {
      if(match) {
        return true
      }
      else {
        throw new Error('Did not get expected page source of failure to connect with localhost')
      }
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should work for a valid local url with local capabilities specified and tunnel running', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://localhost:3000/tests/pages/tests.html', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome',
      'browserstack.local': true,
      'browserstack.localIdentifier': 'ut-bs-webdriver'
    })
    var tunnel = new Tunnel({localIdentifier: 'ut-bs-webdriver'})
    var match, savedSource
    return tunnel.start()
    .then(() => {
      expect(tunnel).to.not.be.null
      expect(tunnel.process.pid).to.not.be.undefined
      expect(tunnel.process.tunnelId).to.not.be.undefined
      expect(tunnel.process.tunnelId).to.equal('ut-bs-webdriver')
      return webDriver.create()
    })
    .then(() => {
      return webDriver.run(script)
    })
    .then(() => {
      return webDriver.driver.getPageSource()
    })
    .then(source => {
      savedSource = source
      utils.log.debug(source)
      match = source.match(/<h1>Hi, this is a page for testing cross\-browser\-tests\-runner<\/h1>/)
      return webDriver.driver.quit()
    })
    .then(() => {
      return utils.ensureZeroTunnels()
    })
    .then(() => {
      if(!match && !savedSource.match(/localhost<\/strong> refused to connect./)) {
        throw new Error('Did not get expected page source or the source hinting at tunnel failure')
      }
      return true
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

})

describe('close', function() {

  this.timeout(0)

  it('should silently close even if create() was not called', function() {
    var webDriver = new WebDriver()
    return webDriver.close().should.be.fulfilled
  })

  it('should close after successfully creating the session', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome',
      browser_version: '41.0',
      os: 'Windows',
      os_version: '8'
    })
    return webDriver.create()
    .then(() => {
      return webDriver.close()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should close after running the script', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://www.google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome'
    })
    return webDriver.create()
    .then(() => {
      return webDriver.run(script)
    })
    .then(() => {
      return webDriver.close()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

})

describe('markStatus', function(){

  this.timeout(0)

  it('should throw error if session is not created yet', function() {
    var webDriver = new WebDriver()
    expect(()=>{webDriver.markStatus()}).to.throw('Platforms.BrowserStack.WebDriver: session not created yet to mark')
  })

  it('should mark status as passed in case no decider is provided', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://www.google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome'
    })
    return webDriver.create()
    .then(() => {
      return webDriver.markStatus()
    })
    .then(() => {
      return webDriver.close()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should mark status as passed after running test script in case no decider is provided', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://www.google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome'
    })
    return webDriver.create()
    .then(() => {
      return webDriver.run(script)
    })
    .then(() => {
      return webDriver.markStatus()
    })
    .then(() => {
      return webDriver.close()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should work even if session is already closed', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://www.google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome'
    })
    return webDriver.create()
    .then(() => {
      return webDriver.markStatus()
    })
    .then(() => {
      return webDriver.close()
    })
    .then(() => {
      return webDriver.markStatus()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should mark status as failed in case decider throws an error', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://www.google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome'
    })
    return webDriver.create()
    .then(() => {
      return webDriver.markStatus((driver, wd)=>{
        throw new Error('Random Error')
      })
    })
    .then(() => {
      return webDriver.close()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should mark status as failed in case decider promise is rejected', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://www.google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome'
    })
    return webDriver.create()
    .then(() => {
      return webDriver.markStatus((driver, wd)=>{
        return Promise.reject('Random Error')
      })
    })
    .then(() => {
      return webDriver.close()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should mark status as failed in case decider promise is resolved with falsy result', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://www.google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome'
    })
    return webDriver.create()
    .then(() => {
      return webDriver.markStatus((driver, wd)=>{
        return Promise.resolve(false)
      })
    })
    .then(() => {
      return webDriver.close()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should mark status as passed in case decider promise is resolved with truthy result', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://www.google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome'
    })
    return webDriver.create()
    .then(() => {
      return webDriver.markStatus((driver, wd)=>{
        return Promise.resolve(true)
      })
    })
    .then(() => {
      return webDriver.close()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

})

describe('screenshot', function() {

  this.timeout(0)

  function checkBase64(b64string) {
    var buf
    if (typeof Buffer.from === "function") {
      buf = Buffer.from(b64string, 'base64')
    } else {
      buf = new Buffer(b64string, 'base64')
    }
    var origLen = parseInt((b64string.length * 3) / 4),
      decodedLen = buf.toString().length
    utils.log.debug('original chars length %d', origLen)
    utils.log.debug('decoded chars length %d', decodedLen)
    expect(decodedLen).to.be.below(origLen + 1)
    expect(decodedLen).to.be.above(0)
  }

  it('should throw error if the session is not created yet', function(){
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://www.google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome'
    })
    expect(() => { return webDriver.screenshot() }).to.throw('Platforms.BrowserStack.WebDriver: session not created yet to take screenshot')
  })

  it('should work after creating the session', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://www.google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome'
    })
    var pngStr
    return webDriver.create()
    .then(() => {
      return webDriver.screenshot()
    })
    .then((str) => {
      pngStr = str
      return webDriver.close()
    })
    .then(() => {
      checkBase64(pngStr)
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should work after running the script', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://www.google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome'
    })
    var pngStr
    return webDriver.create()
    .then(() => {
      return webDriver.run(script)
    })
    .then(() => {
      return webDriver.screenshot()
    })
    .then((str) => {
      pngStr = str
      return webDriver.close()
    })
    .then(() => {
      checkBase64(pngStr)
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should fail after closing the session', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://www.google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome'
    })
    return webDriver.create()
    .then(() => {
      return webDriver.run(script)
    })
    .then(() => {
      return webDriver.close()
    })
    .then(() => {
      return webDriver.screenshot()
    })
    .should.be.rejectedWith('This driver instance does not have a valid session ID')
  })

})

describe('status', function() {

  this.timeout(0)

  it('should fail if session is not created', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://www.google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome'
    })
    expect(() => { return webDriver.status() }).to.throw('Platforms.BrowserStack.WebDriver: session not created yet to get status')
  })

  it('should report running after creating the session', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://www.google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome'
    })
    var status
    return webDriver.create()
    .then(() => {
      return webDriver.status()
    })
    .then(ret => {
      status = ret
      return webDriver.close()
    })
    .then(() => {
      expect(status).to.equal('running')
      return true
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should report running after running the script', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://www.google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome'
    })
    var status
    return webDriver.create()
    .then(() => {
      return webDriver.run(script)
    })
    .then(() => {
      return webDriver.status()
    })
    .then(ret => {
      status = ret
      return webDriver.close()
    })
    .then(() => {
      expect(status).to.equal('running')
      return true
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should report stopped for an invalid session', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://www.google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome'
    })
    var status
    return webDriver.create()
    .then(() => {
      webDriver.session = 'abc'
      return webDriver.run(script)
    })
    .then(() => {
      return webDriver.status()
    })
    .then(ret => {
      status = ret
      return webDriver.close()
    })
    .then(() => {
      expect(status).to.equal('stopped')
      return true
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should report stopped for a stopped session', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://www.google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome'
    })
    var status
    return webDriver.create()
    .then(() => {
      return webDriver.close()
    })
    .then(() => {
      return webDriver.status()
    })
    .then(ret => {
      status = ret
      expect(status).to.equal('stopped')
      return true
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should report stopped for a passed session', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://www.google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome'
    })
    var status
    return webDriver.create()
    .then(() => {
      return webDriver.markStatus()
    })
    .then(() => {
      return webDriver.status()
    })
    .then(ret => {
      status = ret
      return webDriver.close()
    })
    .then(() => {
      expect(status).to.equal('stopped')
      return true
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should report stopped for a failed session', function() {
    var build = utils.buildDetails()
    var webDriver = new WebDriver('http://www.google.com', {
      build: build.build,
      name: build.name,
      project: build.project,
      browser: 'Chrome'
    })
    var status
    return webDriver.create()
    .then(() => {
      return webDriver.markStatus(()=>{
        return Promise.resolve(false)
      })
    })
    .then(() => {
      return webDriver.status()
    })
    .then(ret => {
      status = ret
      return webDriver.close()
    })
    .then(() => {
      expect(status).to.equal('stopped')
      return true
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

})

}
