'use strict';

let
  uuidv4 = require('uuid/v4'),
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

  constructor(pid, tunnelId) {
    super(pid)
    this.tunnelId = tunnelId
  }

  create(command, args, callbacks) {
    return ProcessBase.prototype.create.apply(this, [
      command, args, callbacks,
      args => {
        if(-1 !== args.indexOf('--tunnelname')) {
          ensureArg(args, '--tunnelname', uuidv4())
        }
        ensureReqArgs(args)
        args.push('--tunnel')
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
  }
}

function handleTunnelReady(tunnel, args, command, resolve, reject) {
  tunnel.command = command
  apiReq(VARS.activeTunnelsUrl, 'GET')
  .then(response => {
    log.debug('response', response)
    let idx
    if (-1 !== (idx = args.indexOf('--tunnelname'))) {
      tunnel.tunnelId = args[idx+1]
    }
    tunnel.serverId = response.tunnels[0].tunnel_id
    tunnel.endpoint = VARS.endpoint.replace(/{id}/, tunnel.serverId)
    log.info('created with pid %d tunnel-id %s serverId %s endpoint %s using %s', tunnel.pid, tunnel.tunnelId, tunnel.serverId, tunnel.endpoint, tunnel.command)
    resolve()
  })
  .catch(reject)
}

function exitFn(tunnel, command, args, code, reject) {
  if(!tunnel.stdout.match(/Connected for internal websites/)) {
    let
      idx = args.indexOf('--authkey'),
      keyArg = args[idx+1]
    args[idx+1] = '****'
    log.error('unexpected exit of %d, created with %s %s', tunnel.pid, command, args.join(' '))
    args[idx+1] = keyArg
    log.error('Log of process stdout on unexpected exit:\n%s', tunnel.stdout)
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
