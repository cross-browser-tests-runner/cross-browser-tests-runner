global.Promise = global.Promise || require('bluebird')

var
  fs = require('fs'),
  Env = require('./../../../../../../lib/core/env').Env,
  settings = require('./../../../../../../bin/server/settings')(),
  BinaryVars = require('./../../../../../../lib/platforms/browserstack/tunnel/binary').BinaryVars,
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

describe('BrowserStack', function() {

  describe('/browserstack', function() {

    describe('GET', function() {

      this.timeout(0)

      it('should fail with 404 status code', function() {
        return request(host)
        .get('/runs/testem/browserstack')
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
        .delete('/runs/testem/browserstack')
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
        .put('/runs/testem/browserstack')
        .catch(err => {
          utils.log.error('error: ', err)
          throw err
        })
        .should.be.fulfilled
      })

      it('should fail with 400 status code for invalid input parameters', function() {
        return request(host)
        .put('/runs/testem/browserstack')
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
        .put('/runs/testem/browserstack')
        .send({capabilities:[{local: true}]})
        .then(res => {
          expect(res.body).to.not.be.undefined
          expect(res.statusCode).to.equal(200)
          return request(host)
            .delete('/runs/testem/browserstack')
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

      if(!Env.isWindows) {
        it('should fail with 500 status code for internal errors (simulated with removing execute permissions from tunnel binary)', function() {
          fs.chmodSync(BinaryVars.path, '0400')
          return request(host)
          .put('/runs/testem/browserstack')
          .send({capabilities:[{local:true}]})
          .catch(err => {
            fs.chmodSync(BinaryVars.path, '0755')
            expect(err.status).to.equal(500)
            expect(err.response.body).to.not.be.undefined
            expect(err.response.body).to.have.keys('error')
            expect(err.response.body.error).to.contain('spawn EACCES')
            return true
          })
          .catch(err => {
            utils.log.error('error: ', err)
            throw err
          })
          .should.be.fulfilled
        })
      }

      /*it('should succeed with 200 status code with multiple local identifiers capabilities', function() {
        return request(host)
        .put('/runs/testem/browserstack')
        .send({capabilities:[{
          local: true,
          localIdentifier: "my-id-1"
        }, {
          local: true,
          localIdentifier: "my-id-2"
        }]})
        .then(res => {
          expect(res.body).to.not.be.undefined
          expect(res.statusCode).to.equal(200)
          return request(host)
            .delete('/runs/testem/browserstack')
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
      })*/

    })

    if(!Env.isWindows) {

      describe('DELETE', function() {

        this.timeout(0)

        it('should fail with 500 status code for internal errors (simulated with removing execute permissions from tunnel binary)', function() {
          return request(host)
          .put('/runs/testem/browserstack')
          .send({capabilities:[{local: true}]})
          .then(res => {
            expect(res.body).to.not.be.undefined
            expect(res.statusCode).to.equal(200)
            fs.chmodSync(BinaryVars.path, '0400')
            return request(host)
              .delete('/runs/testem/browserstack')
          })
          .catch(err => {
            fs.chmodSync(BinaryVars.path, '0755')
            expect(err.status).to.equal(500)
            expect(err.response.body).to.not.be.undefined
            expect(err.response.body).to.have.keys('error')
            expect(err.response.body.error).to.contain('spawn EACCES')
            return request(host)
              .delete('/runs/testem/browserstack')
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
    }

    describe('POST', function() {

      this.timeout(0)

      it('should fail with 400 status code without any input parameters', function() {
        return request(host)
        .post('/runs/testem/browserstack')
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
        .post('/runs/testem/browserstack')
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
        .post('/runs/testem/browserstack')
        .send({"browser":{"os":"Windows","osVersion":"10","browser":"Firefox","browserVersion":"43.0"},"capabilities":{"build":build.build,"test":build.test,"project":build.project},"url":"http://piaxis.tech"})
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

  describe('/browserstack/:run', function() {

    describe('GET', function() {

      this.timeout(0)

      it('should fail with 404 status code', function() {
        return request(host)
        .get('/runs/testem/browserstack/some-id')
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
        .post('/runs/testem/browserstack/some-id')
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
        .delete('/runs/testem/browserstack/some-id')
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
        .post('/runs/testem/browserstack')
        .send({"browser":{"os":"Windows","osVersion":"10","browser":"Chrome","browserVersion":"43.0"},"capabilities":{"build":build.build,"test":build.test,"project":build.project},"url":"http://piaxis.tech"})
        .then(res => {
          expect(res.body).to.not.be.undefined
          expect(res.body).to.have.keys('id')
          expect(res.statusCode).to.equal(200)
          return request(host)
            .delete('/runs/testem/browserstack/' + res.body.id)
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
