'use strict'

let
  uuidv4 = require('uuid/v4'),
  Bluebird = require('bluebird'),
  Log = require('./../../../../../lib/core/log').Log,
  log = new Log(process.env.LOG_LEVEL || 'ERROR', 'Server.Runners.Native.Tests.Manager'),
  Factory = require('./../../../../../lib/platforms/factory').Factory,
  Test = require('./test').Test

class Manager {

  constructor(settings) {
    this.settings = settings
  }

  start() {
    if(this.settings.browsers && this.settings.capabilities && this.settings.test_file) {
      this.names = select(this.settings)
      this.platforms = getPlatforms(this.names)
      this.run = uuidv4()
      this.tests = createTests(this.settings, this.names, this.run)
      return startTests(this.settings, this.names, this.tests, this.platforms)
      .then(() => {
        this.checker = setInterval(() => { this.monitor() }, 5000)
        log.debug('created and started tests')
        return true
      })
    }
    else {
      log.debug('no tests inferred from settings')
      return Promise.resolve(true)
    }
  }

  monitor() {
    let done = true
    Object.keys(this.tests).forEach(id => {
      if('stopped' !== this.tests[id].status) {
        done = false
      }
    })
    log.debug('monitor: have all tests stopped? %s', done)
    if(done) {
      this.close()
      .then(() => {
        // do nothing
      })
    }
  }

  end(req, res, settings) {
    if('POST' === req.method && Test.checkUrl(req)) {
      const run = Test.runParam(req)
      if(this.run === run) {
        const testId = Test.testParam(req)
        if(testId && this.tests[testId]) {
          let test = this.tests[testId]
          if('started' === test.status) {
            const takeScreenshot = settings.capabilities[test.on].JS.screenshots
            setTimeout(function() {test.stop(takeScreenshot)}, 3000)
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

function select(settings) {
  const all = Object.keys(settings.browsers)
  let names = [ ]
  all.forEach(name => {
    if(!settings.browsers[name].JS) {
      log.warn('no "JS" testing browsers specified for %s, ignoring it...', name)
    }
    else {
      names.push(name)
    }
  })
  return names
}

function getPlatforms(names) {
  let platforms = { }
  names.forEach(name => {
    platforms[name] = Factory.get(name.toLowerCase())
  })
  return platforms
}

function createTests(settings, names, run) {
  let tests = { }
  const
    testFiles = 'string' === typeof(settings.test_file) ? [ settings.test_file ] : settings.test_file,
    host = 'http://' + settings.server.host + ':' + settings.server.port
  names.forEach(name => {
    const capabilities = settings.capabilities[name].JS
    settings.browsers[name].JS.forEach(browser => {
      testFiles.forEach(testFile => {
        let test = new Test(name, host, testFile, run, browser, capabilities, settings.retries)
        tests[test.id] = test
      })
    })
  })
  return tests
}

function startTests(settings, names, tests, platforms) {
  return Bluebird.all(names.map(name => {
    return platforms[name].open([settings.capabilities[name].JS])
  }))
  .then(() => {
    return Bluebird.all(Object.keys(tests).map(id => {
      return tests[id].run(platforms[tests[id].on])
    }))
  })
}

function completed() {
  console.log('completed all tests')
  /* eslint-disable no-process-exit */
  process.exit(0)
  /* eslint-enable no-process-exit */
}

exports.Manager = Manager
