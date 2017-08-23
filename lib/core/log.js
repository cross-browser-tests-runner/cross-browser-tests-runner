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
  DEBUG: "\x1b[90m",
  RESET: "\x1b[0m"
}

const TestsColor = "\x1b[35m"

class Log {

  constructor(namespace, level) {
    if (level && !(level in LEVELS)) {
      throw new Error('Logging level must be one of:' + Object.keys(LEVELS).join(', '))
    }
    this.level = level || process.env.LOG_LEVEL || 'ERROR'
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
      args[0] = [level, ' ', (new Date()).toISOString(), ' ', this.namespace, ' ', args[0]]
      let color = 
        (-1 !== ['UnitTests', 'IntegrationTests', 'FunctionalTests'].indexOf(this.namespace)
          ? TestsColor : COLORS[level])
      args[0].unshift(color)
      args[0].push(COLORS.RESET)
      args[0] = args[0].join('')
      console[method].apply(console, args)
    }
  }
}

exports.Log = Log
