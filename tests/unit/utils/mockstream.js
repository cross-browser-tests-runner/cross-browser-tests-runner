var EventEmitter = require('events').EventEmitter,
    util = require('util')

function MockWriteStream() {
}

util.inherits(MockWriteStream, EventEmitter)

MockWriteStream.prototype._write = function() {
  this.emit('error', 'Mocked error on write')
}

MockWriteStream.prototype._writev = function() {
  this.emit('error', 'Mocked error on write')
}

MockWriteStream.prototype.write = function() {
  this.emit('error', 'Mocked error on write')
}

MockWriteStream.prototype.end = function() {
}

exports.MockWriteStream = MockWriteStream
