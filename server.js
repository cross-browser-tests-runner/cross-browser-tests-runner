'use strict'

let
  path = require('path'),
  args = require('minimist')(process.argv.slice(2), {alias: {config: ['c']}}),
  Process = require('./lib/core/process').Process,
  procArgs = [ path.resolve(process.cwd(), 'bin/server/server.js') ]

if (args.config) {
  procArgs.push('--config', args.config)
}

let proc = new Process()

proc.create('node', procArgs, {
  onstdout: stdout => {
    console.log(stdout)
  },
  onstderr: stderr => {
    console.log(stderr)
  }
})
.then(() => {
  console.log('server process exited')
})
.catch(err => {
  console.log('error with server process %s', err)
})
