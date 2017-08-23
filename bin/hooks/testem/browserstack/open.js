#!/usr/bin/env node

'use strict'

const
  allowedOptions = [ '--config', '--help', '--local', '--localIdentifier' ]

let
  path = require('path'),
  utils = require('./../../../utils'),
  args = require('minimist')(process.argv.slice(2), {
    string: ['config', 'localIdentifier'],
    boolean: ['local', 'help'],
    alias: {config: 'c', help: 'h', local: 'l', localIdentifier: 'i'},
    unknown: opt => {
      return utils.onUnknownOpt(-1 !== allowedOptions.indexOf(opt), opt, help)
    }
  })

utils.handleHelp(args, help)

let
  request = require('request-promise'),
  Log = require('./../../../../lib/core/log').Log,
  log = new Log('Hooks.Testem.BrowserStack.Open'),
  PlatformKeys = require('./../../../../lib/platforms/interfaces/platform').PlatformKeys

const
  settings = require('./../../../server/settings')(args.config)

let
  data = {
    capabilities : [ ]
  }

if (args.localIdentifier) {
  if('string' === typeof(args.localIdentifier)) {
    data.capabilities.push({
      local: true,
      localIdentifier: args.localIdentifier
    })
  }
  else {
    args.localIdentifier.forEach(localIdentifier => {
      data.capabilities.push({
        local: true,
        localIdentifier: localIdentifier
      })
    })
  }
}
else {
  data.capabilities.push({
    local: args.local
  })
}

let run

log.debug('settings', settings)

request
  .put('http://' + settings.server.host + ':' + settings.server.port + '/runs/testem/browserstack',
    { body: data, json: true })
  .then(response => {
    console.log('opened testem/browserstack')
  })
  .catch(err => {
    log.error('failed to open testem/browserstack - %s', err)
  })

function help() {
  console.log(
    '\n' +
    path.basename(process.argv[1]) +
    ' [--help|-h] [--config <config-file>]' +
    ' [--local] [--localIdentifier <identifier>]\n\n' +
    'Defaults:\n' +
    ' config            cbtr.json in project root, or CBTR_SETTINGS env var\n' +
    ' local             false\n\n' +
    'Options:\n' +
    ' help              print this help\n' +
    ' config            cross-browser-tests-runner settings file\n' +
    ' local             if a local page is being tested [forced as true for now]\n' +
    ' localIdentifier   id of browserstack tunnel, used in case multiple tunnels are required\n\n' +
    'Multiple Values:\n' +
    ' localIdentifier   multiple --localIdentifier options should be specified if multiple identifiers are needed'
  )
}
