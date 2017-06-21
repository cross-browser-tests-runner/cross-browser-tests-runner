#!/usr/bin/env node

'use strict'

const
  allowedOptions = [ 'input', 'output', 'help' ]

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
  uuid = require('uuid/v4'),
  Bluebird = require('bluebird'),
  uuidv4 = require('uuid/v4'),
  fs = Bluebird.promisifyAll(require('fs')),
  readline = Bluebird.promisifyAll(require('readline').createInterface({input:process.stdin, output:process.stdout})),
  Log = require('./../../../../lib/core/log').Log,
  log = new Log(process.env.LOG_LEVEL || 'ERROR', 'Utils.Settings.Testem.BrowserStack'),
  aliases = require('./../../../../conf/browserstack-conf.json').Aliases,
  inputFile = args.input || path.resolve(process.cwd(), "cbtr.json"),
  outputFile = args.output || path.resolve(process.cwd(), "testem.json"),
  input = JSON.parse(fs.readFileSync(inputFile, 'utf8')),
  output = { }

const swap = obj => {
  let ret = { }
  Object.keys(obj).forEach(key => {
    ret[obj[key]] = key
  })
  return ret
}

aliases['Operating Systems'] = swap(aliases['Operating Systems'])
aliases['Browsers'] = swap(aliases['Browsers'])

if(fs.existsSync(outputFile)) {
  output = JSON.parse(fs.readFileSync(outputFile, 'utf8'))
  log.debug('existing testem config %s', JSON.stringify(output))
}

if(!input.browsers || !input.browsers.BrowserStack || !input.browsers.BrowserStack.JS) {
  throw new Error('No browsers defined for JS testing using BrowserStack in ' + inputFile)
}

input = input.browsers.BrowserStack

let answers = {
  multiple: false,
  screenshots: false,
  video: false,
  timeout: 60
}

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
  main()
})

const pathPfx = './node_modules/.bin/'

function main() {
  log.debug('user input: multiple tunnels? - %s, screenshots? - %s, video? - %s', answers.multiple, answers.screenshots, answers.video)

  output.on_start = {
    command: "node " + pathPfx + "cbtr-testem-browserstack-open --local",
    wait_for_text: "opened testem/browserstack",
    wait_for_text_timeout: 60000
  }

  output.on_exit = "node " + pathPfx + "cbtr-testem-browserstack-close"

  output.launchers = { }

  input.JS.forEach(launcher => {
    let name =
      [launcher.os, launcher.osVersion, launcher.browser, launcher.browserVersion || launcher.device ]
      .join('_').replace(/[ \.]/g, '_').replace(/[()]/g, '')
    output.launchers[name] = {
      exe: "node",
      args: [
        pathPfx + "cbtr-testem-browserstack-browser",
        "--local",
        "--os", aliases['Operating Systems'][launcher.os] || launcher.os,
        "--osVersion", launcher.osVersion,
        "--browser", aliases['Browsers'][launcher.browser] || launcher.browser,
        "--timeout", answers.timeout
      ],
      protocol: "browser"
    };
    ['browserVersion', 'devide'].forEach(attr => {
      if(launcher[attr]) {
        output.launchers[name].args.push("--" + attr, launcher[attr])
      }
    });
    ['screenshots', 'video'].forEach(attr => {
      if(answers[attr]) {
        output.launchers[name].args.push("--" + attr)
      }
    })
    if(answers.multiple) {
      output.launchers[name].args.push("--localIdentifier", uuidv4())
    }
  })

  output.launch_in_ci = Object.keys(output.launchers)

  log.debug('testem.json contents %s', JSON.stringify(output))

  fs.writeFileAsync(outputFile, JSON.stringify(output, null, 2))
  .then(() => {
    console.log('wrote testem settings in %s', outputFile)
  })
  .catch(err => {
    console.error("\x1b[31m", err.message, "\x1b[0m")
  })
}
