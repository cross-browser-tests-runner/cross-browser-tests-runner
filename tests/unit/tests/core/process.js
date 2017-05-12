var
  path = require('path'),
  expect = require('chai').expect,
  sleep = require('sleep'),
  ps = require('ps-node'),
  Process = require('./../../../../lib/core/process').Process,
  utils = require('./utils')

describe('create', function() {

  var proc, timer

  function done() {
  }

  it('should throw an error for non-existent exe', function(done) {
    this.timeout(10000)
    timer = setTimeout(done, 9000)
    proc = new Process()
    proc
    .create('abc', [ ])
    .catch(error => {
      clearTimeout(timer)
      expect(error.code).to.be.defined
      expect(error.code).to.equal('ENOENT')
      expect(error.syscall).to.be.defined
      expect(error.syscall).to.equal('spawn abc')
      expect(error.message).to.be.defined
      expect(error.message).to.contain('spawn abc ENOENT')
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should throw an error for no executable permissions', function() {
    proc = new Process()
    var exe = path.resolve(process.cwd(), 'tests', 'unit', 'utils', 'sample.js')
    proc
    .create(exe, [ ])
    .catch(error => {
      clearTimeout(timer)
      expect(error.code).to.be.defined
      expect(error.code).to.equal('EACCES')
      expect(error.syscall).to.be.defined
      expect(error.syscall).to.equal('spawn')
      expect(error.message).to.be.defined
      expect(error.message).to.contain('spawn EACCES')
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should create a process with a valid executable', function(done) {
    this.timeout(10000)
    timer = setTimeout(done, 9000)
    var args = [ path.resolve(process.cwd(), 'tests', 'unit', 'utils', 'sample.js') ]
    proc = new Process()
    proc.create('node', args, {
      onstdout: stdout => {
        expect(stdout).to.contain('sample process')
      }
    })
    .then((code, signal) => {
      clearTimeout(timer)
      expect(code).to.equal(0)
      expect(signal).to.not.be.defined
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
    expect(proc.pid).to.be.defined
  })

  it('should work without onstdout handler for valid executable', function(done) {
    this.timeout(10000)
    timer = setTimeout(done, 9000)
    var args = [ path.resolve(process.cwd(), 'tests', 'unit', 'utils', 'sample.js') ]
    proc = new Process()
    proc.create('node', args)
    .then((code, signal) => {
      clearTimeout(timer)
      expect(code).to.equal(0)
      expect(signal).to.not.be.defined
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
    expect(proc.pid).to.be.defined
  })

  it('should create a process and receive data on stderr', function(done) {
    this.timeout(10000)
    timer = setTimeout(done, 9000)
    var args = [ path.resolve(process.cwd(), 'tests', 'unit', 'utils', 'sample-stderr.js') ]
    proc = new Process()
    proc.create('node', args, {
      onstderr: stderr => {
        expect(stderr).to.contain('sample process stderr')
      }
    })
    .then((code, signal) => {
      clearTimeout(timer)
      expect(code).to.equal(0)
      expect(signal).to.not.be.defined
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
    expect(proc.pid).to.be.defined
  })

  it('should work without specifying onstderr handler', function(done) {
    this.timeout(10000)
    timer = setTimeout(done, 9000)
    var args = [ path.resolve(process.cwd(), 'tests', 'unit', 'utils', 'sample-stderr.js') ]
    proc = new Process()
    proc
    .create('node', args)
    .then((code, signal) => {
      clearTimeout(timer)
      expect(code).to.equal(0)
      expect(signal).to.not.be.defined
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
    expect(proc.pid).to.be.defined
  })

})

describe('status', function() {

  var proc, timer

  function done() {
  }

  it('should fail when no pid is associated', function() {
    proc = new Process()
    function tester() {
      proc.status()
    }
    expect(tester).to.throw(Error)
  })

  it('should say running for a running process', function(done) {
    this.timeout(10000)
    timer = setTimeout(done, 9000)
    utils.procsByCmd('node')
    .then(list => {
      clearTimeout(timer)
      expect(list.length).to.be.at.least(1)
      proc = new Process(list[0].pid)
      expect(proc.status()).to.equal('running')
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should say stopped for a process that runs and stops', function(done) {
    this.timeout(10000)
    timer = setTimeout(done, 9000)
    proc = new Process()
    var args = [ path.resolve(process.cwd(), 'tests', 'unit', 'utils', 'sample.js') ]
    proc.create('node', args, {
      onstdout: stdout => {
        expect(stdout).to.contain('sample process')
      }
    })
    .then((code, signal) => {
      clearTimeout(timer)
      expect(code).to.equal(0)
      expect(signal).to.not.be.defined
      expect(proc.status()).to.equal('stopped')
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
    expect(proc.pid).to.be.defined
  })

})

describe('stop', function() {

  var proc, timer

  function done() {
  }

  it('should fail when no pid is associated', function(done) {
    this.timeout(10000)
    timer = setTimeout(done, 9000)
    proc = new Process()
    proc.stop()
    .catch(error => {
      clearTimeout(timer)
      expect(error.message).to.contain('Process: no pid associated to stop')
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should fail for a stopped process', function(done) {
    this.timeout(10000)
    timer = setTimeout(done, 9000)
    var args = [ path.resolve(process.cwd(), 'tests', 'unit', 'utils', 'sample.js') ]
    proc = new Process()
    proc.create('node', args, {
      onstdout: stdout => {
        expect(stdout).to.contain('sample process')
      }
    })
    .then((code, signal) => {
      expect(code).to.equal(0)
      expect(signal).to.not.be.defined
      return proc.stop()
    })
    .catch(error => {
      clearTimeout(timer)
      expect(error.message).to.contain('Process: already stopped')
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
    expect(proc.pid).to.be.defined
  })

  it('should fail to stop an externally created process', function(done) {
    this.timeout(10000)
    timer = setTimeout(done, 9000)
    utils.procsByCmd('node')
    .then(list => {
      for(var i = 0; i < list.length; ++i) {
        var p = list[i]
        if(p.arguments.toString().match(/wait.js/)) {
          proc = new Process(p)
          expect(proc.pid).to.be.defined
          return proc.stop()
        }
      }
      return true
    })
    .catch(error => {
      clearTimeout(timer)
      expect(error.message).to.contain('Process: cannot kill external process')
      done()
    })
    .catch(err => {
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
  })

  it('should stop a process spawned', function(done) {
    this.timeout(10000)
    timer = setTimeout(done, 9000)
    proc = new Process()
    var args = [ path.resolve(process.cwd(), 'tests', 'unit', 'utils', 'wait.js') ]
    proc.create('node', args)
    .then((code, signal) => {
      clearTimeout(timer)
      done()
    })
    .catch(err => {
      clearTimeout(timer)
      console.error('UNEXPECTED ERROR >>', err)
      throw err
    })
    expect(proc.pid).to.be.defined
    proc.stop()
  })

})
