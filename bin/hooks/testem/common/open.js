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
  log = new Log('Hooks.Testem.Common.Open')

const
  settings = require('./../../../server/settings')(args.config)

const main = (platform) => {
  let data = {
    capabilities : [ ]
  }
  setupInput(data)
  log.debug('settings', settings)
  request
  .put('http://' + settings.server.host + ':' + settings.server.port + '/runs/testem/' + platform, {
    body: data, json: true
  })
  .then(() => {
    console.log('opened testem/' + platform)
  })
  .catch(err => {
    log.error('failed to open testem/' + platform + ' - %s', err)
  })
}

function setupInput(data) {
  if(args.localIdentifier) {
    data.capabilities.push({
      local: true,
      localIdentifier: args.localIdentifier
    })
  }
  else {
    data.capabilities.push({
      local: args.local
    })
  }
}

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
    ' localIdentifier   id of tunnel, used in case multiple tunnels are required\n\n' +
    'Multiple Values:\n' +
    ' localIdentifier   multiple --localIdentifier options should be specified if multiple identifiers are needed'
  )
}

exports.run = main
