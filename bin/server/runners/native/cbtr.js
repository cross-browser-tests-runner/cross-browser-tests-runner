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
.post((req, res) => {
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
  res.json()
})

router.route('/coverage')
.post((req, res) => {
  log.debug('coverage data: %s', JSON.stringify(req.body, null, 2))
  const coverageDir = path.resolve(process.cwd(), 'coverage')
  fs.statAsync(coverageDir)
  .catch(() => {
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
    return (' (' + agent.device.family + ')')
  }
  return ''
}

module.exports = router
