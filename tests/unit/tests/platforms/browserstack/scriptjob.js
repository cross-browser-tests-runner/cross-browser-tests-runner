'use strict';

var
  chai = require('chai'),
  ScriptJob = require('./../../../../../lib/platforms/browserstack/scriptjob').ScriptJob,
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

  describe('ScriptJob', function() {

    describe('create', function() {

      this.timeout(0)

      it('should fail to create the session if no capabilities are input', function() {
        var scriptJob = new ScriptJob('http://google.com')
        expect(function(){
          return scriptJob.create()
        }).to.throw('Target browser must be a string, but is \<undefined\>; did you forget to call forBrowser\(\)\?')
      })

      it('should fail to create the session if an unsupported browser name is provided', function() {
        var scriptJob = new ScriptJob('http://google.com', {
          browser: 'SomeBrowser'
        })
        return scriptJob.create()
        .should.be.rejectedWith('OS/Browser combination invalid')
      })

      it('should fail to create the session if an unsupported browser version is provided', function() {
        var scriptJob = new ScriptJob('http://google.com', {
          browser: 'Chrome',
          browser_version: '1.0'
        })
        return scriptJob.create()
        .should.be.rejectedWith('OS/Browser combination invalid')
      })

      it('should fail to create the session if unsupported OS details are provided', function() {
        var scriptJob = new ScriptJob('http://google.com', {
          browser: 'Chrome',
          os: 'Linux',
          os_version: '10.0'
        })
        return scriptJob.create()
        .should.be.rejectedWith('OS and OS Version not supported')
      })

      it('should fail to create the session if unsupported OS version is provided', function() {
        var scriptJob = new ScriptJob('http://google.com', {
          browser: 'Chrome',
          os: 'Windows',
          os_version: 'NT'
        })
        return scriptJob.create()
        .should.be.rejectedWith('OS and OS Version not supported')
      })

      it('should create a session if a supported browser name is provided (only mandatory capability)', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://google.com', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome'
        })
        return scriptJob.create()
        .then(() => {
          return scriptJob.driver.quit()
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should create a session if valid values for browser name and browser version are provided', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://google.com', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome',
          browser_version: '41.0'
        })
        return scriptJob.create()
        .then(() => {
          return scriptJob.driver.quit()
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should create a session if valid values for browser name, browser version, os, and os version are provided', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://google.com', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome',
          browser_version: '41.0',
          os: 'Windows',
          os_version: '8'
        })
        return scriptJob.create()
        .then(() => {
          return scriptJob.driver.quit()
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

    })

    describe('run', function() {

      this.timeout(0)

      it('should fail if the session is not created yet', function() {
        var scriptJob = new ScriptJob()
        expect(() => { return scriptJob.run() }).to.throw('Platforms.Core.ScriptJob: Driver not created yet')
      })

      it('should fail if an empty url and valid values of all mandatory capabilities are provided while creating the session', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome'
        })
        var error
        return scriptJob.create()
        .then(() => {
          return scriptJob.run(script)
        })
        .catch(err => {
          error = err
          return scriptJob.driver.quit()
        }).
        then(() => {
          throw error
        })
        .should.be.rejectedWith('Cannot navigate to invalid URL')
      })

      it('should run the script if a valid remote url, valid values of all mandatory capabilities, and optional screenshot capability are provided', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://www.google.com', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome',
          'browserstack.debug': true
        })
        return scriptJob.create()
        .then(() => {
          return scriptJob.run(script)
        })
        .then(() => {
          return scriptJob.driver.quit()
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should run the script and get connection failures in the page opened if a valid local url, valid values for all mandatory capabilities, and no "local" capability were provided while creating the session', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://127.0.0.1:3000/tests/pages/tests.html', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome'
        })
        var match
        return scriptJob.create()
        .then(() => {
          return scriptJob.run(script)
        })
        .then(() => {
          return scriptJob.driver.getPageSource()
        })
        .then(source => {
          match = source.match(/127.0.0.1<\/strong> refused to connect./)
          return scriptJob.driver.quit()
        })
        .then(() => {
          if(match) {
            return true
          }
          else {
            throw new Error('Did not get expected page source of failure to connect with 127.0.0.1')
          }
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should run the script and get expected content in the page opened if a valid local url, valid values for all mandatory capabilities, and "local" capability were provided while creating the session, and a tunnel has been started before running the script', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://127.0.0.1:3000/tests/pages/tests.html', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome',
          'browserstack.local': true,
          'browserstack.localIdentifier': 'ut-bs-scriptjob'
        })
        var tunnel = new Tunnel({localIdentifier: 'ut-bs-scriptjob'})
        var match, savedSource
        return tunnel.start()
        .then(() => {
          expect(tunnel).to.not.be.null
          expect(tunnel.process.pid).to.not.be.undefined
          expect(tunnel.process.tunnelId).to.not.be.undefined
          expect(tunnel.process.tunnelId).to.equal('ut-bs-scriptjob')
          return scriptJob.create()
        })
        .then(() => {
          return scriptJob.run(script)
        })
        .then(() => {
          return scriptJob.driver.getPageSource()
        })
        .then(source => {
          savedSource = source
          utils.log.debug(source)
          match = source.match(/<h1>Hi, this is a page for testing cross\-browser\-tests\-runner<\/h1>/)
          return scriptJob.driver.quit()
        })
        .then(() => {
          return utils.ensureZeroTunnels()
        })
        .then(() => {
          if(!match && !savedSource.match(/127.0.0.1<\/strong> refused to connect./)) {
            throw new Error('Did not get expected page source or the source hinting at tunnel failure')
          }
          return true
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

    })

    describe('markStatus', function(){

      this.timeout(0)

      it('should fail if the session is not created yet', function() {
        var scriptJob = new ScriptJob()
        expect(()=>{scriptJob.markStatus()}).to.throw('Platforms.Core.ScriptJob: session not created yet to mark')
      })

      it('should mark the test status as passed in case no decider function was provided', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://www.google.com', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome'
        })
        return scriptJob.create()
        .then(() => {
          return scriptJob.markStatus()
        })
        .then(() => {
          return scriptJob.stop()
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should mark the test status as passed after running the script in case no decider function is provided', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://www.google.com', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome'
        })
        return scriptJob.create()
        .then(() => {
          return scriptJob.run(script)
        })
        .then(() => {
          return scriptJob.markStatus()
        })
        .then(() => {
          return scriptJob.stop()
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should successfully mark the test status even if the session is over', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://www.google.com', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome'
        })
        return scriptJob.create()
        .then(() => {
          return scriptJob.markStatus()
        })
        .then(() => {
          return scriptJob.stop()
        })
        .then(() => {
          return scriptJob.markStatus()
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should mark test status as failed in case the decider function throws an error', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://www.google.com', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome'
        })
        return scriptJob.create()
        .then(() => {
          return scriptJob.markStatus((driver, wd)=>{
            throw new Error('Random Error')
          })
        })
        .then(() => {
          return scriptJob.stop()
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should mark test status as failed in case the decider promise leads to a reject', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://www.google.com', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome'
        })
        return scriptJob.create()
        .then(() => {
          return scriptJob.markStatus((driver, wd)=>{
            return Promise.reject('Random Error')
          })
        })
        .then(() => {
          return scriptJob.stop()
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should mark test status as failed in case the decider promise is resolved with a falsy result', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://www.google.com', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome'
        })
        return scriptJob.create()
        .then(() => {
          return scriptJob.markStatus((driver, wd)=>{
            return Promise.resolve(false)
          })
        })
        .then(() => {
          return scriptJob.stop()
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should mark test status as passed in case the decider promise is resolved with a truthy result', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://www.google.com', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome'
        })
        return scriptJob.create()
        .then(() => {
          return scriptJob.markStatus((driver, wd)=>{
            return Promise.resolve(true)
          })
        })
        .then(() => {
          return scriptJob.stop()
        })
        .catch(err => {
          utils.log.error('error: ', err)
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

      it('should fail if the session is not created yet', function(){
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://www.google.com', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome'
        })
        expect(() => { return scriptJob.screenshot() }).to.throw('Platforms.Core.ScriptJob: session not created yet to take screenshot')
      })

      it('should work just after having created the session', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://www.google.com', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome'
        })
        var pngStr
        return scriptJob.create()
        .then(() => {
          return scriptJob.screenshot()
        })
        .then((str) => {
          pngStr = str
          return scriptJob.stop()
        })
        .then(() => {
          checkBase64(pngStr)
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should work after running test script', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://www.google.com', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome'
        })
        var pngStr
        return scriptJob.create()
        .then(() => {
          return scriptJob.run(script)
        })
        .then(() => {
          return scriptJob.screenshot()
        })
        .then((str) => {
          pngStr = str
          return scriptJob.stop()
        })
        .then(() => {
          checkBase64(pngStr)
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should fail after the session is over', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://www.google.com', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome'
        })
        return scriptJob.create()
        .then(() => {
          return scriptJob.run(script)
        })
        .then(() => {
          return scriptJob.stop()
        })
        .then(() => {
          return scriptJob.screenshot()
        })
        .should.be.rejectedWith('This driver instance does not have a valid session ID')
      })

    })

    describe('status', function() {

      this.timeout(0)

      it('should fail if the session is not created yet', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://www.google.com', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome'
        })
        expect(() => { return scriptJob.status() }).to.throw('Platforms.Core.ScriptJob: session not created yet to get status')
      })

      it('should say "running" just after creating the session', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://www.google.com', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome'
        })
        var status
        return scriptJob.create()
        .then(() => {
          return scriptJob.status()
        })
        .then(ret => {
          status = ret
          return scriptJob.stop()
        })
        .then(() => {
          expect(status).to.equal('running')
          return true
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should say "running" after running the script', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://www.google.com', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome'
        })
        var status
        return scriptJob.create()
        .then(() => {
          return scriptJob.run(script)
        })
        .then(() => {
          return scriptJob.status()
        })
        .then(ret => {
          status = ret
          return scriptJob.stop()
        })
        .then(() => {
          expect(status).to.equal('running')
          return true
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should say "stopped" for an unknown session (characterized by an invalid mocked up session id)', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://www.google.com', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome'
        })
        var status
        return scriptJob.create()
        .then(() => {
          scriptJob.session = 'abc'
          return scriptJob.run(script)
        })
        .then(() => {
          return scriptJob.status()
        })
        .then(ret => {
          status = ret
          return scriptJob.stop()
        })
        .then(() => {
          expect(status).to.equal('stopped')
          return true
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should say "stopped" for a session that is over', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://www.google.com', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome'
        })
        var status
        return scriptJob.create()
        .then(() => {
          return scriptJob.stop()
        })
        .then(() => {
          return scriptJob.status()
        })
        .then(ret => {
          status = ret
          expect(status).to.equal('stopped')
          return true
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should say "stopped" for a session that is over and was marked as passed', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://www.google.com', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome'
        })
        var status
        return scriptJob.create()
        .then(() => {
          return scriptJob.markStatus()
        })
        .then(() => {
          return scriptJob.status()
        })
        .then(ret => {
          status = ret
          return scriptJob.stop()
        })
        .then(() => {
          expect(status).to.equal('stopped')
          return true
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should say "stopped" for a session that is over and was marked as failed', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://www.google.com', {
          build: build.build,
          name: build.name,
          project: build.project,
          browser: 'Chrome'
        })
        var status
        return scriptJob.create()
        .then(() => {
          return scriptJob.markStatus(()=>{
            return Promise.resolve(false)
          })
        })
        .then(() => {
          return scriptJob.status()
        })
        .then(ret => {
          status = ret
          return scriptJob.stop()
        })
        .then(() => {
          expect(status).to.equal('stopped')
          return true
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

    })

  })

}
