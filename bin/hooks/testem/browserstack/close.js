#!/usr/bin/env node

'use strict'

let
  args = require('minimist')(process.argv.slice(2), {
    alias: { config: 'c'}
  }),
  request = require('request-promise'),
  /* eslint-disable global-require */
  log = new (require('./../../../../lib/core/log').Log)(process.env.LOG_LEVEL || 'ERROR', 'Hooks.Testem.BrowserStack.Close')
  /* eslint-enable global-require */


const
  settings = require('./../../../server/settings')(args.config)

request
  .delete('http://' + settings.host + ':' + settings.port + '/runs/testem/browserstack')
  .then(response => {
    log.info('closed browserstack-testem runs')
  })
  .catch(err => {
    log.error('failed to end browserstack-testem runs - %s', err)
  })
