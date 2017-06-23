describe('Native Runner', function() {
  describe('Static Serving', function() {
    require('./native/static')
  })
  describe('Instrumented Javascript', function() {
    require('./native/instrument')
  })
  describe('/cbtr', function() {
    require('./native/cbtr')
  })
})
