'use strict';

class Platform {

  run() {
    throw new Error('Platform.run: Not implemented')
  }

  runMultiple() {
    throw new Error('Platform.runMultiple: Not implemented')
  }

  stop() {
    throw new Error('Platform.stop: Not implemented')
  }

  status() {
    throw new Error('Platform.status: Not implemented')
  }

  browserKeys() {
    throw new Error('Platform.browserKeys: Not implemented')
  }

  capabilitiesKeys() {
    throw new Error('Platform.capabilitiesKeys: Not implemented')
  }

  get required() {
    throw new Error('Platform.required: Not implemented')
  }
}

exports.Platform = Platform

exports.PlatformKeys = {
  browser : [ 'os', 'osVersion', 'browser', 'browserVersion', 'device', 'orientation', 'size' ],
  capabilities : [ 'timeout', 'project', 'test', 'build', 'local', 'localIdentifier', 'screenshots', 'video' ]
}
