'use strict';

var
  Log = require('./../../../lib/core/log').Log

let log = new Log(process.env.LOG_LEVEL || 'ERROR', 'IntegrationTests')

exports.log = log
