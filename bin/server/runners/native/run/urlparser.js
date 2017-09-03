'use strict'

class UrlParser {

  static isValid(req) {
    return (req.query.cbtr_run && req.query.cbtr_test)
  }

  static run(req) {
    return req.query.cbtr_run
  }

  static test(req) {
    return req.query.cbtr_test
  }

}

exports.UrlParser = UrlParser
