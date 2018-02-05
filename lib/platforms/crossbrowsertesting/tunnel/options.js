'use strict'

let
  Log = require('./../../../core/log').Log,
  OptionsBase = require('./../../../core/options').Options

const VARS = {
  allowedOptions: [
    'authkey',
    'username',
    'proxyIp',
    'proxyPort',
    // 'ready', - with the new tunnel binaries this option does not seem to work
    'tunnelname',
    'verbose' // boolean
  ]
}

let log

class Options extends OptionsBase {

  constructor() {
    super(VARS.allowedOptions)
    log = new Log('Platforms.CrossBrowserTesting.Tunnel.Options')
  }

  parse(input) {
    let args = OptionsBase.prototype.parse.call(this, input)
    handleUserKey(input, args)
    return args
  }

}

function handleUserKey(input, args) {
  handleKey(input, args)
  handleUser(input, args)
}

function handleKey(input, args) {
  let authkey = input.authkey || process.env.CROSSBROWSERTESTING_ACCESS_KEY
  if(!authkey) {
    log.error('need CROSSBROWSERTESTING_ACCESS_KEY environment variable or "authkey" argument')
    throw new Error('Platforms.CrossBrowserTesting.Tunnel.Options: needs CROSSBROWSERTESTING_ACCESS_KEY environment variable to be defined if "authkey" argument is not provided')
  }
  args.push('--authkey', authkey)
}

function handleUser(input, args) {
  let username = input.username || process.env.CROSSBROWSERTESTING_USERNAME
  if(!username) {
    log.error('need CROSSBROWSERTESTING_USERNAME environment variable or "username" argument')
    throw new Error('Platforms.CrossBrowserTesting.Tunnel.Options: needs CROSSBROWSERTESTING_USERNAME environment variable to be defined if "username" argument is not provided')
  }
  args.push('--username', username)
}

exports.Options = Options
exports.OptionsVars = VARS
