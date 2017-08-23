'use strict';

let
  retry = require('p-retry'),
  Log = require('./../../core/log').Log,
  InputError = require('./../../core/errors').InputError,
  Request = require('./../../core/request').Request

let log = new Log('Platforms.BrowserStack.Worker')

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
    let callbacks = {
      onresponse: function(response) {
        let status = (response.body && response.body.status || 'terminated')
        return status
      }
    }
    return apiReq(this, 'GET', callbacks)
  }

  screenshot() {
    return safeScreenshot(this)
  }

  terminate() {
    let callbacks = termCallbacks(this)
    return safeTerminate(this, callbacks)
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
      worker.endpoint = worker.processed.settings.host + VARS.workerApiEndpoint + '/' + worker.id
      log.info('created with id %s, endpoint %s, for settings %s browser config %s', worker.id, worker.endpoint, JSON.stringify(worker.processed.settings), JSON.stringify(worker.processed.config))
    }
  }
}

function startWorker(worker, callbacks) {
  log.debug('attempt to create with settings %s browser config %s', JSON.stringify(worker.processed.settings), JSON.stringify(worker.processed.config))
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
  .catch(err => {
    callbacks.onerror(err)
  })
}

function termCallbacks(worker) {
  return {
    onerror: function(error) {
      onerror(error, 'termination')
    },
    onresponse: function(response) {
      log.debug('%s deleted with status %d', worker.id, response.statusCode)
    }
  }
}

function onerror(error, op) {
  if('creation' === op) {
    log.error('creating worker failed with status %d and response %s', error.statusCode, JSON.stringify(error.response.body))
    throw new InputError(error.message)
  }
  else {
    log.warn('%s failed with status %d and response %s', op, error.statusCode, JSON.stringify(error.response.body))
    throw error
  }
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

function safeScreenshot(worker) {
  let max = 5, minTimeout = 2000, factor = 2
  const check = () => {
    let req = new Request()
    return req.request(
      worker.endpoint + '/screenshot.json',
      'GET', {
        json: true,
        auth: auth(worker)
      }
    )
    .then(res => {
      log.info('screenshot for id ' + worker.id + ' created with response', res)
      return res.url
    })
    .catch(err => {
      if(err.message && err.message.match(/Worker not found/)) {
        throw new retry.AbortError(err.message)
      }
      log.error('error while creating screenshot %s', err)
      throw err
    })
  }
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
}

function safeTerminate(worker, callbacks) {
  let max = 6, minTimeout = 400, factor = 2
  const check = (retries) => {
    log.debug('sending termination request for %s...', worker.id)
    return apiReq(worker, 'DELETE', callbacks)
    .then(() => {
      return worker.status()
    })
    .catch(() => {
      return worker.status()
    })
    .then(status => {
      if('terminated' === status) {
        log.debug('id %s terminated', worker.id)
        return true
      }
      if(retries < max) {
        throw new Error('Platforms.BrowserStack.Worker: not done yet')
      }
      return true
    })
  }
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
}

exports.Worker = Worker
exports.WorkerVars = VARS
