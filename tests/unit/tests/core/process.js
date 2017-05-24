'use strict';

var
  path = require('path'),
  sleep = require('sleep'),
  ps = require('ps-node'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  Process = require('./../../../../lib/core/process').Process,
  utils = require('./utils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

function procExit(code, signal) {
  expect(code).to.equal(0)
  expect(signal).to.not.be.defined
}

describe('create', function() {

  var proc
  this.timeout(0)

  it('should throw an error for non-existent exe', function() {
    proc = new Process()
    return proc.create('abc', [ ])
    .catch(error => {
      expect(error.code).to.be.defined
      expect(error.code).to.equal('ENOENT')
      expect(error.syscall).to.be.defined
      expect(error.syscall).to.equal('spawn abc')
    })
    .should.be.fulfilled
  })

  it('should throw an error for no executable permissions', function() {
    proc = new Process()
    var exe = path.resolve(process.cwd(), 'tests', 'unit', 'utils', 'sample.js')
    return proc.create(exe, [ ])
    .catch(error => {
      expect(error.code).to.be.defined
      expect(error.code).to.be.oneOf(['EACCES', 'UNKNOWN'])
      expect(error.syscall).to.be.defined
      expect(error.syscall).to.equal('spawn')
    })
    .should.be.fulfilled
  })

  it('should create a process with a valid executable', function() {
    var args = [ path.resolve(process.cwd(), 'tests', 'unit', 'utils', 'sample.js') ]
    proc = new Process()
    return proc.create('node', args, {
      onstdout: stdout => {
        expect(stdout).to.contain('sample process')
      }
    })
    .then((code, signal) => {
      expect(proc.pid).to.be.defined
      procExit(code, signal)
    })
    .should.be.fulfilled
  })

  it('should work without onstdout handler for valid executable', function() {
    var args = [ path.resolve(process.cwd(), 'tests', 'unit', 'utils', 'sample.js') ]
    proc = new Process()
    return proc.create('node', args)
    .then((code, signal) => {
      expect(proc.pid).to.be.defined
      procExit(code, signal)
    })
    .should.be.fulfilled
  })

  it('should create a process and receive data on stderr', function() {
    var args = [ path.resolve(process.cwd(), 'tests', 'unit', 'utils', 'sample-stderr.js') ]
    proc = new Process()
    return proc.create('node', args, {
      onstderr: stderr => {
        expect(stderr).to.contain('sample process stderr')
      }
    })
    .then((code, signal) => {
      expect(proc.pid).to.be.defined
      procExit(code, signal)
    })
    .should.be.fulfilled
  })

  it('should work without specifying onstderr handler', function() {
    var args = [ path.resolve(process.cwd(), 'tests', 'unit', 'utils', 'sample-stderr.js') ]
    proc = new Process()
    return proc.create('node', args)
    .then((code, signal) => {
      expect(proc.pid).to.be.defined
      procExit(code, signal)
    })
    .should.be.fulfilled
  })

})

describe('status', function() {

  var proc
  this.timeout(0)

  it('should fail when no pid is associated', function() {
    proc = new Process()
    function tester() {
      proc.status()
    }
    expect(tester).to.throw(Error)
  })

  it('should say running for a running process', function() {
    return utils.procsByCmd('node')
    .then(list => {
      expect(list.length).to.be.at.least(1)
      proc = new Process(list[0].pid)
      expect(proc.status()).to.equal('running')
    })
    .should.be.fulfilled
  })

  it('should say stopped for a process that runs and stops', function() {
    proc = new Process()
    var args = [ path.resolve(process.cwd(), 'tests', 'unit', 'utils', 'sample.js') ]
    return proc.create('node', args, {
      onstdout: stdout => {
        expect(stdout).to.contain('sample process')
      }
    })
    .then((code, signal) => {
      expect(proc.pid).to.be.defined
      expect(proc.status()).to.equal('stopped')
      procExit(code, signal)
    })
    .should.be.fulfilled
  })

})

describe('stop', function() {

  var proc
  this.timeout(0)

  it('should fail when no pid is associated', function() {
    proc = new Process()
    return proc.stop()
    .should.be.rejectedWith('Process: no pid associated to stop')
  })

  it('should fail for a stopped process', function() {
    var args = [ path.resolve(process.cwd(), 'tests', 'unit', 'utils', 'sample.js') ]
    proc = new Process()
    return proc.create('node', args, {
      onstdout: stdout => {
        expect(stdout).to.contain('sample process')
      }
    })
    .then((code, signal) => {
      expect(proc.pid).to.be.defined
      procExit(code, signal)
      return proc.stop()
    })
    .should.be.rejectedWith('Process: already stopped')
  })

  it('should fail to stop an externally created process', function() {
    return utils.procsByCmd('node')
    .then(list => {
      for(var i = 0; i < list.length; ++i) {
        var p = list[i]
        if(p.arguments.toString().match(/wait.js/)) {
          proc = new Process(p)
          expect(proc.pid).to.be.defined
          return proc.stop()
        }
      }
      throw new Error('Process: cannot kill external process')
    })
    .should.be.rejectedWith('Process: cannot kill external process')
  })

  it('should stop a process spawned', function() {
    proc = new Process()
    var args = [ path.resolve(process.cwd(), 'tests', 'unit', 'utils', 'wait.js') ]
    proc.create('node', args)
    .then((code, signal) => {
      expect(proc.pid).to.be.defined
    })
    return proc.stop().should.be.fulfilled
  })

})
