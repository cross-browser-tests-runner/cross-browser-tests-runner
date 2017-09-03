'use strict'

let
  express = require('express'),
  router = express.Router(),
  instrumentRouter = require('./native/instrument'),
  cbtrRouter = require('./native/cbtr'),
  run = require('./native/run'),
  srvUtils = require('./../utils'),
  args = require('minimist')(process.argv.slice(2), {
    string: ['config'],
    alias: {config: 'c'}
  })

const
  settings = require('./../settings')(args.config)

run.start(settings)

router.use('/cross-browser-tests-runner.js', instrumentRouter)

router.use('/cbtr/run', (req, res, next) => {
  run.endOne(req, res, next)
})

router.use('/cbtr/status', (req, res) => {
  run.status(req, res)
})

router.use('/cbtr', cbtrRouter)

router.use('/', express.static(process.cwd()))

srvUtils.defaults(router)

module.exports = router
