'use strict';

let
  uuidv4 = require('uuid/v4'),
  JobInterface = require('./../interfaces/job').Job

class Job extends JobInterface {

  constructor() {
    super()
  }

  static create(url, browser, capabilities, runId, isNative) {
    let serverId = null
    if(isNative) {
      url = nativeRunnerUrl(url, runId, serverId = uuidv4())
    }
    return {url: url, browser: browser, capabilities: capabilities, serverId: serverId}
  }

  static createMultiple(url, browsers, capabilities, runId, isNative) {
    let all = [ ]
    browsers.forEach(browser => {
      let serverId = null,
        modUrl = isNative ? nativeRunnerUrl(url, runId, serverId = uuidv4()) : url
      all.push({url: modUrl, browser: browser, capabilities: capabilities, serverId: serverId})
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
