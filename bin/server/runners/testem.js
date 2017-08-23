'use strict'

let
  router = require('express').Router(),
  Factory = require('./../../../lib/platforms/factory').Factory,
  srvUtils = require('./../utils'),
  platforms = { },
  platform

function setup(req) {
  platform = req.params.platform
  platforms[platform] = platforms[platform] || { }
  platforms[platform].object = platforms[platform].object || Factory.get(req.params.platform)
  platforms[platform].runs = platforms[platform].runs || [ ]
}

router.route('/:platform')
.put(function(req, res) {
  setup(req)
  platforms[platform].object
  .open(req.body.capabilities)
  .then(() => {
    res.json({ })
  })
  .catch(err => {
    srvUtils.error(err, res)
  })
})
.post(function(req, res) {
  setup(req)
  platforms[platform].object
  .run(req.body.url, req.body.browser, req.body.capabilities)
  .then(run => {
    platforms[platform].runs.push(run.id)
    res.json({id: run.id})
  })
  .catch(err => {
    srvUtils.error(err, res)
  })
})
.delete(function(req, res) {
  setup(req)
  platforms[platform].object.close(req.body.screenshot)
  .then(() => {
    delete platforms[platform].runs
    res.end()
  })
  .catch(err => {
    srvUtils.error(err, res)
  })
})

router.route('/:platform/:run')
.delete(function(req, res) {
  setup(req)
  let run = req.params.run
  return platforms[platform].object.stop(run, req.body.screenshot)
  .then(() => {
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

srvUtils.defaults(router)

module.exports = router
