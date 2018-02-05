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
    let bResAll = JobBase.createMultiple(url, browsers, capabilities || { }, runId, isNative)
    return Bluebird.all(bResAll.map(bRes => {
      let data = {
        url: bRes.url,
        browser: Object.assign({ }, bRes.browser),
        capabilities: Object.assign({ }, bRes.capabilities)
      }
      return startJob(bRes)
      .catch(err => {
        log.error('creation failed with error', err)
        let
          scriptJob = new ScriptJob(data.url, data.browser, data.capabilities),
          job = new Job(scriptJob, data.serverId)
        job.failed = true
        return job
      })
    }))
  }

  status() {
    return this.scriptJob.status()
  }

  stop(passed) {
    return this.scriptJob.stop()
    .catch(err => {
      // Only errors that occur here:
      // - /This driver instance does not have a valid session ID/
      // - /has already finished, and can't receive further commands/
      log.warn('error %s', err)
      return Promise.resolve(true)
    })
    .then(() => {
      return this.scriptJob.markStatus(()=>{ return Promise.resolve(false !== passed) })
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
        // Only known error to occur is:
        // - /has already finished, and can't receive further commands/
        log.warn('error %s', err)
        return true
      })
    }, 10)
    return job
  })
}

exports.Job = Job
