#!/usr/bin/env node

'use strict'

const
  allowedOptions = ['--config', '--help']

let
  utils = require('./bin/utils'),
  args = utils.configHelpArgs(allowedOptions, help)

function help() {
  utils.configHelpAppHelp()
}

utils.handleHelp(args, help)

let
  path = require('path'),
  Log = require('./lib/core/log').Log,
  Process = require('./lib/core/process').Process,
  procArgs = [ path.resolve(__dirname, 'bin/server/server.js') ],
  log = new Log(process.env.LOG_LEVEL || 'ERROR', 'Server')

if (args.config) {
  procArgs.push('--config', args.config)
}

let proc = new Process()

proc.create('node', procArgs, {
  onstdout: stdout => {
    log.debug(stdout)
  },
  onstderr: stderr => {
    log.error(stderr)
  }
})
.then(() => {
  log.debug('server process exited')
})
.catch(err => {
  log.error('error with server process %s', err)
})
