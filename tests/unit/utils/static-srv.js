#!/usr/bin/env node

var finalhandler = require('finalhandler')
var http = require('http')
var serveStatic = require('serve-static')
 
var serve = serveStatic('.')

var lastPage = null

function createServer() {
  var server = http.createServer(function (req, res) {
    console.log(req.url)
    lastPage = req.url
    serve(req, res, finalhandler(req, res))
  })
  server.listen(3000)
}

function getLastPage() {
  return lastPage
}

createServer()

exports.createServer = createServer
exports.getLastPage = getLastPage
