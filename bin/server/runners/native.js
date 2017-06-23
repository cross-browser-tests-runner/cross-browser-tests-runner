'use strict'

let
  express = require('express'),
  router = express.Router(),
  instrumentRouter = require('./native/instrument'),
  cbtrRouter = require('./native/cbtr'),
  tests = require('./native/tests'),
  srvUtils = require('./../utils'),
  args = require('minimist')(process.argv.slice(2), {
    string: ['config'],
    alias: {config: 'c'}
  })

const
  settings = require('./../settings')(args.config)

tests.start(settings)

router.use('/cross-browser-tests-runner.js', instrumentRouter)

router.use('/cbtr/run', (req, res, next) => {
  tests.endOne(req, res, next, settings)
})

router.use('/cbtr', cbtrRouter)

router.use('/', express.static(process.cwd()))

srvUtils.defaults(router)

module.exports = router
