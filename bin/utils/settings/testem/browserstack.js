#!/usr/bin/env node

'use strict'

let
  path = require('path'),
  uuid = require('uuid/v4'),
  Bluebird = require('bluebird'),
  uuidv4 = require('uuid/v4'),
  fs = Bluebird.promisifyAll(require('fs')),
  readline = Bluebird.promisifyAll(require('readline').createInterface({input:process.stdin, output:process.stdout})),
  Log = require('./../../../../lib/core/log').Log,
  log = new Log(process.env.LOG_LEVEL || 'ERROR', 'Utils.Settings.Testem.BrowserStack'),
  args = require('minimist')(process.argv.slice(2), {alias: {input: 'i', output: 'o'}}),
  aliases = require('./../../../../conf/browserstack-conf.json').Aliases,
  inputFile = args.input || path.resolve(process.cwd(), "cbtr.json"),
  outputFile = args.output || path.resolve(process.cwd(), "testem.json"),
  input = require(inputFile),
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
  /* eslint-disable global-require */
  output = require(outputFile)
  /* eslint-enable global-require */
  log.debug('existing testem config %s', JSON.stringify(output))
}

if(!input.browsers || !input.browsers.BrowserStack) {
  console.error("\x1b[31m", 'No browsers defined for BrowserStack platform in', inputFile, "\x1b[0m")
  /* eslint-disable no-process-exit */
  process.exit(1)
  /* eslint-enable no-process-exit */
}

input = input.browsers.BrowserStack

let answers = {
  multiple: false,
  screenshots: false,
  video: false
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
      .join('_').replace(/ /g, '_').replace(/[()]/g, '')
    output.launchers[name] = {
      exe: "node",
      args: [
        pathPfx + "cbtr-testem-browserstack-browser",
        "--local",
        "--os", aliases['Operating Systems'][launcher.os] || launcher.os,
        "--osVersion", launcher.osVersion,
        "--browser", aliases['Browsers'][launcher.browser] || launcher.browser
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
