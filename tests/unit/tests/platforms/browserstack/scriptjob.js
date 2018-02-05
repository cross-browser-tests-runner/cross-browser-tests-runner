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

      it('should fail to create the session if an unsupported browser name is provided', function() {
        expect(()=>{new ScriptJob('http://google.com', {
          os: 'Windows',
          osVersion: '10',
          browser: 'SomeBrowser',
          browserVersion: '15.0'
        })})
        .to.throw('invalid browser "SomeBrowser" for osVersion "10" for os "Windows"')
      })

      it('should fail to create the session if an unsupported browser version is provided', function() {
        expect(()=>{new ScriptJob('http://google.com', {
          os: 'OS X',
          osVersion: 'El Capitan',
          browser: 'Chrome',
          browserVersion: '1.0'
        })})
        .to.throw('invalid version "1.0" for browser "Chrome" for osVersion "El Capitan" for os "OS X"')
      })

      it('should fail to create the session if unsupported OS details are provided', function() {
        expect(()=>{new ScriptJob('http://google.com', {
          browser: 'Chrome',
          browserVersion: '41.0',
          os: 'Linux',
          osVersion: '10.0'
        })})
        .to.throw('invalid os "Linux"')
      })

      it('should fail to create the session if unsupported OS version is provided', function() {
        expect(()=>{new ScriptJob('http://google.com', {
          browser: 'Chrome',
          browserVersion: '43.0',
          os: 'Windows',
          osVersion: 'NT'
        })})
        .to.throw('invalid osVersion "NT" for os "Windows"')
      })

      it('should create a session if supported browser and os details are provided', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://google.com', {
          browser: 'Chrome',
          browserVersion: '41.0',
          os: 'OS X',
          osVersion: 'Yosemite'
        }, {
          build: build.build,
          test: build.test,
          project: build.project
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
        var scriptJob = new ScriptJob('', {
          browser: 'Chrome',
          browserVersion: '46.0',
          os: 'OS X',
          osVersion: 'Yosemite'
        })
        expect(() => { return scriptJob.run() }).to.throw('Platforms.Core.ScriptJob: Driver not created yet')
      })

      it('should run the script if a valid remote url, valid values of all mandatory capabilities, and optional screenshot capability are provided', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://www.google.com', {
          browser: 'Firefox',
          browserVersion: '31.0',
          os: 'OS X',
          osVersion: 'Mavericks'
        }, {
          build: build.build,
          test: build.test,
          project: build.project,
          screenshots: true
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
        var scriptJob = new ScriptJob('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
          browser: 'Chrome',
          browserVersion: '40.0',
          os: 'Windows',
          osVersion: '10'
        }, {
          build: build.build,
          test: build.test,
          project: build.project
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
          match = source.match(/http:\/\/build\.cross\-browser\-tests\-runner\.org:3000\/tests\/pages\/tests.html is not available/)
          return scriptJob.driver.quit()
        })
        .then(() => {
          if(match) {
            return true
          }
          else {
            throw new Error('Did not get expected page source of failure to connect with build.cross-browser-tests-runner.org')
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
        var scriptJob = new ScriptJob('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
          browser: 'Firefox',
          browserVersion: '38.0',
          os: 'Windows',
          osVersion: '7'
        }, {
          build: build.build,
          test: build.test,
          project: build.project,
          local: true,
          localIdentifier: 'ut-bs-scriptjob'
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
          match = source.match(/<h1>Hi, this is a page for testing cross\-browser\-tests\-runner<\/h1>/)
          return scriptJob.driver.quit()
        })
        .then(() => {
          return utils.ensureZeroTunnels()
        })
        .then(() => {
          if(!match && !savedSource.match(/build.cross-browser-tests-runner.org<\/strong> refused to connect./)) {
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
        var scriptJob = new ScriptJob('', {
          browser: 'Chrome',
          browserVersion: '42.0',
          os: 'OS X',
          osVersion: 'Yosemite'
        })
        expect(()=>{scriptJob.markStatus()}).to.throw('Platforms.Core.ScriptJob: session not created yet to mark')
      })

      it('should mark the test status as passed in case no decider function was provided', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://www.google.com', {
          browser: 'Chrome',
          browserVersion: '42.0',
          os: 'OS X',
          osVersion: 'Yosemite'
        }, {
          build: build.build,
          test: build.test,
          project: build.project
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
          browser: 'Firefox',
          browserVersion: '39.0',
          os: 'OS X',
          osVersion: 'Sierra'
        }, {
          build: build.build,
          test: build.test,
          project: build.project
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
          browser: 'Chrome',
          browserVersion: '45.0',
          os: 'Windows',
          osVersion: '8.1'
        }, {
          build: build.build,
          test: build.test,
          project: build.project
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
          browser: 'Chrome',
          browserVersion: '37.0',
          os: 'OS X',
          osVersion: 'Snow Leopard'
        }, {
          build: build.build,
          test: build.test,
          project: build.project
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
          browser: 'Firefox',
          browserVersion: '32.0',
          os: 'OS X',
          osVersion: 'Lion'
        }, {
          build: build.build,
          test: build.test,
          project: build.project
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
          browser: 'Chrome',
          browserVersion: '39.0',
          os: 'OS X',
          osVersion: 'Yosemite'
        }, {
          build: build.build,
          test: build.test,
          project: build.project
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
          browser: 'Firefox',
          browserVersion: '39.0',
          os: 'OS X',
          osVersion: 'El Capitan'
        }, {
          build: build.build,
          test: build.test,
          project: build.project
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
          browser: 'Firefox',
          browserVersion: '39.0',
          os: 'Windows',
          osVersion: '8.1'
        }, {
          build: build.build,
          test: build.test,
          project: build.project
        })
        expect(() => { return scriptJob.screenshot() }).to.throw('Platforms.Core.ScriptJob: session not created yet to take screenshot')
      })

      it('should work just after having created the session', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://www.google.com', {
          browser: 'Chrome',
          browserVersion: '45.0',
          os: 'Windows',
          osVersion: '8.1'
        }, {
          build: build.build,
          test: build.test,
          project: build.project
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
          browser: 'Chrome',
          browserVersion: '40.0',
          os: 'OS X',
          osVersion: 'Mavericks'
        }, {
          build: build.build,
          test: build.test,
          project: build.project
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
          browser: 'Chrome',
          browserVersion: '36.0',
          os: 'OS X',
          osVersion: 'Mountain Lion'
        }, {
          build: build.build,
          test: build.test,
          project: build.project
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
          browser: 'Firefox',
          browserVersion: '38.0',
          os: 'OS X',
          osVersion: 'Yosemite'
        }, {
          build: build.build,
          test: build.test,
          project: build.project
        })
        expect(() => { return scriptJob.status() }).to.throw('Platforms.Core.ScriptJob: session not created yet to get status')
      })

      it('should say "running" just after creating the session', function() {
        var build = utils.buildDetails()
        var scriptJob = new ScriptJob('http://www.google.com', {
          browser: 'Chrome',
          browserVersion: '48.0',
          os: 'Windows',
          osVersion: '8'
        }, {
          build: build.build,
          test: build.test,
          project: build.project
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
          browser: 'Firefox',
          browserVersion: '45.0',
          os: 'Windows',
          osVersion: '10'
        }, {
          build: build.build,
          test: build.test,
          project: build.project
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
          browser: 'Chrome',
          browserVersion: '51.0',
          os: 'Windows',
          osVersion: '10'
        }, {
          build: build.build,
          test: build.test,
          project: build.project
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
          browser: 'Chrome',
          browserVersion: '35.0',
          os: 'Windows',
          osVersion: '7'
        }, {
          build: build.build,
          test: build.test,
          project: build.project
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
          browser: 'Firefox',
          browserVersion: '27.0',
          os: 'Windows',
          osVersion: 'XP'
        }, {
          build: build.build,
          test: build.test,
          project: build.project,
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
          browser: 'Chrome',
          browserVersion: '49.0',
          os: 'OS X',
          osVersion: 'El Capitan'
        }, {
          build: build.build,
          test: build.test,
          project: build.project
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
