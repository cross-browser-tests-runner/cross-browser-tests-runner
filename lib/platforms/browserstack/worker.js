'use strict';

let
  Log = require('./../../core/log').Log,
  Request = require('./../../core/request').Request

let log = new Log(process.env.LOG_LEVEL || 'ERROR', 'Platforms.BrowserStack.Worker')

const VARS = {
  commonOptions: [ 'host', 'username', 'accessKey' ],
  host: 'https://api.browserstack.com/4',
  username: process.env.BROWSERSTACK_USERNAME,
  accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
  timeout: 60,
  workerApiEndpoint: '/worker'
}

class Worker {

  create(config) {
    this.processed = parse(config)
    let callbacks = createCallbacks(this)
    return startWorker(this, callbacks)
  }

  status() {
    log.debug('need status of %s', this.id)
    let callbacks = {
      onresponse: function(response) {
        let status = (response.body && response.body.status || 'terminated')
        log.debug('status %s', status)
        return status
      }
    }
    return apiReq(this, 'GET', callbacks)
  }

  terminate() {
    log.debug('terminating %s', this.id)
    let callbacks = termCallbacks()
    return apiReq(this, 'DELETE', callbacks)
  }
}

function parse(config) {
  let settings = { }
  VARS.commonOptions.forEach(function(commonKey) {
    settings[commonKey] = config[commonKey] || VARS[commonKey]
    if (commonKey in config) {
      delete config[commonKey]
    }
  })
  config.timeout = config.timeout || VARS.timeout
  return { settings: settings, config: config }
}

function createCallbacks(worker) {
  return {
    onerror: function(error) {
      onerror(error, 'creation')
    },
    onresponse: function(response) {
      worker.id = response.body.id
      log.debug('created with id %s', worker.id)
      worker.endpoint = worker.processed.settings.host + VARS.workerApiEndpoint + '/' + worker.id
      log.debug('endpoint for api calls for this worker %s', worker.endpoint)
    }
  }
}

function startWorker(worker, callbacks) {
  log.debug('create with settings %s browser config %s', JSON.stringify(worker.processed.settings), JSON.stringify(worker.processed.config))
  let req = new Request()
  return req.request(
    worker.processed.settings.host + VARS.workerApiEndpoint,
    'POST',
    {
      body: worker.processed.config,
      json: true,
      resolveWithFullResponse: true,
      auth: auth(worker)
    }
  )
  .then(response => {
    callbacks.onresponse(response)
  })
  .catch(callbacks.onerror)
}

function termCallbacks() {
  return {
    onerror: function(error) {
      onerror(error, 'termination')
    },
    onresponse: function(response) {
      log.debug('deleted with status %d', response.statusCode)
    }
  }
}

function onerror(error, op) {
  log.error('%s failed with status %d and response %s', op, error.statusCode, JSON.stringify(error.response.body))
  throw error
}

function apiReq(worker, method, callbacks) {
  let req = new Request()
  return req.request(
    worker.endpoint,
    method,
    {
      json: true,
      resolveWithFullResponse: true,
      auth: auth(worker)
    }
  )
  .then(callbacks.onresponse)
  .catch(callbacks.onerror)
}

function auth(worker) {
  return {
    user: worker.processed.settings.username,
    pass: worker.processed.settings.accessKey
  }
}

exports.Worker = Worker

if(process.env.UNIT_TESTS) {
  exports.WorkerVars = VARS
}
