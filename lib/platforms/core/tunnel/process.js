'use strict';

let
  execFile = require('child_process').execFile,
  Bluebird = require('bluebird'),
  retry = require('p-retry'),
  Log = require('./../../../core/log').Log,
  Request = require('./../../../core/request').Request,
  ProcessBase = require('./../../../core/process').Process

let log = new Log('Platforms.Core.Tunnel.Process')

class Process extends ProcessBase {

  constructor(pid, tunnelId) {
    super(pid)
    this.tunnelId = tunnelId
  }

  create(command, args, callbacks, argsParser, stdoutFnCreator, exitFn) {
    argsParser(args)
    callbacks = callbacks || { }
    if(!callbacks.onstderr) {
      callbacks.onstderr = (err) => {
        log.warn('unexpected stderr', err, this)
      }
    }
    return new Bluebird((resolve, reject) => {
      this.proc = execFile(command, args)
      this.pid = this.proc.pid
      log.debug('execFile %s %s, created %d', command, args.join(' '), this.pid)
      this.proc.stdout.on('data', stdoutFnCreator(this, command, args, resolve, reject))
      this.proc.stderr.on('data', callbacks.onstderr)
      this.proc.on('error', reject)
      this.proc.on('exit', code => {
        exitFn(this, command, args, code, reject)
      })
    })
  }

  stop(isStopped, getStatus, auth) {
    return apiReq(this.endpoint, 'DELETE', auth)
    .then(() => {
      return waitForServerExit(this, isStopped, getStatus, auth)
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

function waitForServerExit(proc, isStopped, getStatus, auth) {
  let max = 60, factor = 1, minTimeout = 2000
  const check = () => {
    return apiReq(proc.endpoint, 'GET', auth)
    .then(response => {
      if(isStopped(response)) {
        log.debug('server tunnel instance (serverId %s) corresponding to tunnel with pid %d is stopped', proc.serverId, proc.pid)
        return true
      }
      log.debug('serverId %s not terminated yet on server, status is %s', proc.pid, proc.serverId, getStatus(response))
      throw new Error('Platforms.Core.Tunnel.Process: not terminated on server side yet')
    })
  }
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
}

function waitForExit(proc) {
  let max = 60, factor = 1, minTimeout = 2000
  const check = () => {
    if('stopped' === proc.status()) {
      log.debug('killed')
      return true
    }
    log.debug('still alive...')
    throw new Error('waiting for process to die')
  }
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
}

function apiReq(url, method, auth) {
  let options = {
    json: true,
    auth: auth
  }
  let req = new Request()
  return req.request(url, method, options)
}

exports.Process = Process
