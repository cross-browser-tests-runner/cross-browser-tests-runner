'use strict'

let
  path = require('path'),
  Bluebird = require('bluebird')

class Runner {

  constructor(settings, names, platforms, tests) {
    this.settings = settings
    this.names = names
    this.platforms = platforms
    this.tests = tests
    this.running = { }
    this.names.forEach(name => {
      this.running[name] = [ ]
    })
  }

  pickAndRun() {
    let runConfigs = { }
    this.names.forEach(name => {
      let capacity = this.settings.parallel[name] - this.running[name].length
      runConfigs[name] = {JS: [ ], Selenium: [ ]}
      capacity = this._pickJsConfig(name, runConfigs[name].JS, capacity)
      this._pickSeleniumConfig(name, runConfigs[name].Selenium, capacity)
    })
    return this._run(runConfigs)
    .then(() => {
      return this.running
    })
  }

  _pickJsConfig(name, runConfigs, capacity) {
    let browsers = this.settings.browsers[name].JS
    while(capacity && this.tests[name].JS.length) {
      let
        config = this.tests[name].JS[0],
        runConfig = {url: config.url, browsers: [ ]}
      while(capacity && browsers.length > config.browserIndex) {
        runConfig.browsers.push(browsers[config.browserIndex++])
        --capacity
      }
      if(browsers.length === config.browserIndex) {
        this.tests[name].JS.shift()
      }
      runConfigs.push(runConfig)
    }
    return capacity
  }

  _pickSeleniumConfig(name, runConfigs, capacity) {
    let browsers = this.settings.browsers[name].Selenium
    while(capacity && this.tests[name].Selenium.length) {
      let
        config = this.tests[name].Selenium[0],
        runConfig = {url: config.url, scriptFile: config.scriptFile, browsers: [ ]}
      while(capacity && browsers.length > config.browserIndex) {
        runConfig.browsers.push(browsers[config.browserIndex++])
        --capacity
      }
      if(browsers.length === config.browserIndex) {
        this.tests[name].Selenium.shift()
      }
      runConfigs.push(runConfig)
    }
    return capacity
  }

  _run(runConfigs) {
    let ret = this._runPromises(runConfigs)
    return Bluebird.all(ret.promises)
    .then(results => {
      results.forEach((result, idx) => {
        let
          runConfig = ret.configs[idx],
          run = this.platforms[runConfig.name].runs[result.id]
        if('JS' === runConfig.type) {
          run.jobs.forEach((job, idx) => {
            job.nativeRunnerConfig = {url: runConfig.url, browser: runConfig.browsers[idx], name: runConfig.name, type: runConfig.type, run: result.id}
            if('retries' in runConfig) {
              job.nativeRunnerConfig.retries = runConfig.retries
            }
            this.running[runConfig.name].push(job)
          })
        }
        else {
          run.scriptJobs.forEach(scriptJob => {
            scriptJob.nativeRunnerConfig = {url: runConfig.url, scriptFile: runConfig.scriptFile, name: runConfig.name, type: runConfig.type, run: result.id}
            this.running[runConfig.name].push(scriptJob)
          })
        }
      })
      return true
    })
  }

  _runPromises(runConfigs) {
    let promises = [ ], configs = [ ]
    Object.keys(runConfigs).forEach(name => {
      Object.keys(runConfigs[name]).forEach(type => {
        let capabilities = this.settings.capabilities[name]
        runConfigs[name][type].forEach(runConfig => {
          if('Selenium' === type) {
            /* eslint-disable global-require */
            let script = require(path.resolve(process.cwd(), runConfig.scriptFile))
            /* eslint-enable global-require */
            promises.push(this.platforms[name].runScriptMultiple(
                runConfig.url, clone(runConfig.browsers), clone(capabilities), script.script, script.decider))
          }
          else {
            promises.push(this.platforms[name].runMultiple(
                runConfig.url, clone(runConfig.browsers), clone(capabilities), true))
          }
          runConfig.type = type
          runConfig.name = name
          configs.push(runConfig)
        })
      })
    })
    return {promises: promises, configs: configs}
  }

  status() {
    let ret = { }
    Object.keys(this.running).forEach(name => {
      this.running[name].forEach(job => {
        if(job.serverId) {
          let run = job.nativeRunnerConfig.run
          ret[run] = ret[run] || [ ]
          ret[run].push(job.serverId)
        }
      })
    })
    return ret
  }

  underCapacity() {
    let capacity = 0
    this.names.forEach(name => {
      capacity += this.settings.parallel[name] - this.running[name].length
    })
    return (0 !== capacity)
  }

  retry(list) {
    let runConfigs = { }, listByName = { }
    list.forEach(test => {
      let name = test.nativeRunnerConfig.name
      listByName[name] = listByName[name] || [ ]
      listByName[name].push(test)
    })
    Object.keys(listByName).forEach(name => {
      let capacity = this.settings.parallel[name] - this.running[name].length
      runConfigs[name] = {JS: [ ], Selenium: [ ]}
      listByName[name].forEach(test => {
        if(capacity) {
          let nrConfig = test.nativeRunnerConfig
          runConfigs[name].JS.push({url: nrConfig.url, retries: nrConfig.retries, browsers: [nrConfig.browser]})
          --capacity
          list.splice(list.indexOf(test), 1)
        }
      })
    })
    return this._run(runConfigs)
  }

}

function clone(params) {
  return JSON.parse(JSON.stringify(params))
}

exports.Runner = Runner
