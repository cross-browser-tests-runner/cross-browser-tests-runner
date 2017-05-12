var
  expect = require('chai').expect,
  sleep = require('sleep'),
  worker = require('./../../../../../lib/platforms/browserstack/worker'),
  Worker = worker.Worker,
  WorkerVars = worker.WorkerVars

describe('create', function() {

  var worker = new Worker(), timer

  function done() {
  }

  it('should fail in case of invalid authorization', function(done) {
    this.timeout(20000)
    timer = setTimeout(done, 19000)
    worker.create({
      username: 'abc',
      password: 'abc'
    })
    .catch(error => {
      clearTimeout(timer)
      expect(error.message).to.contain('Basic: Access denied')
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should fail with no capabilities provided', function(done) {
    this.timeout(20000)
    timer = setTimeout(done, 19000)
    worker.create({ })
    .catch(error => {
      clearTimeout(timer)
      expect(error.message).to.contain('422 - {"message":"Validation Failed"')
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should fail with bad os capability', function(done) {
    this.timeout(20000)
    timer = setTimeout(done, 19000)
    worker.create(
    {
      os : 'Linux'
    })
    .catch(error => {
      clearTimeout(timer)
      expect(error.message).to.contain('422 - {"message":"Validation Failed"')
      expect(error.message).to.contain('"field":"os","code":"invalid"')
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should fail with bad os version capability', function(done) {
    this.timeout(20000)
    timer = setTimeout(done, 19000)
    worker.create(
    {
      os : 'Windows',
      os_version : '6.0'
    })
    .catch(error => {
      clearTimeout(timer)
      expect(error.message).to.contain('422 - {"message":"Validation Failed"')
      expect(error.message).to.contain('"field":"os_version","code":"invalid"')
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should fail without url capability', function(done) {
    this.timeout(20000)
    timer = setTimeout(done, 19000)
    worker.create(
    {
      os : 'Windows',
      os_version : '10'
    })
    .catch(error => {
      clearTimeout(timer)
      expect(error.message).to.contain('422 - {"message":"Validation Failed"')
      expect(error.message).to.contain('"field":"url","code":"can\'t be blank"')
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should fail without browser capability', function(done) {
    this.timeout(20000)
    timer = setTimeout(done, 19000)
    worker.create(
    {
      os : 'Windows',
      os_version : '10',
      url : 'http://www.piaxis.tech'
    })
    .catch(error => {
      clearTimeout(timer)
      expect(error.message).to.contain('422 - {"message":"Validation Failed"')
      expect(error.message).to.contain('"field":"browser","code":"required"')
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should fail with bad browser capability', function(done) {
    this.timeout(20000)
    timer = setTimeout(done, 19000)
    worker.create(
    {
      os : 'Windows',
      os_version : '10',
      url : 'http://www.piaxis.tech',
      browser : 'Ubuntu'
    })
    .catch(error => {
      clearTimeout(timer)
      expect(error.message).to.contain('422 - {"message":"Validation Failed"')
      expect(error.message).to.contain('"field":"browser","code":"invalid"')
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should fail without browser version capability', function(done) {
    this.timeout(20000)
    timer = setTimeout(done, 19000)
    worker.create(
    {
      os : 'Windows',
      os_version : '10',
      url : 'http://www.piaxis.tech',
      browser : 'chrome'
    })
    .catch(error => {
      clearTimeout(timer)
      expect(error.message).to.contain('422 - {"message":"Validation Failed"')
      expect(error.message).to.contain('"field":"browser_version","code":"invalid"')
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should fail with bad browser version capability', function(done) {
    this.timeout(20000)
    timer = setTimeout(done, 19000)
    worker.create(
    {
      os : 'Windows',
      os_version : '10',
      url : 'http://www.piaxis.tech',
      browser : 'chrome',
      browser_version : '10.0'
    })
    .catch(error => {
      clearTimeout(timer)
      expect(error.message).to.contain('422 - {"message":"Validation Failed"')
      expect(error.message).to.contain('"field":"browser_version","code":"invalid"')
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should create a remote url test', function(done) {
    this.timeout(20000)
    timer = setTimeout(done, 19000)
    worker.create(
    {
      os : 'Windows',
      os_version : '10',
      url : 'http://www.piaxis.tech',
      browser : 'chrome',
      browser_version : '45.0',
    })
    .then(() => {
      clearTimeout(timer)
      expect(worker.id).to.be.defined
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should create a local url test', function(done) {
    this.timeout(20000)
    timer = setTimeout(done, 19000)
    worker.create(
    {
      os : 'Windows',
      os_version : '10',
      url : 'http://localhost:3000/tests/pages/tests.html',
      browser : 'chrome',
      browser_version : '45.0',
      'browserstack.local' : true
    })
    .then(() => {
      clearTimeout(timer)
      expect(worker.id).to.be.defined
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should create a url test with other optional capabilities', function(done) {
    this.timeout(20000)
    timer = setTimeout(done, 19000)
    worker.create(
    {
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
      clearTimeout(timer)
      expect(worker.id).to.be.defined
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

})

describe('status', function() {

  var worker = new Worker(), timer

  function done() {
  }

  it('should give running status for a valid worker', function(done) {
    this.timeout(20000)
    timer = setTimeout(done, 19000)
    worker.create(
    {
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
      clearTimeout(timer)
      expect(['running', 'queue']).to.include(status)
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should give terminated status for an invalid worker', function(done) {
    this.timeout(20000)
    timer = setTimeout(done, 19000)
    worker.create(
    {
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
      clearTimeout(timer)
      expect(status).to.equal('terminated')
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

})

describe('terminate', function() {

  var worker = new Worker(), timer

  function done() {
  }

  it('should terminate a running worker', function(done) {
    this.timeout(80000)
    timer = setTimeout(done, 79000)
    worker.create(
    {
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
      clearTimeout(timer)
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should fail to terminate an already terminated worker', function(done) {
    this.timeout(80000)
    timer = setTimeout(done, 79000)
    worker.create(
    {
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
    .catch(error => {
      clearTimeout(timer)
      expect(error.statusCode).to.equal(403)
      expect(error.message).to.contain('{"message":"Validation Failed","errors":[{"field":"id","code":"invalid"}]}')
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

})
