'use strict';

let
  uuidv4 = require('uuid/v4'),
  retry = require('p-retry'),
  Log = require('./../../../core/log').Log,
  ProcessBase = require('./../../core/tunnel/process').Process

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
    const iteration = () => {
      return ProcessBase.prototype.create.apply(this, [
        command, args, callbacks,
        args => {
          if(-1 !== args.indexOf('--tunnel-identifier')) {
            ensureArg(args, '--tunnel-identifier', uuidv4())
          }
          ensureReqArgs(args)
        },
        stdoutFnCreator,
        exitFn
      ])
      .catch(err => {
        if(this.failedToConnect) {
          delete this.failedToConnect
          throw err
        }
        throw new retry.AbortError(err.message)
      })
    }
    return retry(iteration, {retries: 3, minTimeout: 100, factor: 1})
  }

  stop() {
    return ProcessBase.prototype.stop.apply(this, [
      response => {
        return 'terminated' === response.status
      },
      response => {
        return response.status
      }, {
        user: VARS.username,
        pass: VARS.accessKey
      }
    ])
  }

}

function stdoutFnCreator(object, command, args, resolve, reject) {
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

function exitFn(object, command, args, code, reject) {
  if(!object.stdout.match(/Got signal terminated/) &&
     !object.stdout.match(/Got signal interrupt/) &&
     !object.stdout.match(/Remote tunnel VM has been terminated by user request/))
  {
    if((object.stdout.match(/ \- Cleaning up\./) && object.stdout.match(/Sauce Connect could not establish a connection/))
      || object.stdout.match(/didn't come up after/)
      || object.stdout.match(/Service is temporarily unavailable/))
    {
      // this is the signature of bring-up failure that occurs intermittently
      log.warn('failed to setup a connection')
      object.failedToConnect = true
    }
    let
      idx = args.indexOf('--api-key'),
      keyArg = args[idx+1]
    args[idx+1] = '****'
    log.error('unexpected exit of %d, created with %s %s', object.pid, command, args.join(' '))
    args[idx+1] = keyArg
    log.error('Log of process stdout on unexpected exit:\n%s', object.stdout)
    reject(new Error('Platforms.SauceLabs.Tunnel.Process: Unexpected exit with code ' + code))
  }
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

exports.Process = Process
