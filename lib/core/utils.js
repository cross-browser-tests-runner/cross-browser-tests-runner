'use strict'

const swapKV = obj => {
  let ret = { }
  Object.keys(obj).forEach(key => {
    ret[obj[key]] = key
  })
  return ret
}

const COLORS = {
  FAIL: "\x1b[31m",
  OK: "\x1b[32m",
  RESET: "\x1b[0m"
}

exports.swapKV = swapKV
exports.COLORS = COLORS
