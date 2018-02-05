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

  runScript() {
    throw new Error('Platform.runScript')
  }

  runScriptMultiple() {
    throw new Error('Platform.runScriptMultiple')
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

}

exports.Platform = Platform

exports.PlatformKeys = {
  browser: [
    'os',
    'osVersion',
    'browser',
    'browserVersion',
    'device',
    'deviceType',
    'resolution',
    'orientation',
    'isPhysicalDevice'
  ],
  capabilities : [
    'project',
    'test',
    'build',
    'tags',
    'customData',
    'timeout',
    'priority',
    'local',
    'localIdentifier',
    'parentTunnel',
    'screenshots',
    'noServerFailureScreenshots',
    'video',
    'videoUploadOnPass',
    'seleniumVersion',
    'appiumVersion',
    'timezone',
    'captureConsole',
    'captureNetwork',
    'captureLogs',
    'captureHtml',
    'ieNoFlash',
    'ieDriver',
    'ieCompat',
    'iePopups',
    'edgePopups',
    'safariPopups',
    'safariAllCookies',
    'safariDriver',
    'geckoDriver',
    'chromeDriver',
    'automationEngine',
    'autoAcceptAlerts',
    'prerun'
  ]
}
