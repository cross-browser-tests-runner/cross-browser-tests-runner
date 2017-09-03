#!/usr/bin/env node

'use strict'

const
  allowedOptions = ['--config', '--native-runner', '--errors-only', '--omit-traces', '--error-reports-only', '--omit-report-traces', '--help']

let
  utils = require('./../utils'),
  args = utils.serverArgs(allowedOptions, help),
  srvUtils = require('./utils')

function help() {
  utils.serverHelp()
}

utils.handleHelp(args, help)

let
  bodyParser = require('body-parser'),
  express = require('express'),
  cbtr = express(),
  Log = require('./../../lib/core/log').Log,
  log = new Log('Server')

const
  settings = require('./settings')(args.config)

log.debug('args', args)

cbtr.use(bodyParser.json({limit: settings.limit}))
cbtr.use(bodyParser.urlencoded({limit: settings.limit, extended: true }))

if(!args['native-runner']) {
  /* eslint-disable global-require */
  cbtr.use('/runs', require('./runs'))
  /* eslint-enable global-require */
}
else {
  /* eslint-disable global-require */
  cbtr.use('/', require('./runners/native'))
  /* eslint-enable global-require */
}

srvUtils.defaults(cbtr)

log.debug('listening on %s:%s', settings.server.host, settings.server.port)

cbtr.listen(settings.server.port, settings.server.host)
