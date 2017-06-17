#!/usr/bin/env node

'use strict'

const
  allowedOptions = ['--config', '--help']

let
  utils = require('./../utils'),
  args = utils.configHelpArgs(allowedOptions, help)

function help() {
  utils.configHelpAppHelp()
}

utils.handleHelp(args, help)

let
  bodyParser = require('body-parser'),
  express = require('express'),
  cbtr = express(),
  runsRouter = require('./runs'),
  Log = require('./../../lib/core/log').Log,
  log = new Log(process.env.LOG_LEVEL || 'ERROR', 'Server')

const
  settings = require('./settings')(args.config)

cbtr.use(bodyParser.json())
cbtr.use(bodyParser.urlencoded({ extended: true }))

cbtr.use('/runs', runsRouter)

cbtr.use(function(req, res) {
  log.warn('non-existent path %s', req.url)
  res.sendStatus(404)
})

cbtr.use(function(err, req, res, next) {
  log.error('error processing request', err)
  res.status(400).json({ error : err.message })
})

log.debug('listening on %s:%s', settings.host, settings.port)

cbtr.listen(settings.port, settings.host)
