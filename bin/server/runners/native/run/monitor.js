'use strict'

let
  Bluebird = require('bluebird'),
  Log = require('./../../../../../lib/core/log').Log,
  coreUtils = require('./../../../../../lib/core/utils'),
  log = new Log('Server.Runners.Native.Tests.Monitor')

class Monitor {

  constructor(tests, running, manager) {
    this.tests = tests
    this.running = running
    this.manager = manager
    this.retries = [ ]
  }

  start() {
    this.checker = setTimeout(()=>{this._monitor()}, 2500)
  }

  _monitor() {
    this._processRunning()
    .then(numRunning => {
      let
        testsLeft = this.manager.countTests(),
        numToRetry = this.retries.length,
        done = !testsLeft && !numRunning && !numToRetry
      log.debug('tests left %d, running %d, to retry %d', testsLeft, numRunning, numToRetry)
      log.debug('have all tests run and completed? %s', done)
      if(done) {
        this.manager.close()
        .then(() => {
          // do nothing
        })
      }
      else {
        this._addNewRunsIfPossible(testsLeft, numRunning, numToRetry)
        this.checker = setTimeout(()=>{this._monitor()}, 2500)
      }
    })
    .catch(() => {
      this.checker = setTimeout(()=>{this._monitor()}, 2500)
    })
  }

  _processRunning() {
    let ret = this._runThruRunning()
    return Bluebird.all(ret.statusPromises)
    .then(results => {
      this._processRunningStatus(results, ret.runningTests)
      return this._countRunning()
    })
  }

  _runThruRunning() {
    let runningTests = [ ], statusPromises = [ ], completedTests = [ ]
    /* eslint-disable guard-for-in */
    for(let name in this.running) {
      let set = this.running[name]
      set.forEach(test => {
        if(test.nativeRunnerStopped) {
          completedTests.push(test)
        }
        else {
          statusPromises.push(test.status())
          runningTests.push(test)
        }
      })
    }
    /* eslint-enable guard-for-in */
    completedTests.forEach(test => {
      let set = this.running[test.nativeRunnerConfig.name]
      set.splice(set.indexOf(test), 1)
    })
    return {runningTests: runningTests, statusPromises: statusPromises}
  }

  _processRunningStatus(results, runningTests) {
    let completedTests = [ ]
    results.forEach((status, idx) => {
      let test = runningTests[idx]
      if(this.manager.isEarlyBird(test)) {
        this.manager.handleEarlyBird(test)
        completedTests.push(test)
      }
      else if('stopped' === status) {
        if('JS' !== test.nativeRunnerConfig.type) {
          completedTests.push(test)
        }
        else if(!test.nativeRunnerStopping) {
          if(!test.nativeRunnerConfig.sawStopped) {
            log.debug('test %s has been seen stopped once without being marked by native runner', test.serverId)
            test.nativeRunnerConfig.sawStopped = true
          }
          else {
            delete test.nativeRunnerConfig.sawStopped
            this._processJsTestRetries(test)
            completedTests.push(test)
          }
        }
      }
    })
    completedTests.forEach(test => {
      let set = this.running[test.nativeRunnerConfig.name]
      set.splice(set.indexOf(test), 1)
    })
  }

  _countRunning() {
    let sum = 0
    Object.keys(this.running).forEach(name => {
      sum += this.running[name].length
    })
    return sum
  }

  _processJsTestRetries(test) {
    let browser = test.nativeRunnerConfig.browser
    console.log(coreUtils.COLORS.FAIL + 'browser %s %s %s %s for url %s did not respond with results', browser.browser, browser.browserVersion || browser.device, browser.os, browser.osVersion, test.nativeRunnerConfig.url, coreUtils.COLORS.RESET, '\n')
    test.nativeRunnerConfig.retries = 'retries' in test.nativeRunnerConfig
      ? test.nativeRunnerConfig.retries - 1
      : this.manager.settings.retries || 0
    if(test.nativeRunnerConfig.retries) {
      log.debug('would be retrying test %s serverId %s after other tests finish (%d retries left)', test.id, test.serverId, test.nativeRunnerConfig.retries)
      this.retries.push(test)
    }
    else {
      log.debug('no retries left for test %s serverId %s', test.id, test.serverId)
      this.manager.passed = false
    }
  }

  _addNewRunsIfPossible(testsLeft, numRunning, numToRetry) {
    if(!numRunning || this.manager.runner.underCapacity()) {
      if(testsLeft) {
        this.manager.runner.pickAndRun() // Keep running at capacity
      }
      else if(numToRetry) {
        this.manager.runner.retry(this.retries)
      }
    }
  }

}

exports.Monitor = Monitor
