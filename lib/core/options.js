'use strict'

let
  InputError = require('./errors').InputError

class Options {

  constructor(allowedOpts) {
    this.allowedOpts = allowedOpts
  }

  process(input) {
    return this.parse(input || { })
  }

  parse(input) {
    checkUnallowed(input, this.allowedOpts)
    return convert(input)
  }
}

function checkUnallowed(input, allowedOpts) {
  Object.keys(input).forEach(key => {
    if(-1 === allowedOpts.indexOf(key)) {
      throw new InputError('Options: unexpected user option ' + key + ':' + input[key])
    }
  })
}

function convert(input)
{
  let args = [ ]
  Object.keys(input).forEach(key => {
    recursivelyConvert(key, input, args)
  })
  return args
}

function recursivelyConvert(key, input, args, prefix) {
  let converted = key.replace(/([A-Z])/g, $1 => {return "-"+$1.toLowerCase()})
  if (prefix) {
    converted = prefix + '-' + converted
  }
  if('object' !== typeof(input[key])) {
    args.push('--'+converted)
    if('boolean' !== typeof(input[key])) {
      args.push(input[key].toString())
    }
  }
  else {
    Object.keys(input[key]).forEach(subKey => {
      recursivelyConvert(subKey, input[key], args, converted)
    })
  }
}

exports.Options = Options
