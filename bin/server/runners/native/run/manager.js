'use strict'

let
  Bluebird = require('bluebird'),
  Log = require('./../../../../../lib/core/log').Log,
  log = new Log('Server.Runners.Native.Tests.Manager'),
  Creator = require('./creator').Creator,
  Runner = require('./runner').Runner,
  Monitor = require('./monitor').Monitor,
  UrlParser = require('./urlparser').UrlParser

class Manager {

  constructor(settings) {
    this.settings = settings
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

  end(req, res) {
    if('POST' === req.method && UrlParser.isValid(req)) {
      const run = UrlParser.run(req)
      if(run && this._runExists(run)) {
        const testId = UrlParser.test(req)
        let test
        if(testId && null !== (test = this._findTest(testId))) {
          if(!test.nativeRunnerStopped) {
            const takeScreenshot = this.settings.capabilities[test.nativeRunnerConfig.name].screenshots
            setTimeout(()=>{
              stopTest(test, takeScreenshot)
            }, 3000)
            return false
          }
          else {
            log.warn('test %s for run %s is not running, cannot end', testId, run)
            res.sendStatus(404)
          }
        }
        else {
          log.warn('unknown test %s for run %s (404)', testId, run)
          res.sendStatus(404)
        }
      }
      else {
        log.warn('unknown run %s (404)', run)
        res.sendStatus(404)
      }
      return true
    }
    return false
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
      completed()
    })
    .catch(err => {
      log.error('failed closing platforms %s', err)
      completed()
    })
  }

}

function stopTest(test, takeScreenshot) {
  handleScreenshot(test, takeScreenshot)
  .then(() => {
    return test.stop()
  })
  .then(() => {
    test.nativeRunnerStopped = true
  })
  .catch(err => {
    log.warn('encountered error while stopping test %s', err)
    test.nativeRunnerStopped = true
  })
}

function handleScreenshot(test, takeScreenshot) {
  if(takeScreenshot) {
    return test.screenshot()
  }
  else {
    return Promise.resolve(true)
  }
}

function completed() {
  console.log('completed all tests')
  /* eslint-disable no-process-exit */
  process.exit(0)
  /* eslint-enable no-process-exit */
}

exports.Manager = Manager
