'use strict'

let
  args = require('minimist')(process.argv.slice(2), {alias: {config: ['c']}}),
  bodyParser = require('body-parser'),
  express = require('express'),
  cbtr = express(),
  runsRouter = require('./runs'),
  /* eslint-disable global-require */
  log = new (require('./../../lib/core/log').Log)(process.env.LOG_LEVEL || 'ERROR', 'Server')
  /* eslint-enable global-require */

const
  settings = require('./settings')(args.config)

cbtr.use(bodyParser.json())
cbtr.use(bodyParser.urlencoded({ extended: true }))

cbtr.use('/runs', runsRouter)

cbtr.use(function(req, res, next) {
  log.warn('non-existent path %s', req.url)
  res.sendStatus(404)
})

cbtr.use(function(err, req, res, next) {
  log.error('error processing request', err)
  res.status(400).json({ error : err.message })
})

log.debug('listening on %s:%s', settings.host, settings.port)

cbtr.listen(settings.port, settings.host)
