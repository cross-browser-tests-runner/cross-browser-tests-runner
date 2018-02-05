'use strict'

let
  Bluebird = require('bluebird'),
  path = require('path'),
  fs = Bluebird.promisifyAll(require('fs')),
  Log = require('./../../../../lib/core/log').Log,
  Request = require('./../../../../lib/core/request').Request,
  log = new Log('Utils.Conf.Common'),
  configFile,
  config

function main(platform, reqs, auth) {
  initConfig(platform)
  return Bluebird.all(reqs.map(req => { return reqHandler(req, auth) }))
  .then(() => {
    log.debug('parsed %s', JSON.stringify(config, null, 2))
    return fs.writeFileAsync(configFile, JSON.stringify(config, null, 2))
  })
  .then(() => {
    console.log('Updated ' + platform + ' JS and Selenium testing configuration')
    return true
  })
}

function initConfig(platform) {
  let platformLc = platform.toLowerCase()
  configFile = path.resolve(__dirname, './../../../../conf/' + platformLc + '-conf.json')
  config = JSON.parse(fs.readFileSync(configFile, 'utf8'))
  config.JS = { }
  config.Selenium = { }
}

function reqHandler(req, auth) {
  let request = new Request()
  return request.request(req.url, 'GET', {
    json: true,
    auth: auth
  })
  .then(browsers => {
    log.debug('browsers from api %s', req.url, browsers)
    browsers.forEach(browser => {
      req.process(browser, config)
    })
    return Bluebird.resolve(true)
  })
}

exports.run = main
