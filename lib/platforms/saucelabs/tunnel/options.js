'use strict'

let
  Log = require('./../../../core/log').Log,
  OptionsBase = require('./../../../core/options').Options

const VARS = {
  allowedOptions: [
    'apiKey',
    'auth',
    'caPath',
    'cainfo',
    'directDomains',
    'dns',
    'extraInfo',
    'fastFailRegexps',
    'logStats',
    'logfile',
    'maxLogsize',
    'maxMissedAcks',
    'metricsAddress',
    'noAutodetect', // boolean
    'noCertVerify', // boolean
    'noProxyCaching', // boolean
    'noRemoveCollidingTunnels', // boolean
    'noSslBumpDomains',
    'pac',
    'pidfile',
    'proxy',
    'proxyTunnel', // boolean
    'proxyUserpwd',
    'readyfile',
    'reconnect',
    'restUrl',
    'scproxyPort',
    'scproxyReadLimit',
    'scproxyWriteLimit',
    'sePort',
    'sharedTunnel', // boolean
    'tunnelDomains',
    'tunnelIdentifier',
    'user',
    'verbose', // boolean
    'vmVersion'
  ]
}

let log

class Options extends OptionsBase {

  constructor() {
    super(VARS.allowedOptions)
    log = new Log('Platforms.SauceLabs.Tunnel.Options')
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
  let apiKey = input.apiKey || process.env.SAUCE_ACCESS_KEY
  if(!apiKey) {
    log.error('need SAUCE_ACCESS_KEY environment variable or "apiKey" argument')
    throw new Error('Platforms.SauceLabs.Tunnel.Options: needs SAUCE_ACCESS_KEY environment variable to be defined if "apiKey" argument is not provided')
  }
  args.push('--api-key', apiKey)
}

function handleUser(input, args) {
  let user = input.user || process.env.SAUCE_USERNAME
  if(!user) {
    log.error('need SAUCE_USERNAME environment variable or "user" argument')
    throw new Error('Platforms.SauceLabs.Tunnel.Options: needs SAUCE_USERNAME environment variable to be defined if "user" argument is not provided')
  }
  args.push('--user', user)
}

exports.Options = Options
exports.OptionsVars = VARS
