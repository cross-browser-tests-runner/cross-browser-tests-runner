'use strict';

let
  spawn = require('child_process').spawn,
  sleep = require('sleep'),
  uuidv4 = require('uuid/v4'),
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
    let proc = this
    callbacks.onstdout = function(out) {
      pidFromStdout(proc, out)
    }
    return super.create.apply(this, [command, args, callbacks]).then(function() {
      let idx
      if (-1 !== (idx = args.indexOf('--local-identifier'))) {
        proc.tunnelId = args[idx+1]
      }
      proc.command = command
      log.info('created with pid %d tunnelId %s using %s', proc.pid, proc.tunnelId, proc.command)
      return true
    })
  }

  stop() {
    return new Bluebird(resolve => {
      if(!this.pid) {
        log.error('no pid associated to stop')
        throw new Error('Process: no pid associated to stop')
      }
      if ('stopped' === this.status()) {
        log.error('is already stopped')
        throw new Error('Process: already stopped')
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
  try {
    proc.pid = (JSON.parse(stdout)).pid
    log.info('pid for the final daemon process %d', proc.pid)
  }
  catch(e) {
    // Whenever there is something else on stdout, JSON.parse
    // is going to throw errors, which we silently ignore as
    // there are no side effects for us
  }
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
