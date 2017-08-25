describe('Tunnel Dependencies', function() {
  require('./browserstack/tunnel-deps')
})

describe('Manager', function() {
  require('./browserstack/manager')
})

describe('Tunnel', function() {
  require('./browserstack/tunnel')
})

describe('Worker', function() {
  require('./browserstack/worker')
})

if(process.version > 'v6') {
  describe('WebDriver', function() {
    require('./browserstack/webdriver')
  })
}

describe('Platform', function() {
  require('./browserstack/platform')
})
