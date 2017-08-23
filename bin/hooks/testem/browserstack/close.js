#!/usr/bin/env node

'use strict'

const
  allowedOptions = [ '--config', '--help' ]

let
  utils = require('./../../../utils'),
  args = utils.configHelpArgs(allowedOptions, help)

utils.handleHelp(args, help)

let
  request = require('request-promise'),
  Log = require('./../../../../lib/core/log').Log,
  log = new Log('Hooks.Testem.BrowserStack.Close')

const
  settings = require('./../../../server/settings')(args.config)

log.debug('settings', settings)

request
  .delete('http://' + settings.server.host + ':' + settings.server.port + '/runs/testem/browserstack')
  .then(response => {
    log.info('closed browserstack-testem runs')
  })
  .catch(err => {
    log.error('failed to end browserstack-testem runs - %s', err)
  })

function help() {
  utils.configHelpAppHelp()
}
