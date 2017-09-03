'use strict'

const
  allowedOptions = [ '--config', '--help', '--os', '--osVersion', '--browser', '--browserVersion', '--device', '--orientation', '--size', '--timeout', '--project', '--test', '--build', '--local', '--localIdentifier', '--screenshots', '--video', '--framework' ]

let
  path = require('path'),
  utils = require('./../../../utils'),
  args = require('minimist')(process.argv.slice(2), {
    string: [ 'config', 'os', 'osVersion', 'browser', 'browserVersion', 'device', 'orientation', 'size', 'project', 'test', 'build', 'localIdentifier', 'framework' ],
    boolean: [ 'local', 'screenshots', 'video', 'help' ],
    alias: { help: 'h' },
    default: { browserVersion : null, timeout: 60, local: true },
    unknown: opt => {
      return utils.onUnknownOpt(-1 !== allowedOptions.indexOf(opt) || opt.match(/^http/), opt, help)
    }
  })

const
  helpArgsLine =
    ' [--help|-h] [--config <config-file>]' +
    ' [--os <os>] [--osVersion <os-version>]' +
    ' [--browser <browser>] [--browserVersion <browser-version>] [--device <device> ]' +
    ' [--orientation <orientation>] [--size <size>]' +
    ' [--local] [--localIdentifier <identifier>]' +
    ' [--video] [--screenshots]' +
    ' [--timeout <timeout-in-sec>]' +
    ' [--framework <test-framework>]' +
    ' [--project <project>] [--test <test>] [--build <build>]\n\n',
  helpDefs =
    'Defaults:\n' +
    ' config            cbtr.json in project root, or CBTR_SETTINGS env var\n' +
    ' browserVersion    null\n' +
    ' timeout           60\n' +
    ' video             false\n' +
    ' screenshots       false\n' +
    ' local             true\n\n',
  helpOpts =
    'Options:\n' +
    ' help              print this help\n' +
    ' config            cross-browser-tests-runner settings file\n' +
    ' os                operating system for a test e.g. Windows\n' +
    ' osVersion         operating system version for a test e.g. 10 (for Windows)\n' +
    ' browser           browser for a test e.g. Firefox\n' +
    ' browserVersion    browser version for a test e.g. 43.0\n' +
    ' device            device for mobile os case e.g. iPhone 5\n' +
    ' orientation       portrait|landscape, for mobile os case\n' +
    ' size              screen size, for mobile os case\n' +
    ' local             if a local page is being tested [forced as true for now]\n' +
    ' localIdentifier   id of tunnel, used in case multiple tunnels are required\n' +
    ' video             whether video of the test should be recorded\n' +
    ' screenshots       whether screenshots of the test should be recorded\n' +
    ' timeout           timeout at which test would be stopped by cross-browser testing platform\n' +
    ' framework         framework used for the test (as of now needed only for SauceLabs)\n' +
    ' project           name of project (username/repository or any other format)\n' +
    ' test              name of test e.g. CI job id\n' +
    ' build             name of build, typically the commit sha1'

utils.handleHelp(args, help)

let
  request = require('request-promise'),
  uuidv4 = require('uuid/v4'),
  Log = require('./../../../../lib/core/log').Log,
  PlatformKeys = require('./../../../../lib/platforms/interfaces/platform').PlatformKeys,
  CiFactory = require('./../../../../lib/ci/factory').Factory,
  log = new Log('Hooks.Testem.Common.Browser')

const
  settings = require('./../../../server/settings')(args.config),
  signals = ['SIGINT', 'SIGHUP', 'SIGTERM']

const main = (platform) => {
  log.debug('Arguments received', args)
  log.debug('settings', settings)
  let data = {
    url : args._[0],
    browser : { },
    capabilities : { }
  }
  setupNomenclature()
  setupInput(data)
  let run
  request
  .post('http://' + settings.server.host + ':' + settings.server.port + '/runs/testem/' + platform, {
    body: data, json: true
  })
  .then(response => {
    run = response.id
    setupExit(platform, run)
    console.log('created test %s', response.id)
  })
  .catch(err => {
    log.error('failed to create test - %s', err)
  })
}

function setupNomenclature() {
  if(buildNotSpecified()) {
    try {
      let Ci = CiFactory.get()
      args.project = Ci.project
      args.test = Ci.session
      args.build = Ci.commit
    }
    catch(err) {
      log.debug('ignore failure of CI env detection %s', err)
      args.project = 'anonymous/anonymous'
      args.test = uuidv4()
      args.build = 'unknown build'
    }
  }
}

function buildNotSpecified() {
  return !(args.project && args.test && args.build)
}

function setupInput(data) {
  Object.keys(args).forEach(opt => {
    if (-1 !== PlatformKeys.browser.indexOf(opt)) {
      data.browser[opt] = args[opt]
    }
    else
    if (-1 !== PlatformKeys.capabilities.indexOf(opt)) {
      data.capabilities[opt] = args[opt]
    }
  })
}

function setupExit(platform, run) {
  // set up a default exit timeout of 1 hour
  let timer = setTimeout(()=>{stopRunExit(platform, run)}, 3600000)
  signals.forEach(sig => {
    process.on(sig, () => {
      log.info('received exit signal %s', sig)
      clearTimeout(timer)
      stopRunExit(platform, run)
    })
  })
}

function stopRunExit(platform, run) {
  request
  .delete('http://' + settings.server.host + ':' + settings.server.port + '/runs/testem/' + platform + '/' + run, {
    body: { screenshot: args.screenshots }, json: true
  })
  .then(() => {
    log.info('stopped run %s, exiting...', run)
    process.exitCode = 0
  })
}

function help() {
  console.log(
    '\n' +
    path.basename(process.argv[1]) + helpArgsLine + helpDefs + helpOpts
  )
}

exports.run = main
