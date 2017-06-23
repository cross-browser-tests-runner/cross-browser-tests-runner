describe('Functional Tests', function() {
  require('./tests/utils')
  if(!process.version.match(/^v5/) || !process.platform.match(/darwin/)) {
    require('./tests/testem')
  }
  require('./tests/native')
})
