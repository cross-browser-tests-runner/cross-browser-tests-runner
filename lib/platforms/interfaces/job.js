'use strict';

let JobIF = require('./jobif').JobIF

class Job extends JobIF {

  static create() {
    throw new Error('Job::create')
  }

  static createMultiple() {
    throw new Error('Job::createMultiple')
  }

  screenshot() {
    throw new Error('Job.screenshot')
  }

  status() {
    throw new Error('Job.status')
  }

  stop() {
    throw new Error('Job.stop')
  }
}

exports.Job = Job
