'use strict'

let
  path = require('path'),
  router = require('express').Router(),
  Bluebird = require('bluebird'),
  fs = Bluebird.promisifyAll(require('fs')),
  args = require('minimist')(process.argv.slice(2), {
    string: ['config'],
    boolean: ['error-reports-only'],
    alias: {config: 'c', 'error-reports-only': 'E'}
  }),
  srvUtils = require('./../../utils')

/*const
  settings = require('./../../settings')(args.config)*/

let
  jsFiles = [
    path.resolve(__dirname, './patch/json2.js'),
    path.resolve(__dirname, './patch/cbtr.js')
  ]

//if('jasmine' === settings.framework) {
jsFiles.push(path.resolve(__dirname, './patch/jasmine-1.js'))
//}

router.route('/')
.get((req, res) => {
  Bluebird.all(jsFiles.map(file => {
    return fs.readFileAsync(file, 'utf-8')
  }))
  .then(contents => {
    var reportVarsJs =
      'var cbtrReportErrorsOnly = ' + args['error-reports-only'] + '\n' +
      'var cbtrDontReportTraces = ' + args['omit-report-traces'] + '\n'
    res.send(reportVarsJs + contents.join('\n'))
  })
})

srvUtils.defaults(router)

module.exports = router
