global.Promise = global.Promise || require('bluebird')

var
  fs = require('fs'),
  Env = require('./../../../../../../lib/core/env').Env,
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

describe('CrossBrowserTesting', function() {

  describe('/crossbrowsertesting', function() {

    describe('GET', function() {

      this.timeout(0)

      it('should fail with 404 status code', function() {
        return request(host)
        .get('/runs/testem/crossbrowsertesting')
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

    describe('DELETE', function() {

      this.timeout(0)

      it('should succeed with 200 status code', function() {
        return request(host)
        .delete('/runs/testem/crossbrowsertesting')
        .send({ screenshot: true })
        .then(res => {
          expect(res.statusCode).to.equal(200)
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })
    })

    describe('PUT', function() {

      this.timeout(0)

      it('should silently complete even without any input parameters', function() {
        return request(host)
        .put('/runs/testem/crossbrowsertesting')
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should fail with 400 status code for invalid input parameters', function() {
        return request(host)
        .put('/runs/testem/crossbrowsertesting')
        .send({capabilities:[{os:"Windows"}]})
        .catch(err => {
          expect(err.status).to.equal(400)
          expect(err.response.body).to.not.be.undefined
          expect(err.response.body).to.have.keys('error')
          expect(err.response.body.error).to.contain('option os is not allowed')
          return true
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should succeed with 200 status code with valid input parameters', function() {
        return request(host)
        .put('/runs/testem/crossbrowsertesting')
        .send({capabilities:[{local: true}]})
        .then(res => {
          expect(res.body).to.not.be.undefined
          expect(res.statusCode).to.equal(200)
          return request(host)
            .delete('/runs/testem/crossbrowsertesting')
        })
        .then(res => {
          expect(res.statusCode).to.equal(200)
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

      it('should fail with 400 status code without any input parameters', function() {
        return request(host)
        .post('/runs/testem/crossbrowsertesting')
        .catch(err => {
          expect(err.status).to.equal(400)
          expect(err.response.body).to.not.be.undefined
          expect(err.response.body).to.have.keys('error')
          expect(err.response.body.error).to.contain('required option browser missing')
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should fail with 400 status code with invalid input parameters', function() {
        return request(host)
        .post('/runs/testem/crossbrowsertesting')
        .send({"browser":{"os":"Windows","osVersion":"None","browser":"Firefox","browserVersion":"43.0"},"url":"http://piaxis.tech"})
        .catch(err => {
          expect(err.status).to.equal(400)
          expect(err.response.body).to.not.be.undefined
          expect(err.response.body).to.have.keys('error')
          expect(err.response.body.error).to.contain('invalid osVersion "None" for os "Windows"')
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should succeed with 200 status code with valid input parameters', function() {
        var build = utils.buildDetails()
        return request(host)
        .post('/runs/testem/crossbrowsertesting')
        .send({"browser":{"os":"Windows","osVersion":"10","browser":"Firefox","browserVersion":"43.0"},"capabilities":{"build":build.build,"test":build.test,"project":build.project, "timeout": 20},"url":"http://piaxis.tech"})
        .then(res => {
          expect(res.body).to.not.be.undefined
          expect(res.body).to.have.keys('id')
          expect(res.statusCode).to.equal(200)
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

    })

  })

  describe('/crossbrowsertesting/:run', function() {

    describe('GET', function() {

      this.timeout(0)

      it('should fail with 404 status code', function() {
        return request(host)
        .get('/runs/testem/crossbrowsertesting/some-id')
        .catch(err => {
          expect(err.status).to.equal(404)
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

      it('should fail with 404 status code', function() {
        return request(host)
        .post('/runs/testem/crossbrowsertesting/some-id')
        .catch(err => {
          expect(err.status).to.equal(404)
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })
    })

    describe('DELETE', function() {

      this.timeout(0)

      it('should fail with 400 status code for a non-existent run', function() {
        return request(host)
        .delete('/runs/testem/crossbrowsertesting/some-id')
        .catch(err => {
          expect(err.status).to.equal(400)
          expect(err.response.body).to.not.be.undefined
          expect(err.response.body).to.have.keys('error')
          expect(err.response.body.error).to.contain('stop: no such run some-id found')
        })
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should succeed with 200 status code for an existing run', function() {
        var build = utils.buildDetails()
        return request(host)
        .post('/runs/testem/crossbrowsertesting')
        .send({"browser":{"os":"Windows","osVersion":"10","browser":"Chrome","browserVersion":"43.0"},"capabilities":{"build":build.build,"test":build.test,"project":build.project, "timeout": 20},"url":"http://piaxis.tech"})
        .then(res => {
          expect(res.body).to.not.be.undefined
          expect(res.body).to.have.keys('id')
          expect(res.statusCode).to.equal(200)
          return request(host)
            .delete('/runs/testem/crossbrowsertesting/' + res.body.id)
            .send({ screenshot: true })
        })
        .then(res => {
          expect(res.statusCode).to.equal(200)
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
