#!/usr/bin/env node

'use strict'

const
  allowedOptions = ['--config', '--native-runner', '--help']

let
  utils = require('./bin/utils'),
  args = utils.serverArgs(allowedOptions, help)

function help() {
  utils.serverHelp()
}

utils.handleHelp(args, help)

let
  path = require('path'),
  Log = require('./lib/core/log').Log,
  Process = require('./lib/core/process').Process,
  procArgs = [ path.resolve(__dirname, 'bin/server/server.js') ],
  log = new Log(process.env.LOG_LEVEL || 'ERROR', 'Server')

if(args.config) {
  procArgs.push('--config', args.config)
}
if(args['native-runner']) {
  procArgs.push('--native-runner')
}

let proc = new Process()

proc.create('node', procArgs, {
  onstdout: stdout => {
    console.log(stdout.trim())
  },
  onstderr: stderr => {
    console.error(stderr.trim())
  }
})
.then(() => {
  log.debug('server process exited')
})
.catch(err => {
  log.error('error with server process %s', err)
})
