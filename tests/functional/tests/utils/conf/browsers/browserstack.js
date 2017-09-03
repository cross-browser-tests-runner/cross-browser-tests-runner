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

  if(!Env.isWindows) {
    it('should update browserstack-conf.json and also update cbtr-conf.json in case there are new OS versions found (simulated by using a depleted version of current cbtr-conf.json)', function() {
      var proc = new Process(),
        configFile = path.resolve(process.cwd(), 'conf/browserstack-conf.json'),
        mainConfigFile = path.resolve(process.cwd(), 'conf/cbtr-conf.json'),
        depleteConfigFile = path.resolve(process.cwd(), 'tests/functional/utils/depleted-cbtr-conf.json'),
        lastMtime, currMtime
      return utils.copyFileAsync(depleteConfigFile, mainConfigFile)
      .then(() => {
        return fs.statAsync(configFile)
      })
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
  }

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
