'use strict'

let
  path = require('path')

exports.onUnknownOpt = (condition, opt, help) => {
  if(condition) {
    return true
  }
  console.error('\nUnknown option: %s', opt)
  help()
  /* eslint-disable no-process-exit */
  process.exit(1)
  /* eslint-enable no-process-exit */
}

const onUnknownOpt = exports.onUnknownOpt

exports.handleHelp = (args, help) => {
  if(args.help) {
    help()
    /* eslint-disable no-process-exit */
    process.exit(0)
    /* eslint-enable no-process-exit */
  }
}

exports.configHelpArgs = (allowedOptions, help) => {
  /* eslint-disable global-require */
  return (require('minimist')(process.argv.slice(2), {
    string: [ 'config' ],
    boolean: [ 'help' ],
    alias: { config: 'c', help: 'h' },
    unknown: opt => {
      return onUnknownOpt(-1 !== allowedOptions.indexOf(opt), opt, help)
    }
  }))
  /* eslint-enable global-require */
}

exports.ioHelpArgs = (allowedOptions, help) => {
  /* eslint-disable global-require */
  return (require('minimist')(process.argv.slice(2), {
    string: ['input', 'output'],
    boolean: ['help'],
    alias: {input: 'i', output: 'o', help: 'h'},
    unknown: opt => {
      return onUnknownOpt(-1 !== allowedOptions.indexOf(opt), opt, help)
    }
  }))
  /* eslint-enable global-require */
}

exports.configHelpAppHelp = () => {
  console.log(
    '\n' +
    path.basename(process.argv[1]) +
    ' [--help|-h] [--config|-c <config-file>]\n\n' +
    'Defaults:\n' +
    ' config            cbtr.json in project root, or CBTR_SETTINGS env var\n\n' +
    'Options:\n' +
    ' help              print this help\n' +
    ' config            cross-browser-tests-runner settings file'
  )
}