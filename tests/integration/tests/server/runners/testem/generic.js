global.Promise = global.Promise || require('bluebird')

var
  settings = require('./../../../../../../bin/server/settings')(),
  utils = require('./../../../utils'),
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
chai.use(chaiHttp)

var
  expect = chai.expect,
  should = chai.should(),
  request = chai.request,
  host = 'http://' + settings.server.host + ':' + settings.server.port

describe('generic', function() {

  describe('/', function() {

    describe('GET', function() {

      this.timeout(0)

      it('should fail with 404 status code', function() {
        return request(host)
        .get('/runs/testem')
        .catch(err => {
          expect(err.status).to.equal(404)
          return true
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })
    })

  })

  describe('/:platform', function() {

    describe('PUT', function() {

      this.timeout(0)

      it('should fail with 400 status code for an unsupported platform', function() {
        return request(host)
        .put('/runs/testem/abc')
        .catch(err => {
          expect(err.status).to.equal(400)
          expect(err.response.body).to.not.be.undefined
          expect(err.response.body).to.have.keys('error')
          expect(err.response.body.error).to.contain('unsupported platform abc')
          return true
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

    })

    describe('POST', function() {

      this.timeout(0)

      it('should fail with 400 status code for an unsupported platform', function() {
        return request(host)
        .post('/runs/testem/abc')
        .catch(err => {
          expect(err.status).to.equal(400)
          expect(err.response.body).to.not.be.undefined
          expect(err.response.body).to.have.keys('error')
          expect(err.response.body.error).to.contain('unsupported platform abc')
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

    })

  })

  describe('/:platform/:run', function() {

    describe('DELETE', function() {

      this.timeout(0)

      it('should fail with 400 status code for an unsupported platform', function() {
        return request(host)
        .delete('/runs/testem/abc/some-id')
        .catch(err => {
          expect(err.status).to.equal(400)
          expect(err.response.body).to.not.be.undefined
          expect(err.response.body).to.have.keys('error')
          expect(err.response.body.error).to.contain('unsupported platform abc')
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

    })

  })

})
