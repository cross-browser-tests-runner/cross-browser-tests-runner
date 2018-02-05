var
  path = require('path'),
  Bluebird = require('bluebird'),
  fs = Bluebird.promisifyAll(require('fs')),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Process = require('./../../../../../lib/core/process').Process,
  utils = require('./../../testutils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('BrowserStack', function() {

  this.timeout(0)

  it('should successfully create cbtr.json and testem.json for BrowserStack platform', function() {
    var proc = new Process(), out = ''
    return proc.create('node',
      utils.nodeProcCoverageArgs('bin/utils/quick-start.js', [
        '--platform', 'browserstack', '--runner', 'testem'
      ]), {
      onstdout: function(stdout) {
        out += stdout
      },
      onstderr: function(stderr) {
        utils.errorWithoutCovLines(stderr)
      }
    })
    .then(() => {
      expect(out).to.contain('Updating browsers for platform: browserstack')
      expect(out).to.contain('Creating global cross-browser-tests-runner settings from sample browsers for browserstack')
      expect(out).to.contain('Creating testem config for browserstack platform using cross-browser-tests-runner settings')
      expect(out).to.contain('Done! Start the server (./node_modules/.bin/cbtr-server) and then execute your testem tests after specifying the test files and other required details in the runner config')
      return true
    })
    .then(() => {
      return Bluebird.all([
        fs.unlinkAsync(path.resolve(process.cwd(), 'testem.json')),
        fs.unlinkAsync(path.resolve(process.cwd(), 'cbtr.json'))
      ])
    })
    .catch(err => {
      utils.log.error('error: ', err)
      throw err
    })
    .should.be.fulfilled
  })

})
