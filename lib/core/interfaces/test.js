'use strict';

class Test {

  create() {
    throw new Error('Test.create')
  }

  status() {
    throw new Error('Test.status')
  }

  stop() {
    throw new Error('Test.stop')
  }
}

exports.Test = Test
