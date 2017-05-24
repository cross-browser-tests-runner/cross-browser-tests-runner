'use strict'

let
  router = require('express').Router(),
  testemRouter = require('./runners/testem')

router.use('/testem', testemRouter)

module.exports = router
