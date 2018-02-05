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

describe('run', function() {

  var platform = new Platform()
  platform.stopMonitoring = true
  this.timeout(0)

  it('should fail if no input is provided', function() {
    return platform.run(undefined, undefined, undefined)
    .should.be.rejectedWith('required option browser missing')
  })

  it('should fail to create a run of a test job if required browser keys are not provided', function() {
    return platform.run('http://www.piaxis.tech', { }, { })
    .should.be.rejectedWith('required option browser missing')
  })

  it('should fail to create a run of a test job if an unsupported browser key is provided', function() {
    return platform.run('http://www.piaxis.tech', {
      abc: 123,
      os: 'Windows',
      osVersion: 'XP Service Pack 3',
      browser: 'Chrome',
      browserVersion: '21.0'
    }, { })
    .should.be.rejectedWith('option abc is not allowed')
  })

  it('should fail to create a run of a test job if an unsupported capabilities key is provided', function() {
    return  platform.run('http://www.piaxis.tech', {
      os: 'Windows',
      osVersion: 'XP Service Pack 2',
      browser: 'Chrome',
      browserVersion: '24.0'
    }, {
      abc: 123
    })
    .should.be.rejectedWith('option abc is not allowed')
  })

  it('should create a run of a test job if a valid remote url and valid values for all mandatory parameters are provided', function() {
    var build = utils.buildDetails()
    return platform.run('http://www.piaxis.tech', {
      os: 'Windows',
      osVersion: '10',
      browser: 'Chrome',
      browserVersion: '52.0'
    }, {
      build: build.build,
      test: build.test,
      project: build.project
    })
    .then(run => {
      checkRun(run)
      return utils.safeKillJob(platform.runs[run.id].jobs[0])
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should create a run of a test job if a valid local url, valid values for all mandatory parameters, and few optional capabilities are provided', function() {
    var build = utils.buildDetails()
    return platform.run('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
      os: 'OS X',
      osVersion: 'Sierra',
      browser: 'Opera',
      browserVersion: '47.0'
    }, {
      timeout: 60,
      local: true,
      localIdentifier: 'my-tunnel',
      video: true,
      build: build.build,
      test: build.test,
      project: build.project
    })
    .then(run => {
      checkRun(run)
      return utils.safeKillJob(platform.runs[run.id].jobs[0])
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

  it('should create a run of a test job for native runner case if a valid local url, valid values for all mandatory parameters, and few optional capabilities are provided', function() {
    var build = utils.buildDetails()
    return platform.run('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', {
      os: 'Ubuntu',
      osVersion: 'Vivid',
      browser: 'Chromium',
      browserVersion: '48.0'
    }, {
      timeout: 60,
      local: true,
      video: true,
      build: build.build,
      test: build.test,
      project: build.project
    },
    true)
    .then(run => {
      checkRun(run)
      return utils.safeKillJob(platform.runs[run.id].jobs[0])
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

  it('should create a run of a test job for native runner case if a valid local url ending in ?, valid values for all mandatory parameters, and few optional capabilities are provided', function() {
    var build = utils.buildDetails()
    return platform.run('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html?', {
      os: 'OS X',
      osVersion: 'Mavericks',
      browser: 'Firefox',
      browserVersion: '34.0'
    }, {
      timeout: 60,
      local: true,
      localIdentifier: 'my-tunnel-1',
      video: true,
      build: build.build,
      test: build.test,
      project: build.project
    },
    true)
    .then(run => {
      checkRun(run)
      return utils.safeKillJob(platform.runs[run.id].jobs[0])
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

describe('runMultiple', function() {

  var platform = new Platform()
  platform.stopMonitoring = true
  this.timeout(0)

  it('should fail if no input is provided', function() {
    return platform.runMultiple(undefined, undefined, undefined)
    .should.be.rejectedWith('no browsers specified for createMultiple')
  })

  it('should fail to create a run of test jobs if required keys are not provided in even one of the input browsers', function() {
    return platform.runMultiple('http://www.piaxis.tech', [{
      os: 'Windows',
      osVersion: '10',
      browser: 'Chrome',
      browserVersion: '55.0'
    }, {
      os: 'Windows'
    }], { })
    .should.be.rejectedWith('required option browser missing')
  })

  it('should fail to create a run of test jobs if an unsupported key is provided in even one of the input browsers', function() {
    return platform.runMultiple('http://www.piaxis.tech', [{
      os: 'Windows',
      osVersion: 'XP Service Pack 2',
      browser: 'Chrome',
      browserVersion: '31.0'
    }, {
      os: 'Windows',
      osVersion: '7 64-bit',
      browser: 'Chrome',
      browserVersion: '31.0',
      abc: 123
    }], { })
    .should.be.rejectedWith('option abc is not allowed')
  })

  it('should fail to create a run of tests jobs if an unsupported capabilities key is provided', function() {
    return platform.runMultiple('http://www.piaxis.tech', [{
      os: 'Windows',
      osVersion: 'XP Service Pack 3',
      browser: 'Chrome',
      browserVersion: '35.0'
    }], {
      abc: 123
    })
    .should.be.rejectedWith('option abc is not allowed')
  })

  it('should create a run of test jobs if a valid remote url and valid values for all mandatory parameters are provided', function() {
    var runId
    var build = utils.buildDetails()
    return platform.runMultiple('http://www.piaxis.tech', [{
      os: 'Windows',
      osVersion: '7 64-bit',
      browser: 'Firefox',
      browserVersion: '33.0'
    }, {
      os: 'OS X',
      osVersion: 'Yosemite',
      browser: 'Safari',
      browserVersion: '8.0'
    }], {
      build: build.build,
      test: build.test,
      project: build.project
    })
    .then(run => {
      checkRun(run)
      runId = run.id
      return Promise.all([
        utils.safeKillJob(platform.runs[runId].jobs[0]),
        utils.safeKillJob(platform.runs[runId].jobs[1])
      ])
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should create a run of test jobs if a valid local url and valid values for all mandatory parameters are provided', function() {
    var runId
    var build = utils.buildDetails()
    return platform.runMultiple('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html', [{
      os: 'Windows',
      osVersion: '8.1',
      browser: 'Internet Explorer',
      browserVersion: '11.0'
    }, {
      os: 'OS X',
      osVersion: 'Sierra',
      browser: 'Opera',
      browserVersion: '46.0'
    }], {
      local: true,
      build: build.build,
      test: build.test,
      project: build.project
    })
    .then(run => {
      checkRun(run)
      runId = run.id
      return Promise.all([
        utils.safeKillJob(platform.runs[runId].jobs[0]),
        utils.safeKillJob(platform.runs[runId].jobs[1])
      ])
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

  it('should create a run of test jobs for native runner case if a valid local url containing query parameters, and valid values for all mandatory parameters are provided', function() {
    var runId
    var build = utils.buildDetails()
    return platform.runMultiple('http://build.cross-browser-tests-runner.org:3000/tests/pages/tests.html?_=1414190941', [{
      os: 'OS X',
      osVersion: 'El Capitan',
      browser: 'Camino',
      browserVersion: '2.1'
    }, {
      os: 'Windows Phone',
      osVersion: '8',
      browser: 'IE Mobile',
      browserVersion: '10.0',
      device: 'Win Phone 8 Simulator'
    }], {
      local: true,
      localIdentifier: 'my-mult-tunnel',
      build: build.build,
      test: build.test,
      project: build.project
    },
    true)
    .then(run => {
      checkRun(run)
      runId = run.id
      return Promise.all([
        utils.safeKillJob(platform.runs[runId].jobs[0]),
        utils.safeKillJob(platform.runs[runId].jobs[1])
      ])
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
