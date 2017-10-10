'use strict';

let
  uuidv4 = require('uuid/v4'),
  JobInterface = require('./../interfaces/job').Job,
  utils = require('./../../core/utils')

class Job extends JobInterface {

  constructor() {
    super()
  }

  static create(url, browser, capabilities, runId, isNative) {
    let serverId = null, caps = Object.assign({ }, capabilities)
    if(isNative) {
      url = nativeRunnerUrl(url, runId, serverId = uuidv4())
    }
    utils.buildParams(caps)
    return {url: url, browser: browser, capabilities: caps, serverId: serverId}
  }

  static createMultiple(url, browsers, capabilities, runId, isNative) {
    let all = [ ]
    browsers.forEach(browser => {
      let serverId = null,
        modUrl = isNative ? nativeRunnerUrl(url, runId, serverId = uuidv4()) : url,
        caps = Object.assign({ }, capabilities)
      utils.buildParams(caps)
      all.push({url: modUrl, browser: browser, capabilities: caps, serverId: serverId})
    })
    return all
  }

}

function nativeRunnerUrl(url, runId, serverId) {
  if(!url.match(/\?/)) {
    url += '?'
  }
  if(!url.match(/\?$/)) {
    url += '&'
  }
  url += 'cbtr_run=' + runId + '&cbtr_test=' + serverId
  return url
}

exports.Job = Job
