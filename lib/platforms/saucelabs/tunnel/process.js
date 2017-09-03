'use strict';

let
  execFile = require('child_process').execFile,
  uuidv4 = require('uuid/v4'),
  Bluebird = require('bluebird'),
  retry = require('p-retry'),
  Log = require('./../../../core/log').Log,
  Request = require('./../../../core/request').Request,
  ProcessBase = require('./../../../core/process').Process

const VARS = {
  endpoint: 'https://saucelabs.com/rest/v1/' + process.env.SAUCE_USERNAME + '/tunnels/{id}',
  username: process.env.SAUCE_USERNAME,
  accessKey: process.env.SAUCE_ACCESS_KEY
}

let log = new Log('Platforms.SauceLabs.Tunnel.Process')

class Process extends ProcessBase {

  constructor(pid, tunnelId) {
    super(pid)
    this.tunnelId = tunnelId
  }

  create(command, args, callbacks) {
    if(-1 !== args.indexOf('--tunnel-identifier')) {
      ensureArg(args, '--tunnel-identifier', uuidv4())
    }
    ensureReqArgs(args)
    callbacks = callbacks || { }
    if(!callbacks.onstderr) {
      callbacks.onstderr = (err) => {
        log.warn('unexpected stderr', err, this)
      }
    }
    return create(this, command, args, callbacks)
  }

  stop() {
    this.stopping = true
    return apiReq(this.endpoint, 'DELETE')
    .then(() => {
      return waitForServerExit(this)
    })
    .then(() => {
      return ProcessBase.prototype.stop.call(this)
    })
    .then(() => {
      return waitForExit(this)
    })
    .catch(err => {
      if(err.message.match(/already stopped/)) {
        return Promise.resolve(true)
      }
      throw err
    })
  }

}

function create(object, command, args, callbacks) {
  return new Bluebird((resolve, reject) => {
    object.proc = execFile(command, args)
    object.pid = object.proc.pid
    log.debug('execFile %s %s, created %d', command, args.join(' '), object.pid)
    object.proc.stdout.on('data', stdoutProcFn(resolve, reject, object, command, args))
    object.proc.stderr.on('data', callbacks.onstderr)
    object.proc.on('error', reject)
    object.proc.on('exit', code => {
      if(!object.stdout.match(/Got signal terminated/) &&
         !object.stdout.match(/Got signal interrupt/) &&
         !object.stdout.match(/Remote tunnel VM has been terminated by user request/))
      {
        let
          idx = args.indexOf('--api-key'),
          keyArg = args[idx+1]
        args[idx+1] = '****'
        log.error('unexpected exit of %d, created with %s %s', object.pid, command, args.join(' '))
        args[idx+1] = keyArg
        log.error('Log of process stdout on unexpected exit:\n%s', object.stdout)
        reject(new Error('Platforms.SauceLabs.Tunnel.Process: Unexpected exit with code ' + code))
      }
    })
  })
}

function stdoutProcFn(resolve, reject, object, command, args) {
  object.stdout = ''
  return (data) => {
    object.stdout += data
    log.debug('stdout from tunnel process: %s', data)
    if(data.match(/Provisioned tunnel:[0-9a-z]+/)) {
      handleServerIdData(object, data)
    }
    if(data.match(/Sauce Connect is up, you may start your tests/)) {
      handleTunnelReady(object, args, command)
      resolve()
      return
    }
    if(data.match(/error was: {"message": "Not authorized"}. HTTP status: 401 Unauthorized/)) {
      reject(new Error('Platforms.SauceLabs.Tunnel.Process: Invalid username/api key'))
    }
  }
}

function handleServerIdData(object, data) {
  object.serverId = data.match(/.*Provisioned tunnel:([0-9a-z]+).*/)[1]
  object.endpoint = VARS.endpoint.replace(/{id}/, object.serverId)
  log.debug('Obtained server-side tunnel identifier %s', object.serverId)
}

function handleTunnelReady(object, args, command) {
  let idx
  if (-1 !== (idx = args.indexOf('--tunnel-identifier'))) {
    object.tunnelId = args[idx+1]
  }
  object.command = command
  log.info('created with pid %d tunnelId %s serverId %s endpoint %s using %s', object.pid, object.tunnelId, object.serverId, object.endpoint, object.command)
}

function waitForServerExit(proc) {
  let max = 60, factor = 1, minTimeout = 2000
  const check = () => {
    return apiReq(proc.endpoint, 'GET')
    .then(response => {
      if('terminated' === response.status) {
        log.debug('server tunnel instance (serverId %s) for tunnel %d is terminated', proc.serverId, proc.pid)
        return true
      }
      log.debug('pid %d serverId %s not terminated yet on server side, status reported %s', proc.pid, proc.serverId, response.status)
      throw new Error('Platforms.SauceLabs.Tunnel.Process: not terminated on server side yet')
    })
  }
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
}

function waitForExit(proc) {
  let max = 60, factor = 1, minTimeout = 2000
  const check = () => {
    if('stopped' === proc.status()) {
      log.debug('killed')
      delete proc.stopping
      return true
    }
    log.debug('still alive...')
    throw new Error('waiting for process to die')
  }
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
}

function ensureReqArgs(args) {
  ensureArg(args, '--api-key', process.env.SAUCE_ACCESS_KEY)
  ensureArg(args, '--user', process.env.SAUCE_USERNAME)
}

function ensureArg(args, arg, def) {
  let idx
  if(-1 === (idx = args.indexOf(arg))) {
    args.push(arg, def)
  }
  else if((idx + 1) === args.length) {
    args.push(def)
  }
}

function apiReq(url, method, body) {
  let options = {
    json: true,
    auth: {
      user: VARS.username,
      pass: VARS.accessKey
    }
  }
  if(body) {
    options.body = body
  }
  let req = new Request()
  return req.request(url, method, options)
}

exports.Process = Process
