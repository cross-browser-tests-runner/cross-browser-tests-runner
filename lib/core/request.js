'use strict';

let
  request = require('request-promise'),
  Log = require('./log').Log

let log = new Log(process.env.LOG_LEVEL || 'ERROR', 'Request')

const VARS = {
  allowedOptions : [
    'proxy',
    'body',
    'json',
    'headers',
    'timeout',
    'auth',
    'rejectUnauthorized',
    'followRedirect',
    'encoding',
    'resolveWithFullResponse'
  ]
}

class Request {

  request(url, method, options) {
    log.debug('%s %s %s', method, url, (options && JSON.stringify(options)))
    options = parse(options||{})
    options.uri = url
    return request[method.toLowerCase()](options)
  }
}

function parse(options) {
  return VARS.allowedOptions.reduce((ret, opt) => {
    if(opt in options) {
      ret[opt] = options[opt]
    }
    return ret
  }, { })
}

exports.Request = Request
