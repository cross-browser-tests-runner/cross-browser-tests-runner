'use strict'

class InputError extends Error {

  get name() {
    return 'InputError'
  }

}

exports.InputError = InputError
