describe('Travis', function() {
  require('./environments/travis')
})

describe('Circle', function() {
  require('./environments/circle')
})

describe('Appveyor', function() {
  require('./environments/appveyor')
})
