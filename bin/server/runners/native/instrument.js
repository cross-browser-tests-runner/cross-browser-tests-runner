'use strict'

let
  path = require('path'),
  router = require('express').Router(),
  Bluebird = require('bluebird'),
  fs = Bluebird.promisifyAll(require('fs')),
  args = require('minimist')(process.argv.slice(2), {
    string: ['config'],
    alias: {config: 'c'}
  }),
  Log = require('./../../../../lib/core/log').Log,
  log = new Log(process.env.LOG_LEVEL || 'ERROR', 'Server.Runners.Native.Instrument'),
  srvUtils = require('./../../utils')

const
  settings = require('./../../settings')(args.config)

let
  jsFiles = [
    path.resolve(__dirname, './patch/json2.js'),
    path.resolve(__dirname, './patch/cbtr.js')
  ]

if('jasmine' === settings.framework) {
  jsFiles.push(path.resolve(__dirname, './patch/jasmine-1.js'))
}

router.route('/')
.get(function(req, res) {
  log.debug('request for cross-browser-tests-runner js')
  Bluebird.all(jsFiles.map(file => {
    return fs.readFileAsync(file, 'utf-8')
  }))
  .then(contents => {
    log.debug('serving cross-browser-tests-runner js')
    res.send(contents.join('\n'))
  })
  .catch(err => {
    srvUtils.error(err, res)
  })
})

srvUtils.defaults(router)

module.exports = router
