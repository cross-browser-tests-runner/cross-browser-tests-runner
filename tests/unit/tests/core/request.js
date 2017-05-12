var
  fs = require('fs'),
  path = require('path'),
  expect = require('chai').expect,
  nock = require('nock'),
  Request = require('./../../../../lib/core/request').Request

describe('request', function() {

  var req = new Request()

  var timer

  function done() {
  }

  it('should register an error when connect fails', function(done) {
    nock('https://www.piaxis.tech')
      .get('/api/v1/runs/')
      .replyWithError('simulated request error')
    this.timeout(10000)
    timer = setTimeout(done, 9000)
    req.request('https://www.piaxis.tech/api/v1/runs/', 'GET', { })
    .catch(err => {
      clearTimeout(timer)
      nock.cleanAll()
      expect(err).to.be.defined
      expect(err.message).to.be.defined
      expect(err.message).to.contain('simulated request error')
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should register an error in case of timeout', function(done) {
    nock('http://opensource.piaxis.tech')
      .get('/builds')
      .socketDelay(40000)
      .reply(200, '<html></html>')
    this.timeout(50000)
    timer = setTimeout(done, 49000)
    req.request('http://opensource.piaxis.tech/builds', 'GET', { timeout: 2000 })
    .catch(err => {
      clearTimeout(timer)
      nock.cleanAll()
      expect(err).to.be.defined
      expect(err.message).to.be.defined
      expect(err.message).to.equal('Error: ESOCKETTIMEDOUT')
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should register an error when authorization fails', function(done) {
    this.timeout(10000)
    timer = setTimeout(done, 9000)
    req.request(
      'http://www.httpwatch.com/httpgallery/authentication/authenticatedimage/default.aspx',
      'GET',
      { }
    )
    .catch(err => {
      clearTimeout(timer)
      expect(err).to.be.defined
      expect(err.statusCode).to.be.defined
      expect(err.statusCode).to.equal(401)
      expect(err.response.statusMessage).to.be.defined
      expect(err.response.statusMessage).to.equal('Access Denied')
      expect(err.error).to.be.defined
      expect(err.error).to.contain('You do not have permission to view this directory or page.')
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should use basic authentication when provided', function(done) {
    this.timeout(10000)
    timer = setTimeout(done, 9000)
    req.request(
      'http://www.httpwatch.com/httpgallery/authentication/authenticatedimage/default.aspx',
      'GET',
      { auth: { user : 'abc', pass: '123' } }
    )
    .catch(err => {
      clearTimeout(timer)
      expect(err).to.be.defined
      expect(err.statusCode).to.be.defined
      expect(err.statusCode).to.equal(401)
      expect(err.response.statusMessage).to.be.defined
      expect(err.response.statusMessage).to.equal('Access Denied')
      expect(err.error).to.be.defined
      expect(err.error).to.contain('You do not have permission to view this directory or page.')
      expect(err.response.request.headers.authorization).to.be.defined
      expect(err.response.request.headers.authorization).to.contain('Basic ')
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should call onsuccess handler once the response is completely received', function(done) {
    this.timeout(10000)
    var timer = setTimeout(done, 9000)
    req.request('http://www.piaxis.tech/', 'GET', { resolveWithFullResponse : true })
    .then(response => {
      clearTimeout(timer)
      expect(response).to.be.defined
      expect(response.statusCode).to.be.defined
      expect(response.statusCode).to.equal(200)
      expect(response.statusMessage).to.be.defined
      expect(response.statusMessage).to.equal('OK')
      expect(response.body).to.be.defined
      expect(response.body).to.not.be.empty
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should be able to make a post call and receive response', function(done) {
    this.timeout(10000)
    var timer = setTimeout(done, 9000)
    req.request(
      'https://www.piaxis.tech/api/v1/runs/',
      'POST',
      {
        body: { },
        rejectUnauthorized: false,
        json: true,
        auth: {
          user: 'browserstack-' + process.env.BROWSERSTACK_USERNAME,
          pass: process.env.BROWSERSTACK_ACCESS_KEY
        }
      }
    )
    .catch(err => {
      clearTimeout(timer)
      expect(err).to.be.defined
      expect(err.statusCode).to.be.defined
      expect(err.statusCode).to.equal(400)
      expect(err.response.statusMessage).to.be.defined
      expect(err.response.statusMessage).to.equal('Bad Request')
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

})
