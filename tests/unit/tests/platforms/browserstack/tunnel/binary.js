var
  fs = require('fs'),
  nock = require('nock'),
  expect = require('chai').expect,
  binary = require('./../../../../../../lib/platforms/browserstack/tunnel/binary'),
  Binary = binary.Binary,
  BinaryVars = binary.BinaryVars

describe('exists', function() {

  var binary = new Binary()

  it('should return a boolean response', function() {
    expect(binary.exists()).to.be.a('boolean')
  })
})

describe('remove', function() {

  it('should remove the local binary', function(done) {
    this.timeout(10000)
    var timer = setTimeout(done, 9000)
    var binary = new Binary()
    binary.remove()
    .then(function() {
      return fs.statAsync(BinaryVars.path)
    })
    .catch(err => {
      clearTimeout(timer)
      expect(err).to.be.defined
      expect(err.code).to.be.defined
      expect(err.code).to.equal('ENOENT')
      expect(err.syscall).to.be.defined
      expect(err.syscall).to.be.oneOf(['stat', 'unlink'])
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })
})

describe('fetch', function() {

  var binary = null

  function done() {
  }

  it('should do retries and fail in case of request failing', function(done) {
    this.timeout(50000)
    var timer = setTimeout(function(){
      console.error('ERROR: did not expect timer in "request fail" case to execute')
      done()
    }, 45000)
    var url = BinaryVars.url.replace(/^.*amazonaws\.com/, '')
    nock('https://s3.amazonaws.com').get(url).times(5).replyWithError('simulating request failure')
    binary = new Binary()
    binary.fetch()
    .catch(err => {
      clearTimeout(timer)
      expect(err.message).to.contain('aborting download as max retries of downloading have failed')
      expect(fs.existsSync(BinaryVars.path)).to.be.false
      nock.cleanAll()
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should be able to download the binary', function(done) {
    this.timeout(1010000)
    timer = setTimeout(function(){done()}, 1005000)
    binary = new Binary()
    binary.fetch()
    .then(function() {
      clearTimeout(timer)
      expect(fs.existsSync(BinaryVars.path)).to.be.true
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  var statBefore = null

  it('should not attempt downloading if the binary exists', function(done) {
    this.timeout(50000)
    var timer = setTimeout(function(){done()}, 45000)
    statBefore = fs.statSync(BinaryVars.path)
    binary = new Binary()
    binary.fetch()
    .then(function() {
      clearTimeout(timer)
      var statAfter = fs.statSync(BinaryVars.path)
      expect(statBefore).to.not.be.null
      expect(statBefore.ctime).to.deep.equal(statAfter.ctime)
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

})
