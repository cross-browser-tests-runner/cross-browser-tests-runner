var
  path = require('path'),
  Bluebird = require('bluebird'),
  fs = Bluebird.promisifyAll(require('fs')),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Process = require('./../../../../../../lib/core/process').Process,
  utils = require('./../../../testutils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('crossbrowsertesting.js', function() {

  this.timeout(0)

  it('should update crossbrowsertesting-conf.json', function() {
    var proc = new Process(),
      configFile = path.resolve(process.cwd(), 'conf/crossbrowsertesting-conf.json'),
      lastMtime, currMtime
    return fs.statAsync(configFile)
    .then(stats => {
      lastMtime = stats.mtime.getTime()
      return proc.create('node',
        utils.nodeProcCoverageArgs('bin/utils/conf/browsers/crossbrowsertesting.js'), {
        onstdout: function(stdout) {
          utils.log.debug(stdout)
        },
        onstderr: function(stderr) {
          utils.errorWithoutCovLines(stderr)
        }
      })
    })
    .then(() => {
      return fs.statAsync(configFile)
    })
    .then(stats => {
      currMtime = stats.mtime.getTime()
      expect(currMtime).to.be.at.least(lastMtime)
      return true
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })
})
