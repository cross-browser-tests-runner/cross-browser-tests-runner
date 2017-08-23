'use strict';

let
  execFile = require('child_process').execFile,
  Bluebird = require('bluebird'),
  Log = require('./log').Log

let log = new Log('Process')

class Process {

  constructor(pid) {
    this.pid = pid
    this.proc = undefined
  }

  create(command, args, callbacks) {
    function dummy() { }
    let object = this
    return new Bluebird((resolve, reject) => {
      callbacks = callbacks || { }
      object.proc = execFile(command, args)
      object.pid = object.proc.pid
      log.debug('execFile %s %s, created %d', command, args.join(' '), object.pid)
      object.proc.stdout.on('data', callbacks.onstdout || dummy)
      object.proc.stderr.on('data', callbacks.onstderr || dummy)
      object.proc.on('error', reject)
      object.proc.on('exit', resolve)
    })
  }

  status() {
    if(!this.pid) {
      throw new Error('Process: no pid associated to check status')
    }
    return exists(this.pid) ? "running" : "stopped"
  }

  stop() {
    let object = this
    return new Bluebird(resolve => {
      if(!object.pid) {
        throw new Error('Process: no pid associated to stop')
      }
      if(!object.proc) {
        throw new Error('Process: cannot kill external process')
      }
      if ('stopped' === object.status()) {
        throw new Error('Process: already stopped')
      }
      object.proc.kill()
      resolve()
    })
  }
}

function exists(pid) {
  try {
    process.kill(pid, 0)
    return true
  }
  catch(e) {
    return false
  }
}

exports.Process = Process
