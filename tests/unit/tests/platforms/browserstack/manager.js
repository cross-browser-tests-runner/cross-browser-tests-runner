var
  expect = require('chai').expect,
  manager = require('./../../../../../lib/platforms/browserstack/manager'),
  Manager = manager.Manager,
  ManagerVars = manager.ManagerVars,
  BinaryVars = require('./../../../../../lib/platforms/browserstack/tunnel/binary').BinaryVars,
  Process = require('./../../../../../lib/platforms/browserstack/tunnel/process').Process,
  utils = require('./utils')

describe('running', function() {

  var timer, proc

  function done() { }

  it('should return empty list if no tunnel processes', function(done) {
    this.timeout(10000)
    timer = setTimeout(done, 9000)
    Manager.running()
    .then(procs => {
      clearTimeout(timer)
      expect(procs).to.have.lengthOf(0)
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should return a non empty list if there are tunnel processes', function(done) {
    this.timeout(40000)
    timer = setTimeout(done, 39000)
    proc = new Process()
    proc.create(BinaryVars.path, [ ])
    .then(() => {
      return Manager.running()
    })
    .then(procs => {
      expect(procs).to.have.lengthOf(1)
      return procs[0].stop()
    })
    .then(() => {
      return utils.awaitZeroTunnels()
    })
    .then(num => {
      clearTimeout(timer)
      expect(num).to.equal(0)
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

})

describe('withoutId', function() {

  var timer

  function done() { }

  it('should return empty list if no tunnel processes', function(done) {
    this.timeout(10000)
    timer = setTimeout(done, 9000)
    Manager.withoutId()
    .then(procs => {
      clearTimeout(timer)
      expect(procs).to.have.lengthOf(0)
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should return tunnel processes without id if running', function(done) {
    this.timeout(40000)
    timer = setTimeout(done, 39000)
    proc = new Process()
    proc.create(BinaryVars.path, [ ])
    .then(() => {
      return Manager.withoutId()
    })
    .then(procs => {
      expect(procs).to.have.lengthOf(1)
      return procs[0].stop()
    })
    .then(() => {
      return utils.awaitZeroTunnels()
    })
    .then(num => {
      clearTimeout(timer)
      expect(num).to.equal(0)
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

})

describe('withId', function() {

  var timer

  function done() { }

  it('should return empty list if no tunnel processes', function(done) {
    this.timeout(10000)
    timer = setTimeout(done, 9000)
    Manager.withId()
    .then(procs => {
      clearTimeout(timer)
      expect(procs).to.have.lengthOf(0)
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should return tunnel processes with id if running', function(done) {
    this.timeout(40000)
    timer = setTimeout(done, 39000)
    proc = new Process()
    var proc2 = new Process()
    var procs
    proc.create(BinaryVars.path, [ '--local-identifier', 'my-test-id' ])
    .then(() => {
      return proc2.create(BinaryVars.path, [ '--local-identifier', 'my-test-id-2' ])
    })
    .then(() => {
      return Manager.withId()
    })
    .then(ret => {
      procs = ret
      expect(procs).to.have.lengthOf(2)
      return procs[0].stop()
    })
    .then(() => {
      return procs[1].stop()
    })
    .then(() => {
      return utils.awaitZeroTunnels()
    })
    .then(num => {
      clearTimeout(timer)
      expect(num).to.equal(0)
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

})
