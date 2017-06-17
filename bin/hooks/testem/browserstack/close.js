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
  log = new Log(process.env.LOG_LEVEL || 'ERROR', 'Hooks.Testem.BrowserStack.Close')

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

function help() {
  utils.configHelpAppHelp()
}
