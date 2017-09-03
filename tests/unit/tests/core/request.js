'use strict';

var
  fs = require('fs'),
  path = require('path'),
  nock = require('nock'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Request = require('./../../../../lib/core/request').Request,
  utils = require('./utils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('Request', function() {

  describe('request', function() {

    var req = new Request()
    this.timeout(0)

    it('should throw an error when HTTP request fails to connect to server', function() {
      nock('https://www.piaxis.tech')
        .get('/api/v1/runs/')
        .replyWithError('simulated request error')
      return req.request('https://www.piaxis.tech/api/v1/runs/', 'GET')
      .catch(err => {
        nock.cleanAll()
        expect(err).to.not.be.undefined
        expect(err.message).to.not.be.undefined
        expect(err.message).to.contain('simulated request error')
      })
      .should.be.fulfilled
    })

    it('should throw an error in case of HTTP request timeout', function() {
      nock('http://opensource.piaxis.tech')
        .get('/builds')
        .socketDelay(40000)
        .reply(200, '<html></html>')
      return req.request('http://opensource.piaxis.tech/builds', 'GET', { timeout: 2000 })
      .catch(err => {
        nock.cleanAll()
        expect(err).to.not.be.undefined
        expect(err.message).to.not.be.undefined
        expect(err.message).to.equal('Error: ESOCKETTIMEDOUT')
      })
      .should.be.fulfilled
    })

    it('should throw an error in case of authorization failures', function() {
      return req.request(
        'http://www.httpwatch.com/httpgallery/authentication/authenticatedimage/default.aspx',
        'GET'
      )
      .catch(err => {
        expect(err).to.not.be.undefined
        expect(err.statusCode).to.not.be.undefined
        expect(err.statusCode).to.equal(401)
        expect(err.response.statusMessage).to.not.be.undefined
        expect(err.response.statusMessage).to.equal('Access Denied')
        expect(err.error).to.not.be.undefined
        expect(err.error).to.contain('You do not have permission to view this directory or page.')
      })
      .should.be.fulfilled
    })

    it('should use Basic Authentication successfully when credentials are provided', function() {
      return req.request(
        'http://www.httpwatch.com/httpgallery/authentication/authenticatedimage/default.aspx',
        'GET',
        { auth: { user : 'abc', pass: '123' } }
      )
      .catch(err => {
        expect(err).to.not.be.undefined
        expect(err.statusCode).to.not.be.undefined
        expect(err.statusCode).to.equal(401)
        expect(err.response.statusMessage).to.not.be.undefined
        expect(err.response.statusMessage).to.equal('Access Denied')
        expect(err.error).to.not.be.undefined
        expect(err.error).to.contain('You do not have permission to view this directory or page.')
        expect(err.response.request.headers.authorization).to.not.be.undefined
        expect(err.response.request.headers.authorization).to.contain('Basic ')
      })
      .should.be.fulfilled
    })

    it('should call "onsuccess" handler once the response is received completely', function() {
      return req.request('http://www.piaxis.tech/', 'GET', { resolveWithFullResponse : true })
      .then(response => {
        expect(response).to.not.be.undefined
        expect(response.statusCode).to.not.be.undefined
        expect(response.statusCode).to.equal(200)
        expect(response.statusMessage).to.not.be.undefined
        expect(response.statusMessage).to.equal('OK')
        expect(response.body).to.not.be.undefined
        expect(response.body).to.not.be.empty
      })
      .should.be.fulfilled
    })

    it('should be able to make a "POST" method request and receive the response', function() {
      return req.request(
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
        expect(err).to.not.be.undefined
        expect(err.statusCode).to.not.be.undefined
        expect(err.statusCode).to.equal(400)
        expect(err.response.statusMessage).to.not.be.undefined
        expect(err.response.statusMessage).to.equal('Bad Request')
      })
      .should.be.fulfilled
    })

  })

})
