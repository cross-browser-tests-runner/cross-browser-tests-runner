'use strict'

let
  Bluebird = require('bluebird'),
  utils = require('./../../../../../lib/core/utils'),
  Log = require('./../../../../../lib/core/log').Log,
  log = new Log('Server.Runners.Native.Tests.Manager'),
  Creator = require('./creator').Creator,
  Runner = require('./runner').Runner,
  Monitor = require('./monitor').Monitor,
  UrlParser = require('./urlparser').UrlParser

class Manager {

  constructor(settings) {
    this.settings = settings
    this.earlyBirds = { }
    this.passed = true
  }

  start() {
    if(this.settings.browsers && this.settings.capabilities && this.settings.test_file) {
      let creator = new Creator(this.settings)
      creator.create()
      this.names = creator.names
      this.platforms = creator.platforms
      this.tests = creator.tests
    }
    if(this.countTests()) {
      return this._run()
      .then(() => {
        let monitor = new Monitor(this.tests, this.running, this)
        monitor.start()
        return true
      })
    }
    else {
      console.log('no tests found in settings')
      return Promise.resolve(true)
    }
  }

  _run() {
    let error
    return Bluebird.all(this.names.map(name => {
      return this.platforms[name].open([this.settings.capabilities[name]])
    }))
    .then(() => {
      this.runner = new Runner(this.settings, this.names, this.platforms, this.tests)
      return this.runner.pickAndRun()
    })
    .then(running => {
      this.running = running
      return true
    })
    .catch(err => {
      log.error('could not start tests cleanly!')
      log.error('attempting to close the platforms and exit cleanly... please wait!')
      error = err
      return Bluebird.all(this.names.map(name => {
        return this.platforms[name].close()
      }))
    })
    .then(() => {
      if(error) {
        throw error
      }
    })
  }

  countTests() {
    if(!this.tests) {
      return 0
    }
    let sum = 0
    Object.keys(this.tests).forEach(name => {
      Object.keys(this.tests[name]).forEach(type => {
        this.tests[name][type].forEach(config => {
          sum += (this.settings.browsers[name][type].length - config.browserIndex)
        })
      })
    })
    return sum
  }

  status() {
    return (this.runner && this.runner.status())
  }

  end(req, res, passed) {
    if(invalidQueryParams(req, res)) {
      return
    }
    const run = UrlParser.run(req), testId = UrlParser.test(req), test = this._findTest(testId)
    if(unknownRun(this, run, res) || unknownTest(test, testId, run, res)) {
      this.earlyBirds[run] = this.earlyBirds[run] || { }
      this.earlyBirds[run][testId] = { passed: passed }
      return
    }
    if(alreadyStopped(test, testId, run, res)) {
      return
    }
    this.scheduleStop(test, passed)
    res.json()
  }

  scheduleStop(test, passed) {
    if(!passed) {
      this.passed = false
    }
    const takeScreenshot = this.settings.capabilities[test.nativeRunnerConfig.name].screenshots
    setTimeout(()=>{
      stopTest(test, takeScreenshot, passed)
    }, 500)
  }

  isEarlyBird(test) {
    let run = test.nativeRunnerConfig.run, testId = test.serverId
    return (this.earlyBirds[run] && testId in this.earlyBirds[run])
  }

  handleEarlyBird(test) {
    let run = test.nativeRunnerConfig.run, testId = test.serverId
    log.debug('scheduling stopping of early bird run %s test %s', run, testId)
    this.scheduleStop(test, this.earlyBirds[run][testId].passed)
  }

  _runExists(run) {
    /* eslint-disable guard-for-in */
    for(let name in this.running) {
      for(let idx = 0; idx < this.running[name].length; ++idx) {
        let test = this.running[name][idx]
        if(run === test.nativeRunnerConfig.run) {
          return true
        }
      }
    }
    /* eslint-enable guard-for-in */
    return false
  }

  _findTest(testId) {
    /* eslint-disable guard-for-in */
    for(let name in this.running) {
      for(let idx = 0; idx < this.running[name].length; ++idx) {
        let test = this.running[name][idx]
        if(testId === test.serverId) {
          return test
        }
      }
    }
    /* eslint-enable guard-for-in */
    return null
  }

  close() {
    return Bluebird.all(this.names.map(name => {
      return this.platforms[name].close()
    }))
    .then(() => {
      completed(this.passed ? 0 : 1)
    })
    .catch(err => {
      log.error('failed closing platforms %s', err)
      completed(1)
    })
  }

}

function invalidQueryParams(req, res) {
  if(!UrlParser.isValid(req)) {
    log.warn('invalid query %s (400)', JSON.stringify(req.query))
    res.sendStatus(400)
    return true
  }
  return false
}

function unknownRun(manager, run, res) {
  if(!manager._runExists(run)) {
    log.warn('unknown run %s (404)', run)
    res.sendStatus(404)
    return true
  }
  return false
}

function unknownTest(test, testId, run, res) {
  if(null === test) {
    log.warn('unknown test %s for run %s (404)', testId, run)
    res.sendStatus(404)
    return true
  }
  return false
}

function alreadyStopped(test, testId, run, res) {
  if(test.nativeRunnerStopped) {
    log.warn('test %s for run %s is not running, cannot end', testId, run)
    res.sendStatus(404)
    return true
  }
  return false
}

function stopTest(test, takeScreenshot, passed) {
  const postStop = () => {
    test.nativeRunnerStopped = true
    delete test.nativeRunnerStopping
  }
  test.nativeRunnerStopping = true
  handleScreenshot(test, takeScreenshot)
  .then(() => {
    return test.stop(passed)
  })
  .then(postStop)
  .catch(postStop)
}

function handleScreenshot(test, takeScreenshot) {
  if(takeScreenshot) {
    return test.screenshot()
  }
  else {
    return Promise.resolve(true)
  }
}

function completed(code) {
  if(0 === code) {
    console.log(utils.COLORS.OK + 'all tests ran and passed' + utils.COLORS.RESET)
  } else {
    console.log(utils.COLORS.FAIL + 'run of tests was unsuccessful' + utils.COLORS.RESET)
  }
  /* eslint-disable no-process-exit */
  process.exit(code)
  /* eslint-enable no-process-exit */
}

exports.Manager = Manager
