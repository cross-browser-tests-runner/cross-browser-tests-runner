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
  host = 'http://' + settings.host + ':' + settings.port

describe('main', function() {

  this.timeout(0)

  it('should return 400 for bad JSON in request', function() {
    return request(host)
      .post('/')
      .set('Content-Type', 'application/json')
      .send('{ "abc" : ')
      .catch(err => {
        expect(err.status).to.equal(400)
        return true
      })
      .catch(err => {
        utils.log.error(err)
        throw err
      })
      .should.be.fulfilled
  })

  it('should return 404 for unsupported url', function() {
    return request(host)
      .get('/some-url')
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
