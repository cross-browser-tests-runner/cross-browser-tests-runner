'use strict'

let
  Bluebird = require('bluebird'),
  path = require('path'),
  fs = Bluebird.promisifyAll(require('fs')),
  router = require('express').Router(),
  useragent = require('useragent'),
  Log = require('./../../../../lib/core/log').Log,
  log = new Log('Server.Runners.Native.Cbtr'),
  srvUtils = require('./../../utils'),
  args = require('minimist')(process.argv.slice(2), {
    string: ['config'],
    boolean: ['errors-only', 'native-runner', 'omit-traces'],
    alias: {config: 'c', 'errors-only': 'e', 'native-runner': 'n', 'omit-traces': 'o'}
  }),
  cbtrLog = require('./cbtr-log')

router.route('/run')
.post(function(req, res) {
  log.debug('results: %s', JSON.stringify(req.body, null, 2))
  if(!req.body.suites) {
    res.json()
    return
  }
  let agent = useragent.parse(req.headers['user-agent'])
  cbtrLog.header(agentStr(agent), req.body)
  req.body.suites.forEach(suite => {
    cbtrLog.suite(suite, '  ', args)
  })
  console.log('')
  res.json()
})

router.route('/coverage')
.post(function(req, res) {
  log.debug('coverage data: %s', JSON.stringify(req.body, null, 2))
  const coverageDir = path.resolve(process.cwd(), 'coverage')
  fs.statAsync(coverageDir)
  .then(stats => {
    if(!stats.isDirectory()) {
      log.error('cannot store coverage data as %s is not a directory', coverageDir)
      throw new Error('not a directory')
    }
    return true
  })
  .catch(err => {
    if(err.message.match(/not a directory/)) {
      throw err
    }
    return fs.mkdirAsync(coverageDir)
  })
  .then(() => {
    const covFile = path.resolve(coverageDir, 'coverage-' + Math.random() + '.json')
    return fs.writeFileAsync(covFile, JSON.stringify(req.body))
  })
  .then(() => {
    res.json()
  })
})

srvUtils.defaults(router)

function agentStr(agent) {
  return agentFamilyStr(agent) + agentOsStr(agent) + agentDeviceStr(agent)
}

function agentFamilyStr(agent) {
  return (agent.family + ' ' + agent.major + '.' + agent.minor)
}

function agentOsStr(agent) {
  return (' ' + agent.os.family
    + ('0' !== agent.os.major ? (' ' + agent.os.major + '.' + agent.os.minor) : '')
  )
}

function agentDeviceStr(agent) {
  if(agent.device && 'Other' !== agent.device.family) {
    return (' (' + agent.device.family
      + ('0' !== agent.device.major ? (' ' + agent.device.major + '.' + agent.device.minor) : '')
      + ')'
    )
  }
  return ''
}

module.exports = router
