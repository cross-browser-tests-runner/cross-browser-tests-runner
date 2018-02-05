'use strict';

var
  Bluebird = require('bluebird'),
  fs = Bluebird.promisifyAll(require('fs')),
  Log = require('./../../../lib/core/log').Log,
  utils = require('./../../utils')

let log = new Log('FunctionalTests')

function errorWithoutCovLines(out) {
  utils.errorWithoutCovLines(log, out)
}

function copyFileAsync(from, to) {
  return fs.readFileAsync(from, 'utf8')
  .then(data => {
    return fs.writeFileAsync(to, data, 'utf8')
  })
}

exports.log = log
exports.buildDetails = utils.buildDetails
exports.nodeProcCoverageArgs = utils.nodeProcCoverageArgs
exports.errorWithoutCovLines = errorWithoutCovLines
exports.copyFileAsync = copyFileAsync
exports.safeChmod = utils.safeChmod
