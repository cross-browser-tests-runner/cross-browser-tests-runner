'use strict';

let
  Log = require('./../../../core/log').Log

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
    log = new Log(process.env.LOG_LEVEL || 'ERROR', 'Platforms.BrowserStack.Tunnel.Options')
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
  log.debug('checking for unallowed options')
  Object.keys(input).forEach(key => {
    if(-1 === VARS.allowedOptions.indexOf(key)) {
      log.error('unexpected user option ' + key + ':' + input[key])
      throw new Error('Platforms.BrowserStack.Tunnel.Options: unexpected user option ' + key + ':' + input[key])
    }
  })
}

function convert(input)
{
  log.debug('converting caller options to command line format')
  let args = [ ]
  Object.keys(input).forEach(key => {
    recursivelyConvert(key, input, args)
  })
  log.debug('converted %s', args.join(' '))
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
  log.debug('ensuring that access key can be obtained through input or env')
  if (!input.key) {
    if(!process.env.BROWSERSTACK_ACCESS_KEY) {
      log.error('need BROWSERSTACK_ACCESS_KEY environment variable or "key" argument')
      throw new Error('Tunnel: needs BROWSERSTACK_ACCESS_KEY environment variable to be defined if "key" argument is not provided')
    }
    args.push('--key', process.env.BROWSERSTACK_ACCESS_KEY)
  }
}

function handleVerbose(input, args) {
  log.debug('processing verbose argument')
  const map = { INFO : '1', DEBUG : '2' }
  if (!input.verbose && -1 !== ['INFO', 'DEBUG'].indexOf(log.level)) {
    args.push('--verbose', map[log.level])
  }
}

exports.Options = Options
exports.OptionsVars = VARS
