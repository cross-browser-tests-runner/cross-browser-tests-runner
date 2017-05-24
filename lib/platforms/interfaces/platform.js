'use strict';

class Platform {

  open() {
    throw new Error('Platform.open')
  }

  run() {
    throw new Error('Platform.run')
  }

  runMultiple() {
    throw new Error('Platform.runMultiple')
  }

  stop() {
    throw new Error('Platform.stop')
  }

  status() {
    throw new Error('Platform.status')
  }

  close() {
    throw new Error('Platform.close')
  }

  static browserKeys() {
    throw new Error('Platform.browserKeys')
  }

  static capabilitiesKeys() {
    throw new Error('Platform.capabilitiesKeys')
  }

  static get required() {
    throw new Error('Platform.required')
  }
}

exports.Platform = Platform

exports.PlatformKeys = {
  browser : [ 'os', 'osVersion', 'browser', 'browserVersion', 'device', 'orientation', 'size' ],
  capabilities : [ 'timeout', 'project', 'test', 'build', 'local', 'localIdentifier', 'screenshots', 'video' ]
}
