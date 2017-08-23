'use strict';

let
  Log = require('./../../../core/log').Log,
  InputError = require('./../../../core/errors').InputError

const VARS = {
  allowedOptions: [
    'key',
    'only',
    'proxy',
    'localIdentifier',
    'forceProxy',
    'localProxy',
    'pacFile',
    'parallelRuns',
    'verbose',
    'logFile'
  ]
}

let log

class Options {

  constructor() {
    log = new Log('Platforms.BrowserStack.Tunnel.Options')
  }

  process(input) {
    let args = parse(input || { })
    return args
  }
}

function parse(input) {
  checkUnallowed(input)
  let args = convert(input)
  handleKey(input, args)
  if (!input.localIdentifier) {
    args.push('--force')
  }
  handleVerbose(input, args)
  return args
}

function checkUnallowed(input) {
  Object.keys(input).forEach(key => {
    if(-1 === VARS.allowedOptions.indexOf(key)) {
      throw new InputError('Platforms.BrowserStack.Tunnel.Options: unexpected user option ' + key + ':' + input[key])
    }
  })
}

function convert(input)
{
  let args = [ ]
  Object.keys(input).forEach(key => {
    recursivelyConvert(key, input, args)
  })
  return args
}

function recursivelyConvert(key, input, args, prefix) {
  let converted = key.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase()})
  if (prefix) {
    converted = prefix + '-' + converted
  }
  if('object' !== typeof(input[key])) {
    args.push('--'+converted, input[key].toString())
  }
  else {
    Object.keys(input[key]).forEach(subKey => {
      recursivelyConvert(subKey, input[key], args, converted)
    })
  }
}

function handleKey(input, args) {
  var key = input.key || process.env.BROWSERSTACK_ACCESS_KEY
  if(!key) {
    log.error('need BROWSERSTACK_ACCESS_KEY environment variable or "key" argument')
    throw new Error('Platforms.BrowserStack.Tunnel.Options: needs BROWSERSTACK_ACCESS_KEY environment variable to be defined if "key" argument is not provided')
  }
  args.push('--key', key)
}

function handleVerbose(input, args) {
  const map = { INFO : '1', DEBUG : '2' }
  if (!input.verbose && -1 !== ['INFO', 'DEBUG'].indexOf(log.level)) {
    args.push('--verbose', map[log.level])
  }
}

exports.Options = Options
exports.OptionsVars = VARS
