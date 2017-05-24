'use strict'

let
  Bluebird = require('bluebird'),
  router = require('express').Router(),
  /* eslint-disable global-require */
  log = new (require('./../../../lib/core/log').Log)(process.env.LOG_LEVEL || 'ERROR', 'Server.Runners.Testem'),
  /* eslint-enable global-require */
  Factory = require('./../../../lib/platforms/factory').Factory,
  srvUtils = require('./../utils'),
  platforms = { },
  platform

function setup(req) {
  log.debug('processing %s %s', req.method, req.url, req.body)
  platform = req.params.platform
  platforms[platform] = platforms[platform] || { }
  platforms[platform].object = platforms[platform].object || Factory.get(req.params.platform)
  platforms[platform].runs = platforms[platform].runs || [ ]
  log.debug('obtained Platform handler for %s', platform)
}

router.route('/:platform')
.put(function(req, res, next) {
  setup(req)
  platforms[platform].object
  .open(req.body.capabilities)
  .then(() => {
    log.debug('opened %s', platform)
    res.json({ })
  })
  .catch(err => {
    srvUtils.error(err, res)
  })
})
.post(function(req, res, next) {
  setup(req)
  platforms[platform].object
  .run(req.body.url, req.body.browser, req.body.capabilities)
  .then(run => {
    platforms[platform].runs.push(run.id)
    log.debug('created %s run %s', platform, run.id)
    res.json({id: run.id})
  })
  .catch(err => {
    srvUtils.error(err, res)
  })
})
.delete(function(req, res, next) {
  setup(req)
  log.debug('take screenshots? %s', req.body.screenshot)
  platforms[platform].object.close(req.body.screenshot)
  .then(() => {
    log.debug('all existing %s runs stopped', platform)
    delete platforms[platform].runs
    res.end()
  })
  .catch(err => {
    srvUtils.error(err, res)
  })
})

router.route('/:platform/:run')
.delete(function(req, res, next) {
  setup(req)
  let run = req.params.run
  log.debug('take screenshots? %s', req.body.screenshot)
  return platforms[platform].object.stop(run, req.body.screenshot)
  .then(() => {
    log.debug('%s run %s stopped', platform, run)
    let idx = platforms[platform].runs.indexOf(run)
    if(idx !== -1) {
      platforms[platform].runs.splice(idx, 1)
    }
    res.end()
  })
  .catch(err => {
    srvUtils.error(err, res)
  })
})

router.use(function(req, res, next) {
  log.warn('cannot process %s %s', req.method, req.url)
  res.sendStatus(404)
})

router.use(function(err, req, res, next) {
  srvUtils.error(err, res)
})

module.exports = router
