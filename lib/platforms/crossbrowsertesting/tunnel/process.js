'use strict';

let
  Log = require('./../../../core/log').Log,
  Request = require('./../../../core/request').Request,
  ProcessBase = require('./../../core/tunnel/process').Process

const VARS = {
  activeTunnelsUrl: 'https://crossbrowsertesting.com/api/v3/tunnels?num=1&active=true',
  endpoint: 'https://crossbrowsertesting.com/api/v3/tunnels/{id}',
  username: process.env.CROSSBROWSERTESTING_USERNAME,
  accessKey: process.env.CROSSBROWSERTESTING_ACCESS_KEY
}

let log = new Log('Platforms.CrossBrowserTesting.Tunnel.Process')

class Process extends ProcessBase {

  constructor(pid) {
    super(pid)
  }

  create(command, args, callbacks) {
    return ProcessBase.prototype.create.apply(this, [
      command, args, callbacks,
      args => {
        ensureReqArgs(args)
      },
      stdoutFnCreator,
      exitFn
    ])
  }

  stop() {
    return ProcessBase.prototype.stop.apply(this, [
      response => {
        return 'stopped' === response.state
      },
      response => {
        return response.state
      }, {
        user: VARS.username,
        pass: VARS.accessKey
      }
    ])
  }
}

function ensureReqArgs(args) {
  ensureArg(args, '--authkey', process.env.CROSSBROWSERTESTING_ACCESS_KEY)
  ensureArg(args, '--username', process.env.CROSSBROWSERTESTING_USERNAME)
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

function stdoutFnCreator(object, command, args, resolve, reject) {
  let done = false
  object.stdout = ''
  return (data) => {
    if(done) {
      return
    }
    object.stdout += data
    log.debug('stdout from tunnel process: %s', data)
    if(data.match(/Connected for internal websites/)) {
      done = true
      handleTunnelReady(object, args, command, resolve, reject)
    }
    else if(data.match(/Authentication error! Please check your credentials and try again/)) {
      done = true
      reject(new Error('Platforms.CrossBrowserTesting.Tunnel.Process: Invalid username/api key'))
    }
    else if(data.match(/The path specified for the "ready" file already exists or cannot be created/)) {
      done = true
      reject(new Error('Platforms.CrossBrowserTesting.Tunnel.Process: cannot create ready file'))
    }
  }
}

function handleTunnelReady(object, args, command, resolve, reject) {
  let idx
  object.command = command
  apiReq(VARS.activeTunnelsUrl, 'GET')
  .then(response => {
    log.debug('response', response)
    object.serverId = response.tunnels[0].tunnel_id
    object.endpoint = VARS.endpoint.replace(/{id}/, object.serverId)
    log.info('created with pid %d serverId %s endpoint %s using %s', object.pid, object.serverId, object.endpoint, object.command)
    resolve()
  })
  .catch(err => {
    log.error('Error in getting active tunnels', err)
    reject()
  })
}

function exitFn(object, command, args, code, reject) {
  if(!object.stdout.match(/Connected for internal websites/)) {
    let
      idx = args.indexOf('--authkey'),
      keyArg = args[idx+1]
    args[idx+1] = '****'
    log.error('unexpected exit of %d, created with %s %s', object.pid, command, args.join(' '))
    args[idx+1] = keyArg
    log.error('Log of process stdout on unexpected exit:\n%s', object.stdout)
    reject(new Error('Platforms.CrossBrowserTesting.Tunnel.Process: Unexpected exit with code ' + code))
  }
}

function apiReq(url, method) {
  let options = {
    json: true,
    auth: {
      user: VARS.username,
      pass: VARS.accessKey
    }
  }
  let req = new Request()
  return req.request(url, method, options)
}

exports.Process = Process
