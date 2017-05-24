#!/usr/bin/env node

'use strict'

let
  args = require('minimist')(process.argv.slice(2), {
    string: [ 'osVersion', 'browserVersion' ],
    boolean: [ 'local', 'screenshots', 'video' ],
    alias: { config: 'c'},
    default: { 'browserVersion' : null }
  }),
  request = require('request-promise'),
  uuidv4 = require('uuid/v4'),
  /* eslint-disable global-require */
  log = new (require('./../../../../lib/core/log').Log)(process.env.LOG_LEVEL || 'ERROR', 'Hooks.Testem.BrowserStack.Browser'),
  /* eslint-enable global-require */
  PlatformKeys = require('./../../../../lib/platforms/interfaces/platform').PlatformKeys,
  CiFactory = require('./../../../../lib/ci/factory').Factory

log.debug('Arguments received', args)

args.local = true

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

let
  data = {
    url : args._[0],
    browser : { },
    capabilities : { }
  }

Object.keys(args).forEach(opt => {
  if (-1 !== PlatformKeys.browser.indexOf(opt)) {
    data.browser[opt] = args[opt]
  }
  else
  if (-1 !== PlatformKeys.capabilities.indexOf(opt)) {
    data.capabilities[opt] = args[opt]
  }
})

/* eslint-disable global-require */
const
  settings = require('./../../../server/settings')(args.config)
/* eslint-enable global-require */

let run

request
  .post('http://' + settings.host + ':' + settings.port + '/runs/testem/browserstack',
    { body: data, json: true })
  .then(response => {
    run = response.id
    setupExit()
    console.log('created test %s', response.id)
  })
  .catch(err => {
    log.error('failed to create test - %s', err)
  })

function setupExit() {
  ['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(function(sig) {
    process.on(sig, function() {
      log.info('received exit signal %s', sig)
      stopRunExit()
    })
  })
  // set up a default exit timeout of 1 hour
  setTimeout(stopRunExit, 3600000)
}

function stopRunExit() {
  /* eslint-disable no-process-exit */
  request
    .delete('http://' + settings.host + ':' + settings.port + '/runs/testem/browserstack/' + run,
      { body: { screenshot: args.screenshots }, json: true })
    .then(res => {
      log.info('stopped run %s, exiting...', run)
      process.exit(0)
    })
    .catch(err => {
      log.warn('failed to stop run %s %s, exiting...', run, err)
      process.exit(1)
    })
  /* eslint-enable no-process-exit */
}
