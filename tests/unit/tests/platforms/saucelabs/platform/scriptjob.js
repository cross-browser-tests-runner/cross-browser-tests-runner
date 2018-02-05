'use strict';

var
  Bluebird = require('bluebird'),
  chai = require('chai'),
  spies = require('chai-spies'),
  chaiAsPromised = require('chai-as-promised'),
  platform = require('./../../../../../../lib/platforms/saucelabs/platform'),
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

    it('should fail to create a run of a script session if no input is provided', function() {
      return platform.runScript(undefined, undefined, undefined, script)
      .should.be.rejectedWith('required option browser missing')
    })

    it('should fail to create a run of a script session if required browser keys are not provided', function() {
      return platform.runScript('http://www.piaxis.tech', { }, { }, script)
      .should.be.rejectedWith('required option browser missing')
    })

    it('should fail to create a run of a script session if an unsupported browser key is provided', function() {
      return platform.runScript('http://www.piaxis.tech', {
        abc: 123,
        os: 'Windows',
        osVersion: '7',
        browser: 'Chrome',
        browserVersion: '31.0'
      }, { }, script)
      .should.be.rejectedWith('option abc is not allowed')
    })

    it('should fail to create a run of a script session if an unsupported capabilities key is provided', function() {
      return platform.runScript('http://www.piaxis.tech', {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '51.0'
      }, {
        abc: 123
      }, script)
      .should.be.rejectedWith('option abc is not allowed')
    })

    it('should fail to create a run of a script session if the script parameter is not of function type', function() {
      expect(()=>{ platform.runScript('http://www.piaxis.tech', {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0'
      }, {
      })})
      .to.throw('invalid script')
    })

    it('should create a run of a script session if a remote url and valid values for all mandatory parameters are provided', function() {
      var saveRun
      var build = utils.buildDetails()
      return platform.runScript('http://www.piaxis.tech', {
        os: 'Android',
        osVersion: '4.4',
        browser: 'Android Browser',
        browserVersion: null,
        device: 'LG Nexus 4 GoogleAPI Emulator'
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

    it('should create a run of a script session and tolerate errors thrown by the script if a remote url and valid values for all mandatory parameters are provided', function() {
      var saveRun
      var build = utils.buildDetails()
      return platform.runScript('http://www.piaxis.tech', {
        os: 'iOS',
        osVersion: '9.3',
        browser: 'Mobile Safari',
        browserVersion: null,
        device: 'iPhone 6s Plus Simulator'
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

    it('should create a run of a script session if a local url and valid values for all mandatory parameters are provided', function() {
      var build = utils.buildDetails()
      return platform.runScript('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
        os: 'Windows',
        osVersion: '8',
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

    it('should fail to create a run of script sessions if no input is provided', function() {
      expect(()=>{platform.runScriptMultiple(undefined, undefined, undefined, script)})
      .to.throw('no browsers specified for runScriptMultiple')
    })

    it('should fail to create a run of script sessions if required browser keys are not provided', function() {
      return platform.runScriptMultiple('http://www.piaxis.tech', [{ }], { }, script)
      .should.be.rejectedWith('required option browser missing')
    })

    it('should fail to create a run of script sessions if script parameter is not of function type', function() {
      expect(()=>{platform.runScriptMultiple('http://www.piaxis.tech', [{
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '45.0'
      }], {
      })})
      .to.throw('invalid script')
    })

    it('should create a run of script sessions if a remote url and valid values for all mandatory parameters are provided', function() {
      var saveRun
      var build = utils.buildDetails()
      return platform.runScriptMultiple('http://www.piaxis.tech', [{
        os: 'Windows',
        osVersion: '8',
        browser: 'Chrome',
        browserVersion: '35.0'
      }, {
        os: 'OS X',
        osVersion: 'Sierra',
        browser: 'Firefox',
        browserVersion: '47.0'
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

    it('should create a run of script sessions and tolerate errors thrown by the script if a local url and valid values for all mandatory parameters are provided', function() {
      var saveRun
      var build = utils.buildDetails()
      return platform.runScriptMultiple('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', [{
        os: 'OS X',
        osVersion: 'Mavericks',
        browser: 'Chrome',
        browserVersion: '39.0'
      }, {
        os: 'Windows',
        osVersion: '7',
        browser: 'Firefox',
        browserVersion: '41.0'
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
