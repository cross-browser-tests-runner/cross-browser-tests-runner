'use strict';

class JobIF {

  screenshot() {
    throw new Error('JobIF.screenshot')
  }

  status() {
    throw new Error('JobIF.status')
  }

  stop() {
    throw new Error('JobIF.stop')
  }
}

exports.JobIF = JobIF
