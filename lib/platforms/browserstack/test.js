let
  Log = require('./../../core/log').Log,
  TestInterface = require('./../../core/interfaces/test').Test,
  Manager = require('./manager').Manager,
  Tunnel = require('./tunnel').Tunnel,
  Worker = require('./worker').Worker

let log = new Log(process.env.LOG_LEVEL || 'ERROR', 'Platforms.BrowserStack.Test')

const
  LOCAL_OPT = 'browserstack.local',
  LOCAL_ID_OPT = 'browserstack.localIdentifier'

class Test extends TestInterface {

  constructor() {
    super()
  }

  create(options) {
    if(LOCAL_OPT in options) {
      if(LOCAL_ID_OPT in options) {
        return usingIdTunnel(this, options, options[LOCAL_ID_OPT])
      }
      else {
        return usingTunnel(this, options)
      }
    }
    else {
      return createWorker(this, options)
    }
  }

  status() {
    if(!this.worker) {
      log.error('not created yet to find status')
      throw new Error('Platforms.BrowserStack.Test: not created yet to check status')
    }
    var results = { }
    if(this.tunnel) {
      results.tunnel = this.tunnel.status()
    }
    return this.worker.status()
    .then(status => {
      results.worker = status
      decideStatus(results)
      log.debug('status', results)
      return results
    })
  }

  stop() {
    return this.status()
    .then(results => {
      if('stopped' === results.status) {
        log.error('already stopped test %s worker %s', this.name, this.worker.id)
        throw new Error('Platforms.BrowserStack.Test: ' + this.name + ' already stopped')
      }
      return this.worker.terminate()
    })
    .then(() => {
      if(this.tunnel && 'running' === this.tunnel.status()) {
        return this.tunnel.stop()
      }
      return true
    })
  }
}

function usingIdTunnel(test, options, localId) {
  return Manager.withId()
  .then(withId => {
    for(let idx = 0; idx < withId.length; ++idx) {
      if(withId[idx].tunnelId === localId) {
        test.tunnel = new Tunnel()
        test.tunnel.process = withId[idx]
        return true
      }
    }
    test.tunnel = new Tunnel({ localIdentifier : localId })
    return test.tunnel.start()
  })
  .then(() => {
    return createWorker(test, options)
  })
}

function usingTunnel(test, options) {
  return Manager.withoutId()
  .then(withoutId => {
    if(withoutId.length) {
      test.tunnel = new Tunnel()
      test.tunnel.process = withoutId[0]
      return true
    }
    test.tunnel = new Tunnel()
    return test.tunnel.start()
  })
  .then(() => {
    return createWorker(test, options)
  })
}

function createWorker(test, options) {
  test.worker = new Worker()
  test.name = options.name
  return test.worker.create(options)
  .then(() => {
    return test
  })
}

function decideStatus(results) {
  if(-1 !== ['running', 'queue'].indexOf(results.worker)) {
    results.status =
      (!results.tunnel || 'running' === results.tunnel)
      ? 'running'
      : 'messy'
  }
  else {
    results.status = 'stopped'
  }
}

exports.Test = Test

