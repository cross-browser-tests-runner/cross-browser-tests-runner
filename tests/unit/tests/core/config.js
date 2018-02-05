'use strict';

var
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  path = require('path'),
  Config = require('./../../../../lib/core/config').Config,
  utils = require('./utils')

chai.use(chaiAsPromised)

var
  expect = chai.expect,
  should = chai.should()

describe('Config', function() {

  describe('constructor', function() {

    it('should fail for a non-existent file', function() {
      expect(() => {new Config('somefile.json')}).to.throw('the file somefile.json does not exist')
    })

    it('should fail for a file with bad JSON syntax', function() {
      var file = path.resolve(process.cwd(), 'tests/unit/samples/conf/bad-syntax.json')
      expect(() => {new Config(file)}).to.throw('Unexpected token n')
    })
  })

  describe('get', function() {

    var config = new Config(path.resolve(process.cwd(), 'tests/unit/samples/conf/valid-1.json'))
    this.timeout(0)

    it('should fail with a falsy path', function() {
      expect(()=>{config.get('', 'parameters')}).to.throw('a non-empty path must be specified')
    })

    it('should fail with a path that starts with a key that does not exist', function(){
      expect(()=>{config.get('abc')}).to.throw('component "abc" in path "abc" not found')
    })

    it('should fail with a path that has a key in the middle that does not exist', function(){
      expect(()=>{config.get('parameters.abc.resolution')}).to.throw('component "abc" in path "parameters.abc.resolution" not found')
    })

    it('should fail with a path that has a key in the end that does not exist', function(){
      expect(()=>{config.get('parameters.resolution.abc')}).to.throw('component "abc" in path "parameters.resolution.abc" not found')
    })

    it('should fail with a key that does not exist at given path', function(){
      expect(()=>{config.get('conversions.os', 'abc')}).to.throw('key "abc" does not exist in {"Android":"android","Windows Phone":"winphone","iOS":"ios"}')
    })

    it('should return expected string "scalar" value of a key', function() {
      expect(config.get('conversions.os', 'Android')).to.equal('android')
    })

    it('should return expected non-string "scalar" value of a key', function() {
      expect(config.get('conversions.browser', 'Dummy')).to.equal(123)
    })

    it('should return expected "set" value of a key', function() {
      expect(config.get('parameters.resolution', 'OS X')).to.deep.equal(["1024x768", "1280x960", "1280x1024", "1600x1200", "1920x1080"])
    })

    it('should return expected "keyword" value of a key', function() {
      expect(config.get('parameters', 'screenshots')).to.equal('<boolean>')
    })

    it('should return expected "expression" value of a key', function() {
      expect(config.get('parameters.orientation.@if', 'device')).to.equal('!== null')
      expect(config.get('parameters.seleniumVersion.@restrict.OS X', 'Snow Leopard')).to.equal("< '2.47.1'")
    })

    it('should return expected "scalar" value of a key which value is an "alias"', function() {
      expect(config.get('parameters.resolution.Windows', '7')).to.deep.equal(["800x600", "1024x768", "1280x800", "1280x1024", "1366x768", "1440x900", "1680x1050", "1600x1200", "1920x1200", "1920x1080", "2048x1536"])
    })

    it('should fail if the "rule" value of a key has a bad "@key" directive', function() {
      expect(() => {config.get('conversions.browser', 'NullKeyRule')}).to.throw('invalid value for "@key" in {"@key":null}')
    })

    it('should fail if falsy input parameter was provided and needed to parse "@key" directive', function() {
      expect(() => {config.get('conversions.browser', 'Android Browser')}).to.throw('invalid variable, an object expected but found undefined')
    })

    it('should fail if an array type input parameter was provided and needed to parse "@key" directive', function() {
      expect(() => {config.get('conversions.browser', 'Android Browser', [ ])}).to.throw('invalid variable, an object expected but found []')
    })

    it('should fail if value of a "@key" diretive was not found as a key in input parameter', function() {
      expect(() => {config.get('conversions.browser', 'Android Browser', { })}).to.throw('key "TestType" does not exist in {}')
    })

    it('should return undefined if value of a "@key" diretive exists as a key in input parameter but its value does not exist in the rule parsed as a key', function() {
      expect(config.get('conversions.browser', 'Android Browser', {TestType: 'JS'})).to.be.undefined
    })

    it('should return expected value if "@key" diretive can be parsed using the provided input parameter', function() {
      expect(config.get('conversions.browser', 'Android Browser', {TestType: 'Selenium'})).to.equal('android')
    })

    it('should fail to parse multi-level rule consisting of "@key" directives if one of the required keys does not exist in input', function() {
      expect(() => {config.get('conversions.browser', 'Mobile Safari', {TestType: 'Selenium'})}).to.throw('key "device" does not exist in {"TestType":"Selenium"}')
    })

    it('should return undefined after parsing multi-level rule consisting of "@key" directives if all keys exist in input but one of the values does not exist as a key in one of the parsed rule levels', function() {
      expect(config.get('conversions.browser', 'Mobile Safari', {TestType: 'Selenium', device: 'xyz'})).to.be.undefined
    })

    it('should return expected value after parsing a multi-level rule with "@key" diretives once all required values and keys are provided in the input parameter', function() {
      expect(config.get('conversions.browser', 'Mobile Safari', {TestType: 'Selenium', device: 'iPad 2 (5.0)'})).to.equal('ipad')
    })

    it('should return value of "@values" directive in case "@key" diretives did not exist', function() {
      expect(config.get('parameters', 'seleniumVersion')).to.deep.equal(["2.37.0", "2.40.0", "2.41.0", "2.42.2", "2.43.1", "2.44.0", "2.45.0", "2.46.0", "2.47.1", "2.48.2", "2.49.0", "2.50.0", "2.51.0", "2.52.0", "2.53.0", "2.53.1", "3.0.0-beta1", "3.0.0-beta2", "3.0.0", "3.0.1", "3.1.0", "3.2.0", "3.3.0", "3.3.1", "3.4.0", "3.5.2"])
    })

    it('should fail if an "@if" directive needed to be parsed but falsy input was provided', function() {
      expect(()=>{config.get('parameters', 'resolution')}).to.throw('invalid variable, an object expected but found undefined')
    })

    it('should fail if an "@if" directive needed to be parsed but an array type input was provided', function() {
      expect(()=>{config.get('parameters', 'resolution', [ ])}).to.throw('invalid variable, an object expected but found []')
    })

    it('should fail if an "@if" directive involved a "key: scalar" statement but the key did not exist in input', function() {
      expect(()=>{config.get('parameters', 'captureConsole', { })}).to.throw('key "browser" does not exist in {}')
    })

    it('should return undefined if an "@if" directive involved a "key: scalar" statement and the value of the key in input does not match the scalar in the rule', function() {
      expect(config.get('parameters', 'captureConsole', {browser: 'Firefox' })).to.be.undefined
    })

    it('should return expected value after passing an "@if" directive that involves "key: scalar" statement, using the "@values" directive', function() {
      expect(config.get('parameters', 'captureConsole', {browser: 'Chrome' })).to.deep.equal(["disable", "errors", "warnings", "info", "verbose"])
    })

    it('should fail if an "@if" directive involved a "key: set" statement but the key did not exist in input', function() {
      expect(()=>{config.get('parameters', 'resolution', { })}).to.throw('key "os" does not exist in {}')
    })

    it('should return undefined if an "@if" directive involved a "key: set" statement and the value of the key in input does not match the set in the rule', function() {
      expect(config.get('parameters', 'resolution', {os: 'Linux' })).to.be.undefined
    })

    it('should return expected value after passing an "@if" directive that involves "key: set" statement, using the "@key" directive', function() {
      expect(config.get('parameters', 'resolution', {os: 'OS X' })).to.deep.equal(["1024x768", "1280x960", "1280x1024", "1600x1200", "1920x1080"])
    })

    it('should fail if an "@if" directive involved a "key: expression" statement but the key did not exist in input', function() {
      expect(()=>{config.get('parameters', 'orientation', { })}).to.throw('key "device" does not exist in {}')
    })

    it('should return undefined if an "@if" directive involved a "key: expression" statement and the value of the key in input does not match the expression in the rule', function() {
      expect(config.get('parameters', 'orientation', {device: null })).to.be.undefined
    })

    it('should return expected value after passing an "@if" directive that involves "key: expression" statement, using the "@values" directive', function() {
      expect(config.get('parameters', 'orientation', {device: 'SomeDevice' })).to.deep.equal(["portrait", "landscape"])
    })

    it('should fail if an "@if" directive involved a "key: keyword" statement but the key did not exist in input', function() {
      expect(()=>{config.get('parameters', 'captureNetwork', { })}).to.throw('key "browser" does not exist in {}')
    })

    it('should return undefined if an "@if" directive involved a "key: keyword" statement and the value of the key in input does not match the keyword in the rule', function() {
      expect(config.get('parameters', 'captureNetwork', {browser: null })).to.be.undefined
    })

    it('should return expected value after passing an "@if" directive that involves "key: keyword" statement, using the "@values" directive', function() {
      expect(config.get('parameters', 'captureNetwork', {browser: 'Chrome' })).to.equal('<boolean>')
    })

    it('should fail if an "@if" directive involved a "key: alias" statement', function() {
      expect(()=>{config.get('parameters', 'ieNoFlash', { })}).to.throw('malformed conditional statement with an alias "#value1" as value for key "browser" in rule {"browser":"#value1"}')
    })

    it('should return expected value after passing an "@if" directive that involves "key: rule" statement, using the "@values" directive', function() {
      expect(config.get('parameters', 'edgePopups', {browser: 'Edge' })).to.equal('<boolean>')
    })

    it('should fail if an "@if" directive involved a "&&" operator and statements were an array object', function() {
      expect(()=>{config.get('parameters', 'safariDriver', {browser: 'Safari' })}).to.throw('invalid set of operands "{"browser":"Safari"}" for "&&" operator, expected an array')
    })

    it('should fail if an "@if" directive involved a "&&" operator and one of the operand statements did not have the right format', function() {
      expect(()=>{config.get('parameters', 'autoAcceptAlerts', {os: 'iOS' })}).to.throw('invalid statement ""xyz"", expected an object with exactly one key')
    })

    it('should fail if an "@if" directive involved a "&&" operator and one of the operand statements errored', function() {
      expect(()=>{config.get('parameters', 'geckoDriver', {browser: 'Firefox' })}).to.throw('key "seleniumVersion" does not exist in {"browser":"Firefox"}')
    })

    it('should return undefined if an "@if" directive involved a "&&" operator and one of the operand statements evaluated as false', function() {
      expect(config.get('parameters', 'geckoDriver', {browser: 'Firefox', seleniumVersion: '2.0'})).to.be.undefined
    })

    it('should return expected value after passing an "@if" directive that involves "&&" operator, using the "@values" directive', function() {
      expect(config.get('parameters', 'geckoDriver', {browser: 'Firefox', seleniumVersion: '4.0'})).to.deep.equal(["0.10.0", "0.15.0", "0.16.0", "0.18.0"])
    })

    it('should return undefined if an "@if" directive involved a "||" operator and both operand statements errored', function() {
      expect(()=>{config.get('parameters', 'safariAllCookies', {})}).to.throw('key "browser" does not exist in {}')
    })

    it('should return undefined if an "@if" directive involved a "||" operator and both operand statements evaluated to false', function() {
      expect(config.get('parameters', 'safariAllCookies', {browser: "Firefox", device: "def"})).to.be.undefined
    })

    it('should return expected value after passing and "@if" directive that involves "||" operator and one of the operand statements evaluated to true', function() {
      expect(config.get('parameters', 'safariAllCookies', {browser: "Safari", device: "abc"})).to.equal('<boolean>')
    })

  })

  describe('validate', function() {

    var config = new Config(path.resolve(process.cwd(), 'tests/unit/samples/conf/valid-1.json'))
    this.timeout(0)

    it('should return false if value in input does not match expected "scalar" value', function() {
      expect(config.validate('parameters', 'video', {video: false})).to.be.false
    })

    it('should return true if value in input matches expected "scalar" value', function() {
      expect(config.validate('parameters', 'video', {video: true})).to.be.true
    })

    it('should return false if value in input does not match expected "set" value', function() {
      expect(config.validate('parameters', 'resolution', {os: 'Windows', osVersion: 'XP', resolution: '100x100'})).to.be.false
    })

    it('should return true if value in input matches expected "set" value', function() {
      expect(config.validate('parameters', 'resolution', {os: 'Windows', osVersion: 'XP', resolution: '1280x1024'})).to.be.true
    })

    it('should return false if value in input does not match expected "keyword" value', function() {
      expect(config.validate('parameters', 'captureNetwork', {browser: 'Chrome', captureNetwork: ''})).to.be.false
    })

    it('should return true if value in input matches expected "keyword" value', function() {
      expect(config.validate('parameters', 'captureNetwork', {browser: 'Chrome', captureNetwork: false})).to.be.true
    })

    it('should return false if value in input does not match expected "expression" value', function() {
      expect(config.validate('parameters', 'local', {local: false})).to.be.false
    })

    it('should return true if value in input matches expected "expression" value', function() {
      expect(config.validate('parameters', 'local', {local: true})).to.be.true
    })

    it('should return false if input keys do not satisfy "@if" rule ', function() {
      expect(config.validate('parameters', 'resolution', {os: 'Linux', resolution: '1280x1024'})).to.be.false
    })

    it('should fail if "@restrict" rule is invalid', function() {
      expect(()=>{config.validate('parameters', 'captureConsole', {captureConsole: "errors", browser: 'Chrome'})}).to.throw('invalid variable, an object expected but found [1]')
    })

    it('should fail if "@restrict" rule is valid but input does not have enough keys', function() {
      expect(()=>{config.validate('parameters', 'appiumVersion', {appiumVersion: "1.5.3"})}).to.throw('key "os" does not exist in {"appiumVersion":"1.5.3"}')
    })

    it('should return true if "@restrict" rule is valid and input has all required keys but with values that prevent restriction rule from being applicable', function() {
      expect(config.validate('parameters', 'appiumVersion', {appiumVersion: "1.5.3", os: "Android"})).to.be.true
    })

    it('should return false if "@restrict" rule is valid and input is such that the restriction rule is applicable and the input key to be restricted does not match "scalar" restriction value', function() {
      expect(config.validate('parameters', 'appiumVersion', {appiumVersion: "1.5.3", os: "iOS"})).to.be.false
    })

    it('should return true if "@restrict" rule is valid and input is such that the restriction rule is applicable and the input key to be restricted matches "scalar" restriction value', function() {
      expect(config.validate('parameters', 'appiumVersion', {appiumVersion: "1.7.0", os: "iOS"})).to.be.true
    })

    it('should return false if "@restrict" rule is valid and input is such that the restriction rule is applicable and the input key to be restricted does not match "expression" restriction value', function() {
      expect(config.validate('parameters', 'seleniumVersion', {seleniumVersion: "3.0.0", os: "OS X", osVersion: "Snow Leopard"})).to.be.false
    })

    it('should return true if "@restrict" rule is valid and input is such that the restriction rule is applicable and the input key to be restricted matches "expression" restriction value', function() {
      expect(config.validate('parameters', 'seleniumVersion', {seleniumVersion: "2.37.0", os: "OS X", osVersion: "Snow Leopard"})).to.be.true
    })

    it('should return false if "@restrict" rule is valid and input is such that the restriction rule is applicable and the input key to be restricted does not match "set" restriction value', function() {
      expect(config.validate('parameters', 'orientation', {device: "abc", os: "iOS", orientation: "landscape"})).to.be.false
    })

    it('should return true if "@restrict" rule is valid and input is such that the restriction rule is applicable and the input key to be restricted matches "set" restriction value', function() {
      expect(config.validate('parameters', 'orientation', {device: "abc", os: "iOS", orientation: "portrait"})).to.be.true
    })

    it('should return false if "@restrict" rule is valid and input is such that the restriction rule is applicable and the input key to be restricted does not match "keyword" restriction value', function() {
      expect(config.validate('parameters', 'ieCompat', {browser: "Internet Explorer", browserVersion: "10", ieCompat: 11001})).to.be.false
    })

    it('should return true if "@restrict" rule is valid and input is such that the restriction rule is applicable and the input key to be restricted matches "keyword" restriction value', function() {
      expect(config.validate('parameters', 'ieCompat', {browser: "Internet Explorer", browserVersion: "10", ieCompat: false})).to.be.true
    })

    it('should return true if "@restrict" rule with a multi-level "@if" statement is valid and input is such that the restriction rule is not applicable', function() {
      expect(config.validate('parameters', 'seleniumVersion_1', {browser: "Chrome", os: "OS X", seleniumVersion_1: "3.0.0"})).to.be.true
    })

    it('should return true if "@restrict" rule with a multi-level "@if" statement is valid and input is such that the restriction rule is not applicable', function() {
      expect(config.validate('parameters', 'seleniumVersion_1', {browser: "Safari", os: "OS X", osVersion: "Sierra", browserVersion: "10.0", seleniumVersion_1: "3.0.0"})).to.be.true
    })

    it('should return false if "@restrict" rule with a multi-level "@if" statement is valid and input is such that the restriction rule applies but provided value does not pass the restriction condition', function() {
      expect(config.validate('parameters', 'seleniumVersion_1', {browser: "Safari", os: "OS X", osVersion: "Yosemite", browserVersion: "9.0", seleniumVersion_1: "3.0.0"})).to.be.false
    })

    it('should return true if "@restrict" rule with a multi-level "@if" statement is valid and input is such that the restriction rule applies and provided value passes the restriction condition', function() {
      expect(config.validate('parameters', 'seleniumVersion_1', {browser: "Safari", os: "OS X", osVersion: "Yosemite", browserVersion: "9.0", seleniumVersion_1: "2.40.0"})).to.be.true
    })

  })

})
