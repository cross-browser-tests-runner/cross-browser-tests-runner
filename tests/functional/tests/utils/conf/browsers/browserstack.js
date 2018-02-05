var
  path = require('path'),
  Bluebird = require('bluebird'),
  fs = Bluebird.promisifyAll(require('fs')),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Env = require('./../../../../../../lib/core/env').Env,
  Process = require('./../../../../../../lib/core/process').Process,
  utils = require('./../../../testutils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('browserstack.js', function() {

  this.timeout(0)

  it('should update browserstack-conf.json', function() {
    var proc = new Process(),
      configFile = path.resolve(process.cwd(), 'conf/browserstack-conf.json'),
      lastMtime, currMtime
    return fs.statAsync(configFile)
    .then(stats => {
      lastMtime = stats.mtime.getTime()
      return proc.create('node',
        utils.nodeProcCoverageArgs('bin/utils/conf/browsers/browserstack.js'), {
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
