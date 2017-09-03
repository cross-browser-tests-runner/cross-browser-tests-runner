'use strict'

let
  retry = require('p-retry'),
  ScriptJobBase = require('./../core/scriptjob').ScriptJob,
  Request = require('./../../core/request').Request

const VARS = {
  server: 'https://' + process.env.SAUCE_USERNAME + ':' + process.env.SAUCE_ACCESS_KEY + '@ondemand.saucelabs.com:443/wd/hub',
  sessionApiUrl: 'https://saucelabs.com/rest/v1/' + process.env.SAUCE_USERNAME + '/jobs/{session}',
  username: process.env.SAUCE_USERNAME,
  accessKey: process.env.SAUCE_ACCESS_KEY,
  status: {
    'complete': 'stopped',
    'in progress': 'running'
  }
}

class ScriptJob extends ScriptJobBase {

  constructor(url, options) {
    options = options || { }
    options['username'] = VARS.username
    options['accessKey'] = VARS.accessKey
    if(options.tunnelIdentifier) {
      options['tunnel-identifier'] = options.tunnelIdentifier
      delete options.tunnelIdentifier
    }
    super(VARS.server, url, options)
  }

  markStatus(decider) {
    return ScriptJobBase.prototype.markStatus.apply(this, [
      decider,
      VARS.sessionApiUrl.replace(/{session}/, this.session),
      'PUT',
      markReqOptions
    ])
  }

  status() {
    return ScriptJobBase.prototype.status.apply(this, [
      VARS.sessionApiUrl.replace(/{session}/, this.session),
      getOptions,
      (response) => {
        return VARS.status[response.status]
      }
    ])
  }

  stop() {
    return ScriptJobBase.prototype.stop.call(this)
    .then(() => {
      return waitUntilStopped(this)
    })
  }

}

function markReqOptions(status) {
  return {
    json: true,
    resolveWithFullResponse: true,
    body: {
      passed: 'passed' === status
    },
    auth: {
      user: VARS.username,
      pass: VARS.accessKey
    }
  }
}

function getOptions() {
  return {
    json: true,
    auth: {
      user: VARS.username,
      pass: VARS.accessKey
    }
  }
}

function waitUntilStopped(scriptjob) {
  const check = () => {
    let req = new Request()
    return req.request(VARS.sessionApiUrl.replace(/{session}/, scriptjob.session), 'GET', getOptions())
    .then(response => {
      if('stopped' === VARS.status[response.status]) {
        return true
      }
      throw new Error('not done yet')
    })
    .catch(err => {
      if(err.message.match(/not done yet/)) {
        throw err
      }
      return true
    })
  },
  max = 7, minTimeout = 200, factor = 2
  return retry(check, {retries: max, minTimeout: minTimeout, factor: factor})
}

exports.ScriptJob = ScriptJob
exports.ScriptJobVars = VARS
