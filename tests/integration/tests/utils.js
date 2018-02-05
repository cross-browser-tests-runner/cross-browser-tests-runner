'use strict';

var
  Log = require('./../../../lib/core/log').Log,
  utils = require('./../../utils')

let log = new Log('IntegrationTests')

function errorWithoutCovLines(out) {
  utils.errorWithoutCovLines(log, out)
}

exports.log = log
exports.buildDetails = utils.buildDetails
exports.nodeProcCoverageArgs = utils.nodeProcCoverageArgs
exports.errorWithoutCovLines = errorWithoutCovLines
exports.safeChmod = utils.safeChmod
