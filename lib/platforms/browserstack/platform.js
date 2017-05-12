let
  uuidv4 = require('uuid/v4'),
  Log = require('./../../core/log').Log,
  Bluebird = require('bluebird'),
  PlatformInterface = require('./../interfaces/platform').Platform,
  Test = require('./test').Test,
  Tunnel = require('./tunnel').Tunnel

let log = new Log(process.env.LOG_LEVEL || 'ERROR', 'Platforms.BrowserStack.Platform')

const VARS = {
  conversions: {
    browser: {
      os: 'os',
      osVersion: 'os_version',
      browser: 'browser',
      browserVersion: 'browser_version',
      device: 'device',
      orientation: 'deviceOrientation',
      size: 'resolution'
    },
    capabilities: {
      timeout: 'timeout',
      project: 'project',
      test: 'name',
      build: 'build',
      local: 'browserstack.local',
      localIdentifier: 'browserstack.localIdentifier',
      screenshots: 'browserstack.debug',
      video: 'browserstack.video'
    }
  },
  required: {
    browser: [ 'os', 'osVersion', 'browser', 'browserVersion' ],
    capabilities: [ ]
  },
  defaults: {
    browser: {
    },
    capabilities: {
      timeout: 60
    }
  }
}

class Platform extends PlatformInterface {

  constructor() {
    super()
    this.runs = { }
  }

  run(url, browser, capabilities) {
    log.debug('test %s %s %s', url, JSON.stringify(browser), JSON.stringify(capabilities))
    let capsOpts = parse(capabilities, 'capabilities')
    let browserOpts = parse(browser, 'browser')
    return createTest(url, browserOpts, capsOpts)
    .then(test => {
      return createRun(this, [ test ])
    })
  }

  runMultiple(url, browsers, capabilities) {
    log.debug('test %s %s %s', url, JSON.stringify(browsers), JSON.stringify(capabilities))
    let capsOpts = parse(capabilities, 'capabilities')
    let browsersOpts = browsers.map(browser => {
      return parse(browser, 'browser')
    })
    if(capabilities.local) {
      var tunnel
      if(capabilities.localIdentifier) {
        tunnel = new Tunnel({ localIdentifier: capabilities.localIdentifier })
      } else {
        tunnel = new Tunnel()
      }
      return tunnel.start()
      .then(() => {
        return multiple(this, url, browsersOpts, capsOpts)
      })
    } else {
      return multiple(this, url, browsersOpts, capsOpts)
    }
  }

  browserKeys(standard) {
    return converted('browser', standard)
  }

  capabilitiesKeys(standard) {
    return converted('capabilities', standard)
  }

  get required() {
    return VARS.required
  }
}

function parse(opts, which) {
  checkRequired(opts, VARS.required[which])
  checkUnallowed(opts, VARS.conversions[which])
  checkDefaults(opts, VARS.defaults[which])
  let out = { }
  Object.keys(opts).forEach(opt => {
    out[VARS.conversions[which][opt]] = opts[opt]
  })
  return out
}

function checkRequired(opts, required) {
  required.forEach(opt => {
    if (!(opt in opts)) {
      log.error('required option %s not specified', opt, opts)
      throw new Error('Platforms.BrowserStack.Platform: required option ' + opt + ' missing in ' + JSON.stringify(opts))
    }
  })
}

function checkUnallowed(opts, conversions) {
  Object.keys(opts).forEach(opt => {
    if(!(opt in conversions)) {
      log.error('option %s not allowed in %s', opt, JSON.stringify(opts))
      throw new Error('Platforms.BrowserStack.Platform: option ' + opt + ' is not allowed')
    }
  })
}

function checkDefaults(opts, defaults) {
  Object.keys(defaults).forEach(def => {
    if(!(def in opts)) {
      log.debug('setting default value for %s', def, defaults[def])
    }
  })
}

function createTest(url, browserOpts, capsOpts) {
  let options = Object.assign(browserOpts, capsOpts)
  options.url = url
  log.info('test %s', JSON.stringify(options))
  let test = new Test()
  return test.create(options)
}

function createRun(platform, tests) {
  let runId = uuidv4()
  platform.runs[runId] = tests
  log.info('new test run %s with %d test(s)', runId, tests.length)
  return { id : runId }
}

function multiple(platform, url, browsersOpts, capsOpts) {
  let promises = browsersOpts.map(browserOpts => {
    return createTest(url, browserOpts, capsOpts)
  })
  return Bluebird.all(promises)
  .then(tests => {
    return createRun(platform, tests)
  })
}

function converted(which, standard) {
  let out = { }
  standard.forEach(function(key) {
    out[key] = VARS.conversions[which][key]
  })
  return out
}

exports.Platform = Platform

if(process.env.UNIT_TESTS) {
  exports.PlatformVars = VARS
}
