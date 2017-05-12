var
  ps = require('ps-node'),
  path = require('path'),
  retry = require('p-retry'),
  Log = require('./../../../../../lib/core/log').Log,
  BinaryVars = require('./../../../../../lib/platforms/browserstack/tunnel/binary').BinaryVars

let log = new Log(process.env.LOG_LEVEL || 'ERROR', 'UnitTests')

function procsByCmd(cmd) {
  return new Promise(resolve => {
    ps.lookup({
      command: cmd
    },
    (err, list) => {
      if(err) throw new Error(err)
      resolve(list)
    })
  })
}

function stopProc(pid, alreadyKilled) {
  if(!alreadyKilled) {
    process.kill(pid)
  }
  while(true) {
    try {
      process.kill(pid, 0)
      sleep.sleep(1)
    }
    catch(e) {
      break
    }
  }
  log.debug('Stopped process %d', pid)
}

function tunnels() {
  return new Promise(resolve => {
    var found = [ ]
    ps.lookup({
      command: path.basename(BinaryVars.path)
    },
    function(err, list) {
      if(err) throw new Error(err)
      list = list || [ ]
      list.forEach(proc => {
        var idx = proc.arguments.indexOf('--local-identifier')
        found.push({
          pid : proc.pid,
          tunnelId: (-1 !== idx ? proc.arguments[idx+1] : undefined)
        })
      })
      resolve(found)
    })
  })
}

function awaitZeroTunnels() {
  const max = 15, minTimeout = 500, factor = 1
  let num = 0
  const check = (retries) => {
    return tunnels()
    .then(procs => {
      num = procs.length
      log.debug('number of remaining tunnel processes', num)
      if(!procs.length) {
        throw new retry.AbortError('no more tunnels')
      }
      if(retries !== max) {
        throw new Error('not exhausted retries')
      }
      return num
    })
  }
  return retry(check, { retries: max, minTimeout: minTimeout, factor: factor })
  .then(result => {
    if(result) throw new Error('remaining ' + result)
    return result
  })
  .catch(err => {
    if(!err.message.match(/no more tunnels/)) {
      throw err
    }
    return num
  })
}

exports.procsByCmd = procsByCmd
exports.stopProc = stopProc
exports.tunnels = tunnels
exports.awaitZeroTunnels = awaitZeroTunnels
