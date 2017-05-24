'use strict';

const LEVELS = {
  SILENT: 1,
  ERROR: 2,
  WARN: 3,
  INFO: 4,
  DEBUG: 5
}

const COLORS = {
  ERROR: "\x1b[31m",
  WARN: "\x1b[33m",
  INFO: "\x1b[36m",
  DEBUG: "",
  RESET: "\x1b[0m"
}

const UnitTestsColor = "\x1b[35m"

class Log {

  constructor(level, namespace) {
    if (level && !(level in LEVELS)) {
      throw new Error('Logging level must be one of:' + Object.keys(LEVELS).join(', '))
    }
    this.level = level || 'ERROR'
    this.namespace = namespace
  }

  error() {
    this.log('ERROR', 'error', arguments)
  }

  warn() {
    this.log('WARN', 'warn', arguments)
  }

  info() {
    this.log('INFO', 'info', arguments)
  }

  debug() {
    this.log('DEBUG', 'log', arguments)
  }

  log(level, method, args) {
    if (LEVELS[this.level] >= LEVELS[level]) {
      args[0] = [
        COLORS[level] || ('UnitTests' === this.namespace ? UnitTestsColor : ''),
        new Date(),
        level,
        this.namespace,
        args[0],
        COLORS.RESET].join(' ')
      console[method].apply(console, args)
    }
  }
}

exports.Log = Log
