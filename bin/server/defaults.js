'use strict'

const
  defaults = {
    framework: 'jasmine',
    retries: 0,
    limit: '4mb',
    capabilities: {
      BrowserStack: {
        local: true,
        screenshots: true,
        timeout: 120
      },
      SauceLabs: {
        local: true,
        timeout: 120
      },
      CrossBrowserTesting: {
        local: true,
        screenshots: true,
        timeout: 120
      }
    },
    parallel: {
      BrowserStack: 2,
      SauceLabs: 2,
      CrossBrowserTesting: 2
    },
    server: {
      port: 7982,
      host: '127.0.0.1'
    }
  }

module.exports = defaults
