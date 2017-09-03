'use strict';

let
  Log = require('./../../../core/log').Log,
  OptionsBase = require('./../../../core/options').Options

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

class Options extends OptionsBase {

  constructor() {
    super(VARS.allowedOptions)
    log = new Log('Platforms.BrowserStack.Tunnel.Options')
  }

  parse(input) {
    let args = OptionsBase.prototype.parse.call(this, input)
    handleKey(input, args)
    if (!input.localIdentifier) {
      args.push('--force')
    }
    handleVerbose(input, args)
    return args
  }

}

function handleKey(input, args) {
  let key = input.key || process.env.BROWSERSTACK_ACCESS_KEY
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
