'use strict';

let
  Bluebird = require('bluebird'),
  Log = require('./../../core/log').Log,
  InputError = require('./../../core/errors').InputError,
  JobBase = require('./../core/job').Job,
  ScriptJob = require('./scriptjob').ScriptJob

let log = new Log('Platforms.SauceLabs.Job')

class Job extends JobBase {

  constructor(scriptJob, serverId) {
    super()
    this.serverId = serverId
    this.scriptJob = scriptJob
    this.id = scriptJob.session
    log.debug('created with id %s, server id %s', this.id, this.serverId)
  }

  static create(url, browser, capabilities, runId, isNative) {
    return startJob(JobBase.create(url, browser, capabilities, runId, isNative))
  }

  static createMultiple(url, browsers, capabilities, runId, isNative) {
    if(!browsers || !browsers.length) {
      throw new InputError('Platforms.SauceLabs.Job: no browsers specified for createMultiple')
    }
    let
      bResAll = JobBase.createMultiple(url, browsers, capabilities || { }, runId, isNative),
      promises = [ ]
    bResAll.forEach(bRes => {
      promises.push(startJob(bRes))
    })
    return Bluebird.all(promises)
  }

  status() {
    return this.scriptJob.status()
  }

  stop() {
    return this.scriptJob.stop()
    .catch(err => {
      if(err.message.match(/This driver instance does not have a valid session ID/) ||
        err.message.match(/has already finished, and can't receive further commands/))
      {
        return Promise.resolve(true)
      }
      throw err
    })
    .then(() => {
      // as of now, mark all as passed
      return this.scriptJob.markStatus()
    })
  }

  screenshot() {
    return Promise.resolve(true)
  }

}

function startJob(data) {
  let scriptJob = new ScriptJob(data.url, data.browser, data.capabilities)
  return scriptJob.create()
  .then(() => {
    let job = new Job(scriptJob, data.serverId)
    // schedule a dummy script (main thing is to load the url)
    setTimeout(()=>{
      scriptJob.run(()=>{
        return Promise.resolve(true)
      })
      .catch(err => {
        if(err.message.match(/has already finished, and can't receive further commands/)) {
          return true
        }
        throw err
      })
    }, 10)
    return job
  })
}

exports.Job = Job
