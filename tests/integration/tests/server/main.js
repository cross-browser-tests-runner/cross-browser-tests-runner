global.Promise = global.Promise || require('bluebird')

var
  settings = require('./../../../../bin/server/settings')(),
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  chaiAsPromised = require('chai-as-promised'),
  utils = require('./../utils')

chai.use(chaiAsPromised)
chai.use(chaiHttp)

var
  expect = chai.expect,
  should = chai.should(),
  request = chai.request,
  host = 'http://' + settings.server.host + ':' + settings.server.port

describe('main', function() {

  this.timeout(0)

  it('should fail with 400 status code for bad JSON in request', function() {
    return request(host)
      .post('/')
      .set('Content-Type', 'application/json')
      .send('{ "abc" : ')
      .catch(err => {
        expect(err.status).to.equal(400)
        return true
      })
      .catch(err => {
        utils.log.error('error: ', err)
        throw err
      })
      .should.be.fulfilled
  })

  it('should fail with 404 status code for an unknown url', function() {
    return request(host)
      .get('/some-url')
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
