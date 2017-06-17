global.Promise = global.Promise || require('bluebird')

var
  settings = require('./../../../../../bin/server/settings')(),
  bsUtils = require('./../../../../unit/tests/platforms/browserstack/utils'),
  utils = require('./../../utils'),
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
chai.use(chaiHttp)

var
  expect = chai.expect,
  should = chai.should(),
  request = chai.request,
  host = 'http://' + settings.host + ':' + settings.port

describe('GET /', function() {

  this.timeout(0)

  it('should return 404 for GET', function() {
    return request(host)
      .get('/runs/testem')
      .catch(err => {
        expect(err.status).to.equal(404)
        return true
      })
      .catch(err => {
        utils.log.error(err)
        throw err
      })
      .should.be.fulfilled
  })
})

describe('GET /:platform', function() {

  this.timeout(0)

  it('should fail with 404', function() {
    return request(host)
      .get('/runs/testem/browserstack')
      .catch(err => {
        expect(err.status).to.equal(404)
        return true
      })
      .catch(err => {
        utils.log.error(err)
        throw err
      })
      .should.be.fulfilled
  })
})

describe('PUT /:platform', function() {

  this.timeout(0)

  it('should fail with 400 for an unsupported platform', function() {
    return request(host)
      .put('/runs/testem/abc')
      .catch(err => {
        expect(err.status).to.equal(400)
        expect(err.response.body).to.be.defined
        expect(err.response.body).to.have.keys('error')
        expect(err.response.body.error).to.contain('unsupported platform abc')
        return true
      })
      .catch(err => {
        utils.log.error(err)
        throw err
      })
      .should.be.fulfilled
  })

  it('should silently complete without any parameters', function() {
    return request(host)
      .put('/runs/testem/browserstack')
      .catch(err => {
        utils.log.error(err)
        throw err
      })
      .should.be.fulfilled
  })

  it('should fail with 400 with bad parameters', function() {
    return request(host)
      .put('/runs/testem/browserstack')
      .send({capabilities:[{os:"Windows"}]})
      .catch(err => {
        expect(err.status).to.equal(400)
        expect(err.response.body).to.be.defined
        expect(err.response.body).to.have.keys('error')
        expect(err.response.body.error).to.contain('option os is not allowed')
        return true
      })
      .catch(err => {
        utils.log.error(err)
        throw err
      })
      .should.be.fulfilled
  })

  it('should succeed with 200 with valid parameters', function() {
    return request(host)
      .put('/runs/testem/browserstack')
      .send({capabilities:[{local: true}]})
      .then(res => {
        expect(res.body).to.be.defined
        expect(res.statusCode).to.equal(200)
      })
      .catch(err => {
        utils.log.error(err)
        throw err
      })
      .should.be.fulfilled
  })

  it('should succeed with 200 with multiple capabilities', function() {
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
        expect(res.body).to.be.defined
        expect(res.statusCode).to.equal(200)
        return bsUtils.ensureZeroTunnels()
      })
      .catch(err => {
        utils.log.error(err)
        throw err
      })
      .should.be.fulfilled
  })
})

describe('POST /:platform', function() {

  this.timeout(0)

  it('should fail with 400 for an unsupported platform', function() {
    return request(host)
      .post('/runs/testem/abc')
      .catch(err => {
        expect(err.status).to.equal(400)
        expect(err.response.body).to.be.defined
        expect(err.response.body).to.have.keys('error')
        expect(err.response.body.error).to.contain('unsupported platform abc')
      })
      .catch(err => {
        utils.log.error(err)
        throw err
      })
      .should.be.fulfilled
  })

  it('should fail with 400 without any parameters', function() {
    return request(host)
      .post('/runs/testem/browserstack')
      .catch(err => {
        expect(err.status).to.equal(400)
        expect(err.response.body).to.be.defined
        expect(err.response.body).to.have.keys('error')
        expect(err.response.body.error).to.contain('required option os missing')
      })
      .catch(err => {
        utils.log.error(err)
        throw err
      })
      .should.be.fulfilled
  })

  it('should fail with 400 with bad parameters', function() {
    return request(host)
      .post('/runs/testem/browserstack')
      .send({"browser":{"os":"Windows","osVersion":"None","browser":"firefox","browserVersion":"43.0"},"url":"http://piaxis.tech"})
      .catch(err => {
        expect(err.status).to.equal(400)
        expect(err.response.body).to.be.defined
        expect(err.response.body).to.have.keys('error')
        expect(err.response.body.error).to.contain('"errors":[{"field":"os_version","code":"invalid"}]')
      })
      .catch(err => {
        utils.log.error(err)
        throw err
      })
      .should.be.fulfilled
  })

  it('should succeed with 200 with valid parameters', function() {
    return request(host)
      .post('/runs/testem/browserstack')
      .send({"browser":{"os":"Windows","osVersion":"10","browser":"firefox","browserVersion":"43.0"},"url":"http://piaxis.tech"})
      .then(res => {
        expect(res.body).to.be.defined
        expect(res.body).to.have.keys('id')
        expect(res.statusCode).to.equal(200)
      })
      .catch(err => {
        utils.log.error(err)
        throw err
      })
      .should.be.fulfilled
  })
})

describe('DELETE /:platform', function() {

  this.timeout(0)

  it('should succeed with 200', function() {
    return request(host)
      .delete('/runs/testem/browserstack')
      .send({ screenshot: true })
      .then(res => {
        expect(res.statusCode).to.equal(200)
      })
      .catch(err => {
        utils.log.error(err)
        throw err
      })
      .should.be.fulfilled
  })
})

describe('GET /:platform/:run', function() {

  this.timeout(0)

  it('should fail with 404', function() {
    return request(host)
      .get('/runs/testem/browserstack/some-id')
      .catch(err => {
        expect(err.status).to.equal(404)
      })
      .catch(err => {
        utils.log.error(err)
        throw err
      })
      .should.be.fulfilled
  })
})

describe('POST /:platform/:run', function() {

  this.timeout(0)

  it('should fail with 404', function() {
    return request(host)
      .post('/runs/testem/browserstack/some-id')
      .catch(err => {
        expect(err.status).to.equal(404)
      })
      .catch(err => {
        utils.log.error(err)
        throw err
      })
      .should.be.fulfilled
  })
})

describe('DELETE /:platform/:run', function() {

  this.timeout(0)

  it('should fail with 400 for an unsupported platform', function() {
    return request(host)
      .delete('/runs/testem/abc/some-id')
      .catch(err => {
        expect(err.status).to.equal(400)
        expect(err.response.body).to.be.defined
        expect(err.response.body).to.have.keys('error')
        expect(err.response.body.error).to.contain('unsupported platform abc')
      })
      .catch(err => {
        utils.log.error(err)
        throw err
      })
      .should.be.fulfilled
  })

  it('should fail with 400 for an invalid run', function() {
    return request(host)
      .delete('/runs/testem/browserstack/some-id')
      .catch(err => {
        expect(err.status).to.equal(400)
        expect(err.response.body).to.be.defined
        expect(err.response.body).to.have.keys('error')
        expect(err.response.body.error).to.contain('stop: no such run some-id found')
      })
      .catch(err => {
        utils.log.error(err)
        throw err
      })
      .should.be.fulfilled
  })

  it('should succeed with 200 for a valid run', function() {
    return request(host)
      .post('/runs/testem/browserstack')
      .send({"browser":{"os":"Windows","osVersion":"10","browser":"firefox","browserVersion":"43.0"},"url":"http://piaxis.tech"})
      .then(res => {
        expect(res.body).to.be.defined
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
        utils.log.error(err)
        throw err
      })
      .should.be.fulfilled
  })
})
