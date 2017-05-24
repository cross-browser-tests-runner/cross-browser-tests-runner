#!/usr/bin/env node

'use strict'

let
  args = require('minimist')(process.argv.slice(2), {
    string: [ 'localIdentifier' ],
    boolean: [ 'local' ],
    alias: { config: 'c'}
  }),
  request = require('request-promise'),
  /* eslint-disable global-require */
  log = new (require('./../../../../lib/core/log').Log)(process.env.LOG_LEVEL || 'ERROR', 'Hooks.Testem.BrowserStack.Open'),
  /* eslint-enable global-require */
  PlatformKeys = require('./../../../../lib/platforms/interfaces/platform').PlatformKeys

let
  data = {
    capabilities : [ ]
  }

if (args.localIdentifier) {
  if('string' === typeof(args.localIdentifier)) {
    data.capabilities.push({
      local: true,
      localIdentifier: args.localIdentifier
    })
  }
  else {
    args.localIdentifier.forEach(localIdentifier => {
      data.capabilities.push({
        local: true,
        localIdentifier: localIdentifier
      })
    })
  }
}
else {
  data.capabilities.push({
    local: args.local
  })
}

const
  settings = require('./../../../server/settings')(args.config)

let run

request
  .put('http://' + settings.host + ':' + settings.port + '/runs/testem/browserstack',
    { body: data, json: true })
  .then(response => {
    console.log('opened testem/browserstack')
  })
  .catch(err => {
    log.error('failed to open testem/browserstack - %s', err)
  })
