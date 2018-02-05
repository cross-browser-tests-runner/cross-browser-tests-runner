'use strict';

var
  chai = require('chai'),
  spies = require('chai-spies'),
  chaiAsPromised = require('chai-as-promised'),
  platform = require('./../../../../../../lib/platforms/crossbrowsertesting/platform'),
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
  }

describe('stop', function() {

  var platform = new Platform()
  platform.stopMonitoring = true
  this.timeout(0)

  it('should fail for a non-existent run id', function() {
    function tester() {
      platform.stop('1909aoopopo=oioid')
    }
    expect(tester).to.throw('no such run 1909aoopopo=oioid found')
  })

  it('should successfully stop an ongoing run of test jobs that access a remote url', function() {
    var build = utils.buildDetails()
    return platform.runMultiple('http://www.piaxis.tech', [{
      os: 'Windows',
      osVersion: '8 Preview',
      browser: 'Chrome',
      browserVersion: '24.0'
    }, {
      os: 'Windows',
      osVersion: '10',
      browser: 'Edge',
      browserVersion: '16.0'
    }], {
      build: build.build,
      test: build.test,
      project: build.project
    })
    .then(run => {
      checkRun(run)
      return platform.stop(run.id)
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  if(process.version > 'v6') {
    it('should successfully stop an ongoing run of script jobs that access a remote url', function() {
      var build = utils.buildDetails()
      return platform.runScript('http://www.piaxis.tech', {
        os: 'OS X',
        osVersion: 'Sierra',
        browser: 'Safari',
        browserVersion: '10.0'
      }, {
        build: build.build,
        test: build.test,
        project: build.project
      },
      script)
      .then(run => {
        checkRun(run)
        return platform.stop(run.id)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })
  }

  it('should successfully take screenshots and stop an ongoing run of test jobs that access a remote url', function() {
    var build = utils.buildDetails()
    return platform.runMultiple('http://www.piaxis.tech', [{
      os: 'iOS',
      osVersion: '9.3',
      browser: 'Mobile Safari',
      browserVersion: '9.0',
      device: 'iPad Pro Simulator'
    }, {
      os: 'Android',
      osVersion: '4.4',
      browser: 'Chrome Mobile',
      browserVersion: '61.0',
      device: 'Android Galaxy Tab S'
    }], {
      build: build.build,
      test: build.test,
      project: build.project
    })
    .then(run => {
      checkRun(run)
      return platform.stop(run.id, true)
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  if(process.version > 'v6') {

    it('should successfully take screenshots and stop an ongoing run of script jobs that access a remote url', function() {
      var build = utils.buildDetails()
      return platform.runScript('http://www.piaxis.tech', {
        os: 'Windows',
        osVersion: '8.1',
        browser: 'Chrome',
        browserVersion: '40.0'
      }, {
        build: build.build,
        test: build.test,
        project: build.project
      },
      script)
      .then(run => {
        checkRun(run)
        return platform.stop(run.id, true)
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })
  }

  it('should successfully stop an ongoing run of test jobs that access a local url', function() {
    var build = utils.buildDetails()
    return platform.runMultiple('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', [{
      os: 'OS X',
      osVersion: 'Sierra',
      browser: 'Chrome x64',
      browserVersion: '58.0'
    }, {
      os: 'Windows',
      osVersion: '10',
      browser: 'Edge',
      browserVersion: '14.0'
    }], {
      local: true,
      build: build.build,
      test: build.test,
      project: build.project
    })
    .then(run => {
      checkRun(run)
      return platform.stop(run.id)
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

  if(process.version > 'v6') {
    it('should successfully stop an ongoing run of script jobs that access a local url', function() {
      var build = utils.buildDetails()
      return platform.runScript('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
        os: 'OS X',
        osVersion: 'El Capitan',
        browser: 'Firefox',
        browserVersion: '47.0'
      }, {
        local: true,
        localIdentifier: 'my-script-tunnel',
        build: build.build,
        test: build.test,
        project: build.project
      },
      script)
      .then(run => {
        checkRun(run)
        return platform.stop(run.id)
      })
      .then(() => {
        return utils.ensureZeroTunnels()
      })
      .catch(err => {
        //if(err.message.match(/is set to true but local testing through CrossBrowserTesting is not connected/)) {
          //utils.log.warn('tunnel got disconnected in the midst of the script run')
          //return true
        //}
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
    })
  }

  it('should successfully stop remaining running test jobs of a run that access a local url after one test job from the run is stopped manually', function() {
    var runId
    var build = utils.buildDetails()
    return platform.runMultiple('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', [{
      os: 'Android',
      osVersion: '5.0',
      browser: 'Dolphin Mobile',
      browserVersion: '11.5',
      device: 'Android Nexus 9'
    }, {
      os: 'Android',
      osVersion: '4.2',
      browser: 'Sleipnir Mobile',
      browserVersion: '3.5',
      device: 'Android Nexus 7'
    }], {
      local: true,
      build: build.build,
      test: build.test,
      project: build.project
    })
    .then(run => {
      checkRun(run)
      runId = run.id
      return platform.runs[runId].jobs[0].stop()
    })
    .then(() => {
      return platform.stop(runId)
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
