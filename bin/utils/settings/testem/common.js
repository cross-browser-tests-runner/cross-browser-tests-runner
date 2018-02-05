'use strict'

const
  allowedOptions = [ 'input', 'output', 'help' ],
  pathPfx = './node_modules/.bin/',
  strCaps = ['browserVersion', 'device'],
  boolCaps = ['screenshots', 'video']

let
  path = require('path'),
  utils = require('./../../../utils'),
  args = utils.ioHelpArgs(allowedOptions, help)

function help() {
  console.log(
    '\n' +
    path.basename(process.argv[1]) +
    ' [--help|-h] [--input|-i <cbtr-settings-file>] [--output|-o <testem-settings-file>]\n\n' +
    'Defaults:\n' +
    ' input             cbtr.json in project root\n' +
    ' output            testem.json in project root\n\n' +
    'Options:\n' +
    ' help              print this help\n' +
    ' input             cross-browser-tests-runner settings file\n' +
    ' output            testem settings file'
  )
}

utils.handleHelp(args, help)

let
  uuidv4 = require('uuid/v4'),
  Bluebird = require('bluebird'),
  fs = Bluebird.promisifyAll(require('fs')),
  readline = Bluebird.promisifyAll(require('readline').createInterface({input:process.stdin, output:process.stdout})),
  Log = require('./../../../../lib/core/log').Log,
  log = new Log('Utils.Settings.Testem.Common'),
  inputFile = args.input || path.resolve(process.cwd(), "cbtr.json"),
  outputFile = args.output || path.resolve(process.cwd(), "testem.json"),
  input = JSON.parse(fs.readFileSync(inputFile, 'utf8')),
  output = { },
  answers = {
    multiple: false,
    screenshots: false,
    video: false,
    timeout: 60
  }

function readExistingOutput() {
  if(fs.existsSync(outputFile)) {
    output = JSON.parse(fs.readFileSync(outputFile, 'utf8'))
    log.debug('existing testem config %s', JSON.stringify(output))
  }
}

function verifyInput(platform) {
  if(!input.browsers || !input.browsers[platform] || !input.browsers[platform].JS) {
    throw new Error('No browsers defined for JS testing using ' + platform + ' in ' + inputFile)
  }
}

function genConfig(platform) {
  let platformLc = platform.toLowerCase()
  log.debug('user input: multiple tunnels? - %s, screenshots? - %s, video? - %s', answers.multiple, answers.screenshots, answers.video)
  initOutput(platformLc)
  input.browsers[platform].JS.forEach(launcher => {
    let name = getLauncherName(launcher)
    output.launchers[name] = getLauncherCore(launcher, platform, platformLc)
    strCaps.forEach(attr => {
      if(launcher[attr]) {
        output.launchers[name].args.push("--" + attr, launcher[attr])
      }
    })
    boolCaps.forEach(attr => {
      if(answers[attr]) {
        output.launchers[name].args.push("--" + attr)
      }
    })
    if(answers.multiple) {
      output.launchers[name].args.push("--localIdentifier", uuidv4())
    }
  })
  output.launch_in_ci = Object.keys(output.launchers)
  writeOutput()
}

function initOutput(platformLc) {
  output.on_start = {
    command: "node " + pathPfx + "cbtr-testem-" + platformLc + "-open --local",
    wait_for_text: "opened testem/" + platformLc,
    wait_for_text_timeout: 60000
  }
  output.on_exit = "node " + pathPfx + "cbtr-testem-" + platformLc + "-close"
  output.launchers = { }
}

function getLauncherName(launcher) {
  return [launcher.os, launcher.osVersion, launcher.browser, launcher.browserVersion || launcher.device ].join('_').replace(/[ \.]/g, '_').replace(/[()]/g, '')
}

function getLauncherCore(launcher, platform, platformLc) {
  let ret = {
    exe: "node",
    args: [
      pathPfx + "cbtr-testem-" + platformLc + "-browser",
      "--local",
      "--os", launcher.os,
      "--osVersion", launcher.osVersion,
      "--browser", launcher.browser,
      "--timeout", answers.timeout
    ],
    protocol: "browser"
  }
  if('SauceLabs' === platform) {
    ret.args.push("--framework")
    ret.args.push(input.capabilities.SauceLabs.framework)
  }
  return ret
}

function writeOutput() {
  log.debug('testem.json contents %s', JSON.stringify(output))
  fs.writeFileAsync(outputFile, JSON.stringify(output, null, 2))
  .then(() => {
    console.log('wrote testem settings in %s', outputFile)
  })
}

function getAnswers(platform, callback) {
  readline.questionAsync('Are you using multiple tunnels with different identifiers? (y/n) [If unsure, choose "n"] ')
  .catch(answer => {
    answers.multiple = answer.message.replace(/Error: /, '') === 'y' ? true : false
    return readline.questionAsync('Do you need to take screenshots of your tests once completed? (y/n) ')
  })
  .catch(answer => {
    answers.screenshots = answer.message.replace(/Error: /, '') === 'y' ? true : false
    return readline.questionAsync('Do you need to take video of your test? (y/n) ')
  })
  .catch(answer => {
    answers.video = answer.message.replace(/Error: /, '') === 'y' ? true : false
    return readline.questionAsync('Please provide a timeout value [60] ')
  })
  .catch(answer => {
    let timeout = parseInt(answer.message.replace(/Error: /, ''), 10)
    if(!isNaN(timeout) && timeout >= 60) {
      answers.timeout = timeout
    }
    readline.close()
    callback(platform)
  })
}

function main(platform) {
  readExistingOutput()
  verifyInput(platform)
  getAnswers(platform, genConfig)
}

exports.run = main
