'use strict';

class Test {

  create() {
    throw new Error('Test.create: Not implemented')
  }

  status() {
    throw new Error('Test.status: Not implemented')
  }

  stop() {
    throw new Error('Test.stop: Not implemented')
  }
}

exports.Test = Test
