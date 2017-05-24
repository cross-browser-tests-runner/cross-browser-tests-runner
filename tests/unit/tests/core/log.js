'use strict';

var
  Log = require('./../../../../lib/core/log').Log,
  chai = require('chai'),
  spies = require('chai-spies'),
  expect = chai.expect,
  should = chai.should()

chai.use(spies)

describe('log', function() {

  it('should throw error for invalid level', function() {
    function tester() { new Log('XYZ') }
    expect(tester).to.throw(Error)
  })

  it('should create ERROR log if no level is specified', function() {
    var log = new Log()
    expect(log).to.not.be.null
    expect(log.level).to.equal('ERROR')
  })

  it('should create ERROR log if empty level is specified', function() {
    var log = new Log('')
    expect(log).to.not.be.null
    expect(log.level).to.equal('ERROR')
  })

  it('should create ERROR log if null level is specified', function() {
    var log = new Log(null)
    expect(log).to.not.be.null
    expect(log.level).to.equal('ERROR')
  })

  it('should create log with DEBUG level', function() {
    var log = new Log('DEBUG', 'Unit Tests')
    expect(log).to.not.be.null
    expect(log.level).to.equal('DEBUG')
  })

  it('should create log with INFO level', function() {
    var log = new Log('INFO', 'Unit Tests')
    expect(log).to.not.be.null
    expect(log.level).to.equal('INFO')
  })

  it('should create log with WARN level', function() {
    var log = new Log('WARN', 'Unit Tests')
    expect(log).to.not.be.null
    expect(log.level).to.equal('WARN')
  })

  it('should create log with ERROR level', function() {
    var log = new Log('ERROR', 'Unit Tests')
    expect(log).to.not.be.null
    expect(log.level).to.equal('ERROR')
  })

  it('should create log with SILENT level', function() {
    var log = new Log('SILENT', 'Unit Tests')
    expect(log).to.not.be.null
    expect(log.level).to.equal('SILENT')
  })

  it('should print messages using console.log', function() {
    var log = new Log('DEBUG', 'Unit Tests')
    expect(log).to.not.be.null
    var spy = chai.spy.on(console, 'log')
    log.debug('My mocha test message')
    spy.should.have.been.called.once
  })

  it('should print messages using console.info', function() {
    var log = new Log('DEBUG', 'Unit Tests')
    expect(log).to.not.be.null
    var spy = chai.spy.on(console, 'info')
    log.info('My mocha test message')
    spy.should.have.been.called.once
  })

  it('should print messages using console.warn', function() {
    var log = new Log('DEBUG', 'Unit Tests')
    expect(log).to.not.be.null
    var spy = chai.spy.on(console, 'warn')
    log.warn('My mocha test message')
    spy.should.have.been.called.once
  })

  it('should print messages using console.error', function() {
    var log = new Log('INFO', 'Unit Tests')
    expect(log).to.not.be.null
    var spy = chai.spy.on(console, 'error')
    log.error('My mocha test message')
    spy.should.have.been.called.once
  })

  it('should print nothing for SILENT mode', function() {
    var log = new Log('SILENT', 'Unit Tests')
    expect(log).to.not.be.null
    var spy = chai.spy.on(console, 'error')
    log.error('My mocha test message')
    spy.should.not.have.been.called.once
    var spy = chai.spy.on(console, 'warn')
    log.warn('My mocha test message')
    spy.should.not.have.been.called.once
    var spy = chai.spy.on(console, 'info')
    log.info('My mocha test message')
    spy.should.not.have.been.called.once
    var spy = chai.spy.on(console, 'log')
    log.debug('My mocha test message')
    spy.should.not.have.been.called.once
  })

  it('should print only error messages for ERROR mode', function() {
    var log = new Log('ERROR', 'Unit Tests')
    expect(log).to.not.be.null
    var spy = chai.spy.on(console, 'error')
    log.error('My mocha test message')
    spy.should.have.been.called.once
    var spy = chai.spy.on(console, 'warn')
    log.warn('My mocha test message')
    spy.should.not.have.been.called.once
    var spy = chai.spy.on(console, 'info')
    log.info('My mocha test message')
    spy.should.not.have.been.called.once
    var spy = chai.spy.on(console, 'log')
    log.debug('My mocha test message')
    spy.should.not.have.been.called.once
  })

  it('should print only error and warning messages for WARN mode', function() {
    var log = new Log('WARN', 'Unit Tests')
    expect(log).to.not.be.null
    var spy = chai.spy.on(console, 'error')
    log.error('My mocha test message')
    spy.should.have.been.called.once
    var spy = chai.spy.on(console, 'warn')
    log.warn('My mocha test message')
    spy.should.have.been.called.once
    var spy = chai.spy.on(console, 'info')
    log.info('My mocha test message')
    spy.should.not.have.been.called.once
    var spy = chai.spy.on(console, 'log')
    log.debug('My mocha test message')
    spy.should.not.have.been.called.once
  })

  it('should print only error, warning and info messages for INFO mode', function() {
    var log = new Log('INFO', 'Unit Tests')
    expect(log).to.not.be.null
    var spy = chai.spy.on(console, 'error')
    log.error('My mocha test message')
    spy.should.have.been.called.once
    var spy = chai.spy.on(console, 'warn')
    log.warn('My mocha test message')
    spy.should.have.been.called.once
    var spy = chai.spy.on(console, 'info')
    log.info('My mocha test message')
    spy.should.have.been.called.once
    var spy = chai.spy.on(console, 'log')
    log.debug('My mocha test message')
    spy.should.not.have.been.called.once
  })

  it('should print messages of all levels for DEBUG mode', function() {
    var log = new Log('DEBUG', 'Unit Tests')
    expect(log).to.not.be.null
    var spy = chai.spy.on(console, 'error')
    log.error('My mocha test message')
    spy.should.have.been.called.once
    var spy = chai.spy.on(console, 'warn')
    log.warn('My mocha test message')
    spy.should.have.been.called.once
    var spy = chai.spy.on(console, 'info')
    log.info('My mocha test message')
    spy.should.have.been.called.once
    var spy = chai.spy.on(console, 'log')
    log.debug('My mocha test message')
    spy.should.have.been.called.once
  })

})
