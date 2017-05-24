'use strict';

let
  spawn = require('child_process').spawn,
  sleep = require('sleep'),
  uuidv4 = require('uuid/v4'),
  retry = require('p-retry'),
  Bluebird = require('bluebird'),
  Log = require('./../../../core/log').Log,
  ProcessBase = require('./../../../core/process').Process

let log = new Log(process.env.LOG_LEVEL || 'ERROR', 'Platforms.BrowserStack.Tunnel.Process')

class Process extends ProcessBase {

  constructor(pid, tunnelId) {
    super(pid)
    this.tunnelId = tunnelId
  }

  create(command, args, callbacks) {
    if(-1 !== args.indexOf('--local-identifier')) {
      ensureArg(args, '--local-identifier', uuidv4())
    }
    ensureReqArgs(args)
    callbacks = callbacks || { }
    if(!callbacks.onstderr) {
      callbacks.onstderr = (err) => {
        log.warn('unexpected stderr', err, this)
      }
    } else {
      this.expectingErrors = true
    }
    callbacks.onstdout = (out) => {
      pidFromStdout(this, out)
    }
    return loopCreate(this, super.create, command, args, callbacks)
  }

  stop() {
    return new Bluebird(resolve => {
      if(!this.pid) {
        log.error('no pid associated to stop')
        throw new Error('Platforms.BrowserStack.Tunnel.Process: no pid associated to stop')
      }
      if ('stopped' === this.status()) {
        log.error('is already stopped')
        throw new Error('Platforms.BrowserStack.Tunnel.Process: already stopped')
      }
      log.debug('stopping pid %d tunnelId %s', this.pid, this.tunnelId)
      if(this.command) {
        commandStop(this, resolve)
      }
      else {
        kill(this, resolve)
      }
    })
  }
}

function pidFromStdout(proc, stdout) {
  log.debug('stdout of tunnel process', stdout)
  var parsed
  try {
    parsed = JSON.parse(stdout)
  }
  catch(e) {
    // Whenever there is something else on stdout, JSON.parse
    // is going to throw errors, which we silently ignore as
    // there are no side effects for us
  }
  if(parsed && 'string' === typeof(parsed.state)
      && 'string' === typeof(parsed.message)
      && 'connected' === parsed.state.toLowerCase()
      && 'connected' === parsed.message.toLowerCase())
  {
    proc.pid = parseInt(parsed.pid, 10)
    proc.gotFinalPid = true
    log.info('pid for the final daemon process %d', proc.pid)
  }
  /*else {
    log.warn('process not in connected state', stdout)
  }*/
}

function loopCreate(proc, method, command, args, callbacks) {
  const max = 5, minTimeout = 500, factor = 1
  const check = () => {
    return method.apply(proc, [command, args, callbacks])
    .then(() => {
      return waitForPid(proc)
    })
    .then(() => {
      let idx
      if (-1 !== (idx = args.indexOf('--local-identifier'))) {
        proc.tunnelId = args[idx+1]
      }
      proc.command = command
      log.info('created with pid %d tunnelId %s using %s', proc.pid, proc.tunnelId, proc.command)
      return true
    })
  }
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
}

function waitForPid(proc) {
  const max = 5, minTimeout = 200, factor = 2
  const check = () => {
    if(proc.expectingErrors) {
      log.debug('with user-specified onstderr handler, no need to wait for pid')
      return true
    }
    if(proc.gotFinalPid) {
      return true
    }
    log.debug('stdout handler has not yet been called, waiting for it...')
    throw new Error('Platforms.BrowserStack.Tunnel.Process: unexpectedly did not get pid of the final process')
  }
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
}

function ensureReqArgs(args) {
  ensureArg(args, '--daemon', 'start')
  ensureArg(args, '--key', process.env.BROWSERSTACK_ACCESS_KEY)
}

function ensureArg(args, arg, def) {
  let idx
  if(-1 === (idx = args.indexOf(arg))) {
    log.debug('"%s" has not been specified, adding with value %s', arg, def)
    args.push(arg, def)
  }
  else if((idx + 1) === args.length) {
    log.debug('"%s" has been specified without value, adding the value %s', arg, def)
    args.push(def)
  }
  else if(args[idx+1].match(/^\-\-/)) {
    log.debug('"%s" has been specified without value, adding the value %s', arg, def)
    args.splice(idx+1, 0, def)
  }
}

function commandStop(proc, callback) {
  let args = [ '--daemon', 'stop' ]
  if(proc.tunnelId) {
    args.push('--local-identifier', proc.tunnelId)
  }
  log.debug('spawn %s %s', proc.command, args.join(' '))
  let spawned = spawn(proc.command, args, { detached : true })
  spawned.on('exit', function(code, signal) {
    log.debug('terminated with %d %s', code, signal)
    callback()
  })
}

function kill(proc, callback) {
  process.kill(proc.pid)
  while('running' === proc.status()) {
    sleep.msleep(200)
  }
  callback()
}

exports.Process = Process
