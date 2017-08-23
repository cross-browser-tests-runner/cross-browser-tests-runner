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
  Bluebird.all(jsFiles.map(file => {
    return fs.readFileAsync(file, 'utf-8')
  }))
  .then(contents => {
    res.send(contents.join('\n'))
  })
  .catch(err => {
    srvUtils.error(err, res)
  })
})

srvUtils.defaults(router)

module.exports = router
