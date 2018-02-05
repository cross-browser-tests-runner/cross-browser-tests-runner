'use strict';

let JobIF = require('./jobif').JobIF

class ScriptJob extends JobIF {

  create() {
    throw new Error('ScriptJob.create')
  }

  run() {
    throw new Error('ScriptJob.run')
  }

  stop() {
    throw new Error('ScriptJob.stop')
  }

  markStatus() {
    throw new Error('ScriptJob.markStatus')
  }

  hasScreenshotOption() {
    throw new Error('ScriptJob.hasScreenshotOption')
  }

  screenshot() {
    throw new Error('ScriptJob.screenshot')
  }

  status() {
    throw new Error('ScriptJob.status')
  }

}

exports.ScriptJob = ScriptJob
