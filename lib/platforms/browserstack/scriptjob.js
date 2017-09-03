'use strict'

let
  ScriptJobBase = require('./../core/scriptjob').ScriptJob

const VARS = {
  server: 'http://hub-cloud.browserstack.com/wd/hub',
  sessionApiUrl: 'https://www.browserstack.com/automate/sessions/{session}.json',
  username: process.env.BROWSERSTACK_USERNAME,
  accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
  status: {
    done: 'stopped',
    running: 'running',
    passed: 'stopped',
    failed: 'stopped'
  }
}

class ScriptJob extends ScriptJobBase {

  constructor(url, options) {
    options = options || { }
    options['browserstack.user'] = VARS.username
    options['browserstack.key'] = VARS.accessKey
    options['browserName'] = options['browser']
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
        return VARS.status[response.automation_session.status]
      }
    ])
  }

}

function markReqOptions(status) {
  return {
    json: true,
    resolveWithFullResponse: true,
    body: {
      status: status
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

exports.ScriptJob = ScriptJob
exports.ScriptJobVars = VARS
