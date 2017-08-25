'use strict'

let
  uuidv4 = require('uuid/v4'),
  coreUtils = require('./../../../../../lib/core/utils'),
  CiFactory = require('./../../../../../lib/ci/factory').Factory,
  aliases = {
    /* eslint-disable global-require */
    BrowserStack: require('./../../../../../conf/browserstack-conf.json').Aliases
    /* eslint-enable global-require */
  }

aliases.BrowserStack.Browsers = coreUtils.swapKV(aliases.BrowserStack.Browsers)
aliases.BrowserStack['Operating Systems'] = coreUtils.swapKV(aliases.BrowserStack['Operating Systems'])

class Test {

  constructor(name, testFile, run, browser, capabilities, retries) {
    this.id = uuidv4()
    this.status = 'pending'
    this.on = name
    if(aliases[name].Browsers[browser.browser]) {
      browser.browser = aliases[name].Browsers[browser.browser]
    }
    if(aliases[name]['Operating Systems'][browser.os]) {
      browser.os = aliases[name]['Operating Systems'][browser.os]
    }
    this.browser = browser
    ci(capabilities)
    this.capabilities = capabilities
    this.retries = retries
  }

  run(platform) {
    this.platform = platform
    return this.runFunction()
    .then(result => {
      this.runId = result.id
      this.status = 'started'
      this.checker = setInterval(() => { this.monitor() }, 30000)
      return this
    })
  }

}

function ci(capabilities) {
  if(!capabilities.build && !capabilities.test && !capabilities.project) {
    try {
      let Ci = CiFactory.get()
      capabilities.project = Ci.project
      capabilities.test = Ci.session
      capabilities.build = Ci.commit
    }
    catch(err) {
      capabilities.project = 'anonymous/anonymous'
      capabilities.test = uuidv4()
      capabilities.build = 'unknown build'
    }
  }
}

exports.Test = Test
