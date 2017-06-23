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

  it('should return 404 for POST on existing page', function() {
    return request(host)
      .post('/samples/native/tests/html/jasmine/tests.html')
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

describe('GET', function() {

  this.timeout(0)

  it('should get a valid static file', function() {
    return request(host)
      .get('/samples/native/tests/html/jasmine/tests.html')
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
