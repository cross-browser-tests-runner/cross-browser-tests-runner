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
  log = new Log('Hooks.Testem.Common.Close')

const
  settings = require('./../../../server/settings')(args.config)

const main = (platform) => {
  log.debug('settings', settings)
  request
  .delete('http://' + settings.server.host + ':' + settings.server.port + '/runs/testem/' + platform)
  .then(() => {
    console.log('closed ' + platform + '-testem runs')
  })
}

function help() {
  utils.configHelpAppHelp()
}

exports.run = main
