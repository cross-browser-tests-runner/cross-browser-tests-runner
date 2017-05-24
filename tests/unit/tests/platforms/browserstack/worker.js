'use strict';

var
  chai = require('chai'),
  worker = require('./../../../../../lib/platforms/browserstack/worker'),
  Worker = worker.Worker,
  WorkerVars = worker.WorkerVars,
  utils = require('./utils')

var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
var
  expect = chai.expect,
  should = chai.should()

describe('create', function() {

  var worker = new Worker()
  this.timeout(0)

  it('should fail in case of invalid authorization', function() {
    return worker.create({
      username: 'abc',
      password: 'abc'
    })
    .should.be.rejectedWith('Basic: Access denied')
  })

  it('should fail with no capabilities provided', function() {
    return worker.create({ })
    .should.be.rejectedWith('422 - {"message":"Validation Failed"')
  })

  it('should fail with bad os capability', function() {
    return worker.create({
      os : 'Linux'
    })
    .should.be.rejectedWith('422 - {"message":"Validation Failed","errors":[{"field":"os_version","code":"can\'t be blank"},{"field":"url","code":"can\'t be blank"},{"field":"os","code":"invalid"}]}')
  })

  it('should fail with bad os version capability', function() {
    return worker.create({
      os : 'Windows',
      os_version : '6.0'
    })
    .should.be.rejectedWith('422 - {"message":"Validation Failed","errors":[{"field":"url","code":"can\'t be blank"},{"field":"os_version","code":"invalid"}]}')
  })

  it('should fail without url capability', function() {
    return worker.create({
      os : 'Windows',
      os_version : '10'
    })
    .should.be.rejectedWith('422 - {"message":"Validation Failed","errors":[{"field":"url","code":"can\'t be blank"},{"field":"browser","code":"required"}]}')
  })

  it('should fail without browser capability', function() {
    return worker.create({
      os : 'Windows',
      os_version : '10',
      url : 'http://www.piaxis.tech'
    })
    .should.be.rejectedWith('422 - {"message":"Validation Failed","errors":[{"field":"browser","code":"required"}]}')
  })

  it('should fail with bad browser capability', function() {
    return worker.create({
      os : 'Windows',
      os_version : '10',
      url : 'http://www.piaxis.tech',
      browser : 'Ubuntu'
    })
    .should.be.rejectedWith('422 - {"message":"Validation Failed","errors":[{"field":"browser","code":"invalid"},{"field":"browser_version","code":"invalid"}]}')
  })

  it('should fail without browser version capability', function() {
    return worker.create({
      os : 'Windows',
      os_version : '10',
      url : 'http://www.piaxis.tech',
      browser : 'chrome'
    })
    .should.be.rejectedWith('422 - {"message":"Validation Failed","errors":[{"field":"browser_version","code":"invalid"}]}')
  })

  it('should fail with bad browser version capability', function() {
    return worker.create({
      os : 'Windows',
      os_version : '10',
      url : 'http://www.piaxis.tech',
      browser : 'chrome',
      browser_version : '10.0'
    })
    .should.be.rejectedWith('422 - {"message":"Validation Failed","errors":[{"field":"browser_version","code":"invalid"}]}')
  })

  it('should create a remote url test', function() {
    return worker.create({
      os : 'Windows',
      os_version : '10',
      url : 'http://www.piaxis.tech',
      browser : 'chrome',
      browser_version : '45.0',
    })
    .then(() => {
      expect(worker.id).to.be.defined
      return utils.safeKillWorker(worker)
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should create a local url test', function() {
    return worker.create({
      os : 'Windows',
      os_version : '10',
      url : 'http://localhost:3000/tests/pages/tests.html',
      browser : 'chrome',
      browser_version : '45.0',
      'browserstack.local' : true
    })
    .then(() => {
      expect(worker.id).to.be.defined
      return utils.safeKillWorker(worker)
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should create a url test with other optional capabilities', function() {
    return worker.create({
      os : 'Windows',
      os_version : '10',
      url : 'http://localhost:3000/tests/pages/tests.html',
      browser : 'chrome',
      browser_version : '45.0',
      'browserstack.local' : true,
      'browserstack.debug' : true,
      'browserstack.video' : true,
      project: 'cross-browser-test-runner',
      build: 'initial',
      name: 'my-js-test'
    })
    .then(() => {
      expect(worker.id).to.be.defined
      return utils.safeKillWorker(worker)
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

})

describe('status', function() {

  var worker = new Worker()
  this.timeout(0)

  it('should give running status for a valid worker', function() {
    return worker.create({
      os : 'Windows',
      os_version : '10',
      url : 'http://www.piaxis.tech',
      browser : 'chrome',
      browser_version : '45.0',
    })
    .then(() => {
      return worker.status()
    })
    .then(status => {
      expect(status).to.be.oneOf(['running', 'queue'])
      return utils.safeKillWorker(worker)
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should give terminated status for an invalid worker', function() {
    return worker.create({
      os : 'Windows',
      os_version : '10',
      url : 'http://www.piaxis.tech',
      browser : 'chrome',
      browser_version : '45.0',
    })
    .then(() => {
      worker.id = 'xxxxxxxxxxxx'
      worker.endpoint = worker.processed.settings.host + WorkerVars.workerApiEndpoint + '/' + worker.id
      return worker.status()
    })
    .then(status => {
      expect(status).to.equal('terminated')
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

})

describe('terminate', function() {

  var worker = new Worker()
  this.timeout(0)

  it('should terminate a running worker', function() {
    return worker.create({
      os : 'Windows',
      os_version : '10',
      url : 'http://www.piaxis.tech',
      browser : 'chrome',
      browser_version : '45.0',
    })
    .then(() => {
      return worker.terminate()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should safely terminate a stopped worker', function() {
    return worker.create({
      os : 'Windows',
      os_version : '10',
      url : 'http://www.piaxis.tech',
      browser : 'chrome',
      browser_version : '45.0',
    })
    .then(() => {
      return worker.terminate()
    })
    .then(() => {
      return worker.terminate()
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

})

describe('screenshot', function() {

  this.timeout(0)

  it('should create a screenshot for a valid worker', function() {
    var worker = new Worker()
    return worker.create({
      os : 'Windows',
      os_version : '10',
      url : 'http://www.piaxis.tech',
      browser : 'chrome',
      browser_version : '45.0',
    })
    .then(() => {
      return worker.screenshot()
    })
    .then(url => {
      expect(url).to.contain('https://s3.amazonaws.com/testautomation')
      expect(url).to.contain('js-screenshot')
      expect(url).to.contain('.png')
    })
    .catch(err => {
      if(err.message && err.message.match(/Terminal not alloted yet, cannot process screenshot at the moment/)) {
        return true
      }
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should fail for invalid worker', function() {
    var worker = new Worker()
    return worker.create({
      os : 'Windows',
      os_version : '10',
      url : 'http://www.piaxis.tech',
      browser : 'chrome',
      browser_version : '45.0',
    })
    .then(() => {
      worker.id = 'xxxxxxxxxxxx'
      worker.endpoint = worker.processed.settings.host + WorkerVars.workerApiEndpoint + '/' + worker.id
      return worker.screenshot()
    })
    .catch(err => {
      if(err.message && err.message.match(/{"message":"Worker not found","errors":\[{"field":"id","code":"invalid"}\]}/))
      {
        utils.log.debug('taking screenshot failed expectedly for invalid worker - %s', err)
        return true
      }
      else {
        utils.log.error(err)
        throw err
      }
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

  it('should fail for a terminated worker', function() {
    var worker = new Worker()
    return worker.create({
      os : 'Windows',
      os_version : '10',
      url : 'http://www.piaxis.tech',
      browser : 'chrome',
      browser_version : '45.0',
    })
    .then(() => {
      return worker.terminate()
    })
    .then(() => {
      return worker.screenshot()
    })
    .catch(err => {
      if(err.message && err.message.match(/{"message":"Worker not found","errors":\[{"field":"id","code":"invalid"}\]}/))
      {
        utils.log.debug('taking screenshot failed expectedly for invalid worker - %s', err)
        return true
      }
      else {
        utils.log.error(err)
        throw err
      }
    })
    .catch(err => {
      utils.log.error(err)
      throw err
    })
    .should.be.fulfilled
  })

})
