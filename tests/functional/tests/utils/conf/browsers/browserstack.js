var
  path = require('path'),
  Bluebird = require('bluebird'),
  fs = Bluebird.promisifyAll(require('fs')),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Process = require('./../../../../../../lib/core/process').Process

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('browserstack.js', function() {

  this.timeout(0)

  it('should update the browserstack browsers config', function() {
    var proc = new Process(),
      configFile = path.resolve(process.cwd(), 'conf/browserstack-conf.json'),
      lastMtime, currMtime
    return fs.statAsync(configFile)
    .then(stats => {
      console.log(stats)
      lastMtime = stats.mtime.getTime()
      return proc.create('node', [
        path.resolve(process.cwd(), 'bin/utils/conf/browsers/browserstack.js')
        ], {
        onstdout: function(stdout) {
          console.log(stdout)
        },
        onstderr: function(stderr) {
          console.log(stderr)
        }
      })
    })
    .then(() => {
      return fs.statAsync(configFile)
    })
    .then(stats => {
      console.log(stats)
      currMtime = stats.mtime.getTime()
      expect(currMtime).to.be.above(lastMtime)
    })
    .catch(err => {
      console.error(err)
      throw err
    })
    .should.be.fulfilled
  })
})
