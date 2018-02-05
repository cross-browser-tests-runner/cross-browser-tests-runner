'use strict'

let
  fs = require('fs')

class Config {

  constructor(file) {
    if(!fs.existsSync(file)) {
      throw new Error('Config: the file ' + file + ' does not exist')
    }
    this.content = JSON.parse(fs.readFileSync(file, 'utf8'))
  }

  get(path, key, input) {
    let obj = atPath(this.content, path)
    return evalKeyForValue(key, obj, input)
  }

  validate(path, key, input) {
    let value = this.get(path, key, input)
    if(undefined === value) {
      return false
    }
    if(false === validateRestrict(this, path, key, value, input)) {
      return false
    }
    return validateByType(key, value, input)
  }

}

function atPath(content, path) {
  if(!path) {
    throw new Error('Config: a non-empty path must be specified')
  }
  let components = path.split('.'), obj = content
  components.forEach(component => {
    if(!(component in obj)) {
      throw new Error('Config: component "' + component + '" in path "' + path + '" not found')
    }
    obj = obj[component]
  })
  return obj
}

function evalKeyForValue(key, obj, input) {
  ensureKey(key, obj)
  let value = obj[key]
  switch(getType(value)) {
    case 'scalar':
    case 'set':
    case 'expression':
    case 'keyword':
      return value
    case 'alias':
      return evalKeyForValue(value, obj, input)
    default: //case 'rule':
      return evalRuleForValue(value, input)
  }
}

function getType(val) {
  switch(typeof(val)) {
    case 'string':
      return parseStringType(val)
    case 'object':
      return parseObjectType(val)
    default:
      return 'scalar'
  }
}

function parseStringType(val) {
  if(val.match(/^#/)) {
    return 'alias'
  }
  if(val.match(/^<[a-z]+>$/)) {
    return 'keyword'
  }
  if(val.match(/^[<>!]/)) {
    return 'expression'
  }
  return 'scalar'
}

function parseObjectType(val) {
  return (isArray(val)) ? 'set' : 'rule'
}

function evalRuleForValue(rule, input) {
  if("@if" in rule && false === ensureIf(rule["@if"], input)) {
    return undefined
  }
  let value
  if("@key" in rule) {
    value = evalKeyDirectiveForValue(rule["@key"], rule, input)
  }
  return undefined === value ? rule["@values"] : value
}

function ensureIf(rule, input) {
  ensureObject(input)
  ensureStatementFormat(rule)
  let key = Object.keys(rule)[0], keyType = getIfKeyType(key), value = rule[key]
  switch(keyType) {
    case 'operator':
      return evalCondition(key, value, input)
    default: // scalar
      return evalStatement(key, value, rule, input)
  }
}

function getIfKeyType(key) {
  return -1 !== ['&&', '||'].indexOf(key) ? 'operator' : 'scalar'
}

function evalCondition(operator, operands, input) {
  ensureOperandsFormat(operands, operator)
  switch(operator) {
    case '&&':
      return evalAndOperator(operands, input)
    default: // ||
      return evalOrOperator(operands, input)
  }
}

function evalAndOperator(operands, input) {
  for(let idx = 0; idx < operands.length; ++idx) {
    ensureStatementFormat(operands[idx])
    let statement = operands[idx], key = Object.keys(statement)[0], value = statement[key]
    if('operator' !== getIfKeyType(key)) {
      if(!evalStatement(key, value, statement, input)) {
        return false
      }
    } else {
      if(!evalCondition(key, value, input)) {
        return false
      }
    }
  }
  return true
}

function evalOrOperator(operands, input) {
  for(let idx = 0; idx < operands.length; ++idx) {
    ensureStatementFormat(operands[idx])
    let statement = operands[idx], key = Object.keys(statement)[0], value = statement[key]
    if('operator' !== getIfKeyType(key)) {
      if(evalStatement(key, value, statement, input)) {
        return true
      }
    } else {
      if(evalCondition(key, value, input)) {
        return true
      }
    }
  }
  return false
}

function evalStatement(key, value, rule, input) {
  switch(getType(value)) {
    case 'scalar':
      ensureKey(key, input)
      return matchScalar(key, value, input)
    case 'set':
      ensureKey(key, input)
      return matchSet(key, value, input)
    case 'expression':
      ensureKey(key, input)
      return matchExpr(key, value, input)
    case 'keyword':
      ensureKey(key, input)
      return matchKeyword(key, value, input)
    case 'alias':
      throw new Error('Config: malformed conditional statement with an alias "' + value + '" as value for key "' + key + '" in rule ' + JSON.stringify(rule))
    default: //case 'rule'
      return evalStatement(key, evalRuleForValue(value, input), rule, input)
  }
}

function matchScalar(key, scalar, input) {
  return (scalar === input[key])
}

function matchSet(key, set, input) {
  return (-1 !== set.indexOf(input[key]))
}

function matchExpr(key, expr, input) {
  /* eslint-disable no-eval */
  return (true === eval(makeEvalFriendly(input[key]) + ' ' + expr))
  /* eslint-enable no-eval */
}

function makeEvalFriendly(value) {
  if('string' === typeof(value)) {
    return "\'" + value + "\'"
  }
  return value
}

function matchKeyword(key, keyword, input) {
  let type = keyword.replace(/^</, '').replace(/>$/, '')
  if('array' !== type) {
    return (typeof(input[key]) === type)
  } else {
    return (isArray(input[key]))
  }
}

function evalKeyDirectiveForValue(key, rule, input) {
  if(!key) {
    throw new Error('Config: invalid value for "@key" in ' + JSON.stringify(rule))
  }
  ensureObject(input)
  ensureKey(key, input)
  if(!(input[key] in rule)) {
    // This is expected as several times we'll do the key lookups but won't find
    // them, and then we must go to the top most level and look for other means
    // to find the required value
    return undefined
  }
  return evalKeyForValue(input[key], rule, input)
}

function ensureKey(key, input) {
  if(!(key in input)) {
    throw new Error('Config: key "' + key + '" does not exist in ' + JSON.stringify(input))
  }
}

function validateRestrict(config, path, key, value, input) {
  let obj = atPath(config.content, path + '.' + key)
  if(hasRestrictKey(obj) && false === evalRestrict(key, value, input, obj["@restrict"])) {
    return false
  }
  return true
}

function hasRestrictKey(obj) {
  return ('object' === typeof(obj) && !isArray(obj) && "@restrict" in obj)
}

function evalRestrict(key, value, input, restrictRule) {
  let restrictValue = evalRestrictRule(input, restrictRule)
  if(undefined === restrictValue) {
    return true
  }
  switch(getType(restrictValue)) {
    case 'scalar':
      return matchScalar(key, restrictValue, input)
    case 'set':
      return matchSet(key, restrictValue, input)
    case 'expression':
      return matchExpr(key, restrictValue, input)
    default: // case 'keyword':
      return matchKeyword(key, restrictValue, input)
  }
}

function evalRestrictRule(input, restrictRule) {
  ensureObject(restrictRule)
  return evalRuleForValue(restrictRule, input)
}

function validateByType(key, value, input) {
  switch(getType(value)) {
    case 'scalar':
      return matchScalar(key, value, input)
    case 'set':
      return matchSet(key, value, input)
    case 'expression':
      return matchExpr(key, value, input)
    default: //case 'keyword':
      return matchKeyword(key, value, input)
  }
}

function ensureObject(val) {
  if(!val || 'object' !== typeof(val) || isArray(val)) {
    throw new Error('Config: invalid variable, an object expected but found ' + JSON.stringify(val))
  }
}

function ensureOperandsFormat(operands, operator) {
  if(!operands || 'object' !== typeof(operands) || !isArray(operands)) {
    throw new Error('Config: invalid set of operands "' + JSON.stringify(operands) + '" for "' + operator + '" operator, expected an array')
  }
}

function ensureStatementFormat(statement) {
  if(!statement || 'object' !== typeof(statement) || isArray(statement) || Object.keys(statement).length > 1) {
    throw new Error('Config: invalid statement "' + JSON.stringify(statement) + '", expected an object with exactly one key')
  }
}

function isArray(v) {
  return ('function' === typeof(v.indexOf))
}

exports.Config = Config
