'use strict';

var
  Bluebird = require('bluebird'),
  chai = require('chai'),
  spies = require('chai-spies'),
  chaiAsPromised = require('chai-as-promised'),
  platform = require('./../../../../../../lib/platforms/browserstack/platform'),
  Platform = platform.Platform,
  utils = require('./../utils')

chai.use(spies)
chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

function checkRun(run) {
  expect(run).to.not.be.undefined
  expect(run.id).to.not.be.undefined
  expect(run.id).to.be.a('string')
}

const
  script = (driver, webdriver) => {
    return driver.getTitle()
    .then(function(title) {
      utils.log.debug(title)
      return true
    })
  },
  badScript = (driver, webdriver) => {
    return driver.findElement({id : 'xyz'})
  }

if(process.version > 'v6') {

  describe('runScript', function() {

    var platform = new Platform()
    platform.stopMonitoring = true
    this.timeout(0)

    it('should fail if no input is provided', function() {
      return platform.runScript(undefined, undefined, undefined, script)
      .should.be.rejectedWith('required option browser missing')
    })

    it('should fail to create a run of a script session if required browser keys are not provided', function() {
      return platform.runScript('http://www.piaxis.tech', { }, { }, script)
      .should.be.rejectedWith('required option browser missing')
    })

    it('should fail to create a run of a script session if unsupported browser key is provided', function() {
      return platform.runScript('http://www.piaxis.tech', {
        abc: 123,
        os: 'Windows',
        osVersion: 'XP',
        browser: 'Chrome',
        browserVersion: '31.0'
      }, { }, script)
      .should.be.rejectedWith('option abc is not allowed')
    })

    it('should fail to create a run of a script session if unsupported capabilities key is provided', function() {
      return platform.runScript('http://www.piaxis.tech', {
        os: 'Windows',
        osVersion: 'XP',
        browser: 'Chrome',
        browserVersion: '31.0'
      }, {
        abc: 123
      }, script)
      .should.be.rejectedWith('option abc is not allowed')
    })

    it('should fail to create a run of a script session if script parameter is not a function', function() {
      expect(()=>{platform.runScript('http://www.piaxis.tech', {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0'
      }, {
      })})
      .to.throw('invalid script')
    })

    it('should create a run of a script session if a valid remote url and valid values for all mandatary parameters are provided', function() {
      var saveRun
      var build = utils.buildDetails()
      return platform.runScript('http://www.piaxis.tech', {
        os: 'Windows',
        osVersion: '8',
        browser: 'Firefox',
        browserVersion: '31.0'
      }, {
        build: build.build,
        test: build.test,
        project: build.project
      },
      script)
      .then(run => {
        checkRun(run)
        saveRun = run
        return new Promise(resolve => {
          setTimeout(()=>{resolve(true)}, 20000)
        })
      })
      .then(() => {
        return utils.safeStopScript(platform.runs[saveRun.id].scriptJobs[0])
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should create a run of a script session and tolerate the error thrown by the script if a valid remote url and valid values for all mandatory parameters are provided', function() {
      var saveRun
      var build = utils.buildDetails()
      return platform.runScript('http://www.piaxis.tech', {
        os: 'Windows',
        osVersion: '8.1',
        browser: 'Chrome',
        browserVersion: '48.0'
      }, {
        screenshots: true,
        build: build.build,
        test: build.test,
        project: build.project
      },
      badScript
      )
      .then(run => {
        checkRun(run)
        saveRun = run
        return new Promise(resolve => {
          setTimeout(()=>{resolve(true)}, 20000)
        })
      })
      .then(() => {
        return utils.safeStopScript(platform.runs[saveRun.id].scriptJobs[0])
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should create a run of a script session if a valid local url and valid values for all mandatory parameters are provided', function() {
      var build = utils.buildDetails()
      return platform.runScript('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
        os: 'OS X',
        osVersion: 'Mavericks',
        browser: 'Firefox',
        browserVersion: '35.0'
      }, {
        timeout: 60,
        build: build.build,
        test: build.test,
        project: build.project,
        local: true,
        localIdentifier: 'platform-run-scr-1',
        screenshots: true,
        video: true
      },
      script)
      .then(run => {
        checkRun(run)
        return utils.safeStopScript(platform.runs[run.id].scriptJobs[0])
      })
      .then(() => {
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        if(err.message.match(/is set to true but local testing through BrowserStack is not connected/)) {
          utils.log.warn('tunnel got disconnected in the midst of the script run')
          return true
        }
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  })

  describe('runScriptMultiple', function() {

    var platform = new Platform()
    platform.stopMonitoring = true
    this.timeout(0)

    it('should fail if no input is provided', function() {
      expect(()=>{platform.runScriptMultiple(undefined, undefined, undefined, script)})
      .to.throw('no browsers specified for runScriptMultiple')
    })

    it('should fail to create a run of script sessions if required browser keys are not provided', function() {
      return platform.runScriptMultiple('http://www.piaxis.tech', [{ }], { }, script)
      .should.be.rejectedWith('required option browser missing')
    })

    it('should fail to create a run of script sessions if script parameter provided is not of function type', function() {
      expect(()=>{platform.runScriptMultiple('http://www.piaxis.tech', [{
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0'
      }], {
      })})
      .to.throw('invalid script')
    })

    it('should create a run of script sessions if a valid remote url and valid values for all mandatory parameters are provided', function() {
      var saveRun
      var build = utils.buildDetails()
      return platform.runScriptMultiple('http://www.piaxis.tech', [{
        os: 'OS X',
        osVersion: 'El Capitan',
        browser: 'Chrome',
        browserVersion: '50.0'
      }, {
        os: 'Windows',
        osVersion: '10',
        browser: 'Firefox',
        browserVersion: '41.0'
      }], {
        build: build.build,
        test: build.test,
        project: build.project
      },
      script)
      .then(run => {
        checkRun(run)
        saveRun = run
        return new Promise(resolve => {
          setTimeout(()=>{resolve(true)}, 20000)
        })
      })
      .then(() => {
        let promises = [
          utils.safeStopScript(platform.runs[saveRun.id].scriptJobs[0]),
          utils.safeStopScript(platform.runs[saveRun.id].scriptJobs[1])
        ]
        return Bluebird.all(promises)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

    it('should create a run of script sessions and tolerate errors thrown by scripts run if a valid local url tests and valid values for all mandatory parameters are provided', function() {
      var saveRun
      var build = utils.buildDetails()
      return platform.runScriptMultiple('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', [{
        os: 'Windows',
        osVersion: 'XP',
        browser: 'Firefox',
        browserVersion: '30.0'
      }, {
        os: 'OS X',
        osVersion: 'Snow Leopard',
        browser: 'Chrome',
        browserVersion: '32.0'
      }], {
        build: build.build,
        test: build.test,
        project: build.project
      },
      badScript
      )
      .then(run => {
        checkRun(run)
        saveRun = run
        return new Promise(resolve => {
          setTimeout(()=>{resolve(true)}, 20000)
        })
      })
      .then(() => {
        let promises = [
          utils.safeStopScript(platform.runs[saveRun.id].scriptJobs[0]),
          utils.safeStopScript(platform.runs[saveRun.id].scriptJobs[1])
        ]
        return Bluebird.all(promises)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })

  })
}
