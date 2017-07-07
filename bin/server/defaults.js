'use strict'

const
  defaults = {
    framework: 'jasmine',
    retries: 0,
    limit: '4mb',
    capabilities: {
      BrowserStack: {
        JS: {
          local: true,
          screenshots: true,
          timeout: 120
        }
      }
    },
    server: {
      port: 7982,
      host: '127.0.0.1'
    }
  }

module.exports = defaults
