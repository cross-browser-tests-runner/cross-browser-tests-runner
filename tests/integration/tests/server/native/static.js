global.Promise = global.Promise || require('bluebird')

var
  path = require('path'),
  settings = require('./../../../../../bin/server/settings')(path.resolve(process.cwd(), 'tests/integration/conf/native/cbtr.json')),
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
  host = 'http://' + settings.server.host + ':' + settings.server.port

describe('POST', function() {

  this.timeout(0)

  it('should fail with 404 status code for POST method even for an existing static page', function() {
    return request(host)
      .post('/samples/native/tests/html/jasmine/tests.html')
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

describe('GET', function() {

  this.timeout(0)

  it('should return a static file matching a valid url', function() {
    return request(host)
      .get('/samples/native/tests/html/jasmine/tests.html')
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
