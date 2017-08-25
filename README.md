[![Build Status](https://travis-ci.org/cross-browser-tests-runner/cross-browser-tests-runner.svg?branch=master)](https://travis-ci.org/cross-browser-tests-runner/cross-browser-tests-runner) [![Build status](https://ci.appveyor.com/api/projects/status/c6is6otj3afjnybj?svg=true)](https://ci.appveyor.com/project/reeteshranjan/cross-browser-tests-runner) [![codecov](https://codecov.io/gh/cross-browser-tests-runner/cross-browser-tests-runner/branch/master/graph/badge.svg)](https://codecov.io/gh/cross-browser-tests-runner/cross-browser-tests-runner) [![Coverage Status](https://coveralls.io/repos/github/cross-browser-tests-runner/cross-browser-tests-runner/badge.svg?branch=master)](https://coveralls.io/github/cross-browser-tests-runner/cross-browser-tests-runner?branch=master) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/cross-browser-tests-runner/cross-browser-tests-runner/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/cross-browser-tests-runner/cross-browser-tests-runner/?branch=master) [![Code Climate](https://codeclimate.com/github/cross-browser-tests-runner/cross-browser-tests-runner.svg)](https://codeclimate.com/github/cross-browser-tests-runner/cross-browser-tests-runner) [![bitHound Dependencies](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/badges/dependencies.svg)](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/master/dependencies/npm) [![bitHound Dev Dependencies](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/badges/devDependencies.svg)](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/master/dependencies/npm) [![npm version](https://badge.fury.io/js/cross-browser-tests-runner.svg)](https://badge.fury.io/js/cross-browser-tests-runner) [![npm downloads](https://img.shields.io/npm/dt/cross-browser-tests-runner.svg)](https://www.npmjs.com/package/cross-browser-tests-runner)

# cross-browser-tests-runner
One tool to do cross-browser testing across multiple cross-browser testing platforms, runners and frameworks.

## Installation
```bash
$ npm install cross-browser-tests-runner
```
## Quick Start
### Selenium Tests
#### BrowserStack
> This would run 2 tests in your BrowserStack account.
```bash
$ export BROWSERSTACK_USERNAME=<your-browserstack-username>
$ export BROWSERSTACK_ACCESS_KEY=<your-browserstack-access-key>
$ cp -r ./node_modules/cross-browser-tests-runner/samples/ samples/
$ ./node_modules/.bin/cbtr-server --native-runner --config ./samples/cbtr-browserstack-selenium.json
```
### JS Tests
#### BrowserStack with Native Runner
> This would run 4 tests (2 tests x 2 browsers) in your BrowserStack account.
```bash
$ export BROWSERSTACK_USERNAME=<your-browserstack-username>
$ export BROWSERSTACK_ACCESS_KEY=<your-browserstack-access-key>
$ cp -r ./node_modules/cross-browser-tests-runner/samples/ samples/
$ ./node_modules/.bin/cbtr-server --native-runner --config ./samples/cbtr-browserstack-js-testing.json
```
#### BrowserStack with Testem
> You need to have a `testem.json` with `src_files` or `test_page` setting.
```bash
$ export BROWSERSTACK_USERNAME=<your-browserstack-username>
$ export BROWSERSTACK_ACCESS_KEY=<your-browserstack-access-key>
$ ./node_modules/.bin/cbtr-quick-start -p browserstack -r testem
$ ./node_modules/.bin/cbtr-server &
$ testem ci
```
## Status
### Platform-Runner Integrations
Cross-browser Testing Platform|Native Runner - JS Testing|Native Runner - Selenium|Testem 1.16.2+
-|-|-|-
BrowserStack|v0.2.0+|v0.3.0+|v0.1.3+
### JS Unit Test Frameworks supported by Native Runner
Unit Testing Framework|Package Version
-|-
Jasmine 1.x|v0.2.0+
### Operating Systems and Node Versions
Node version|Linux|Mac OSX|Windows
-|-|-|-
4.2.0|[6](https://github.com/cross-browser-tests-runner/cross-browser-tests-runner/issues/6)|✓|✓
4.8.4|✓|✓|✓
5.0.0|[6](https://github.com/cross-browser-tests-runner/cross-browser-tests-runner/issues/6)|✓|✓
5.12.0|[7](https://github.com/cross-browser-tests-runner/cross-browser-tests-runner/issues/7)|[7](https://github.com/cross-browser-tests-runner/cross-browser-tests-runner/issues/7)|✓
6.9.0|✓|✓|✓
6.11.2|✓|✓|✓
7.0.0|✓|✓|✓
7.10.1|✓|✓|✓
8.0.0|✓|✓|✓
8.4.0|✓|✓|✓

## Getting Started - Step by Step
### JS Testing with BrowserStack using Native Runner
Complete the steps in [BrowserStack Common Steps](#testing-with-browserstack).

Add [framework](#framework) and [test_file](#test_file) settings in [cbtr.json](#cbtrjson). Then run the server as follows:
```bash
$ ./node_modules/.bin/cbtr-server --native-runner [--config cbtr.json]
```
This would run all your tests and exit once completed.
### Selenium Testing with BrowserStack using Native Runner
Complete the steps in [BrowserStack Common Steps](#testing-with-browserstack).

Add [test_file](#test_file) and [test_script](#test_script) settings in [cbtr.json](#cbtrjson). Then run the server as follows:
```bash
$ ./node_modules/.bin/cbtr-server --native-runner [--config cbtr.json]
```
This would run all your tests and exit once completed.
### JS Testing with BrowserStack using Testem
Complete the steps in [BrowserStack Common Steps](#testing-with-browserstack).

Generate the Testem configuration file `testem.json` using [cbtr-testem-browserstack-init](#cbtr-testem-browserstack-init). It would overwrite `launchers` and `launch_in_ci` settings if present already.
```bash
$ ./node_modules/.bin/cbtr-testem-browserstack-init [--input cbtr.json] [--output testem.json]
```
Run the cross-browser-tests-runner [server](#server).
```bash
$ ./node_modules/.bin/cbtr-server &
```
Run testem in CI mode.
```bash
$ testem ci
```
### Common Steps
#### Testing with BrowserStack
Export BrowserStack access key and user name environment variables
```bash
$ export BROWSERSTACK_USERNAME=<your-browserstack-username>
$ export BROWSERSTACK_ACCESS_KEY=<your-browserstack-access-key>
```
(Optional) Update the BrowserStack's supported browsers configuration using [cbtr-browserstack-update](#cbtr-browserstack-update).
```bash
$ ./node_modules/.bin/cbtr-browserstack-update
```
Enter the browsers for your test into [.cbtr-browsers.yml](#cbtr-browsersyml), or you can copy the sample file `./node_modules/cross-browser-tests-runner/samples/.cbtr-browsers-browserstack.yml` to quickly complete these steps.
```bash
$ cp ./node_modules/cross-browser-tests-runner/samples/.cbtr-browsers-browserstack.yml .cbtr-browsers.yml
```
Generate the cross-browser-tests-runner configuration file [cbtr.json](#cbtrjson) using [cbtr-init](#cbtr-init).
```bash
$ ./node_modules/.bin/cbtr-init [--input .cbtr-browsers.yml] [--output cbtr.json]
```
## Debugging
Add `LOG_LEVEL=DEBUG` to any of the utilities/commands on Linux/OSX, or export `LOG_LEVEL` as an environment variable. For example:
```bash
$ LOG_LEVEL=DEBUG ./node_modules/.bin/cbtr-init
```
Supported logging levels: DEBUG, INFO, WARN, and ERROR, with DEBUG producing most verbose logging.

Default logging level: `ERROR`
## Server
The cross-browser-tests-runner server helps creating and managing tests and their state.
### As Native Runner
```bash
$ ./node_modules/.bin/cbtr-server --native-runner [--config path/to/cbtr.json]
```
In following cases the server runs all tests and exits once completed:
- JS testing browsers and [test_file](#test_file) settings are provided in input [cbtr.json](#cbtrjson)
- Selenium testing browsers, [test_file](#test_file), and [test_script](#test_script) settings are provided in input [cbtr.json](#cbtrjson)

If none of the above conditions are met with, it would keep running, listening on the specified/default port in the config, and this mode can be used to debug/test using a local browser. For example, if the server is listening on `7982` port on host `127.0.0.1`, and a test file `tests.html` exists at root of your project/repository, the following URL can be opened in a local browser: `http://127.0.0.1:7982/tests.html`.

### For Other Runners
```bash
$ ./node_modules/.bin/cbtr-server
```
It would keep running in foreground, waiting for tests to be run by the test runner used e.g. Testem.
### Usage
```bash
$ ./node_modules/.bin/cbtr-server [--help|-h] [--config|-c <config-file>] [--native-runner|-n] [--errors-only|-e] [--omit-traces|-o]

Defaults:
 config            cbtr.json in project root, or CBTR_SETTINGS env var
 native-runner     false
 errors-only       false
 omit-traces       false

Options:
 help              print this help
 config            cross-browser-tests-runner settings file
 native-runner     if the server should work as native test runner
 errors-only       (native runner only) print only the specs that failed
 omit-traces       (native runner only) print only the error message and no stack traces
```
## Native Runner
The native test runner was included to provide easy [Code Coverage](#code-coverage) and [Failover](#failover) mechanism to counter different issues observed while building this tool, which were not possible to solve using third party runners/tools. It performs both JS and Selenium testing.
### Test HTML Format
A test HTML file used in testing with native runner needs to be in a specified format.
#### For Jasmine 1.x
Use the following sample and replace the annotated lines in the sample with your source and test javascript files.
```html
<!doctype html>
<html>
<head>
  <title>Cross Browser Tests Runner</title>
  <script src="//cdnjs.cloudflare.com/ajax/libs/jasmine/1.3.1/jasmine.js"></script>
  <script src="//cdnjs.cloudflare.com/ajax/libs/jasmine/1.3.1/jasmine-html.js"></script>
  <script src="/cross-browser-tests-runner.js"></script>
  <script>
    (function() {
      var jasmineEnv = jasmine.getEnv();
      jasmineEnv.addReporter(new jasmine.HtmlReporter);
      window.onload = function() {
        jasmineEnv.execute();
      }
    })()
  </script>
  <!-- start of app and test code -->
  <script src="../../js/src/app.js"></script>
  <script src="../../js/tests/jasmine/test.js"></script>
  <!-- end of app and test code -->
  <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/jasmine/1.3.1/jasmine.css">
</head>
<body>
  <div id="jasmine_content"></div>
</body>
</html>
```
### Test Script Contents
```javascript
'use strict'

exports.script = (driver, webdriver) => {
  return driver.findElement({id: 'test-message'})
  .then(el => {
    return el.getText()
  })
  .then(text => {
    console.log('Selenium Test Script: text of #test-message %s', text)
    return true
  })
}

exports.decider = (driver, webdriver) => {
  return Promise.resolve(true)
}
```
Above is an example Selenium test script. It exports two functions as shown above:
- `script` **required**: This implements the test script functionality.
- `decider` *optional*: This decides whether the test succeeded or failed.

Arguments provided to both functions:
- `driver`: This is the thenable web driver instance created by Builder. See [Selenium documentation](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_ThenableWebDriver.html).
- `webdriver`: This is the handle obtained with ```javascript require('selenium-webdriver')```

Both functions must return a `Promise` or `thenable`. See the [Selenium documentation](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_ThenableWebDriver.html).
### Code Coverage
If your JavaScript source is instrumented using a tool like Istanbul, the coverage data collected on the browser is automatically sent and stored into `coverage/` in your project's root, when using native runner. You can use Istanbul or any other compatible tool to generate lcov or other format reports, and upload to services like https://codecov.io, https://coveralls.io and others.
## Failover
### Platform tools instability
BrowserStack tunnels have been seen to die because of undocumented and unresolved issues. This messes up local testing as sometimes the tests cannot be loaded, or results cannot be sent back.

The BrowserStack platform code in cross-browser-tests-runner includes monitoring of tunnel processes and restarts any that die.
### Test results reporting retries
Test results and code coverage data sending fails if tunnels die. As seen in above section, a mechanism of restarting tunnels is in place. This is exploited by a retry with exponential backoff mechanism used for reporting test results that maximises the possibility of reporting to reach the server.

Such behavior is possible with our own code that is "instrumented" in your tests runtime when using [native runner](#native-runner). It's not possible to have such behavior when using testem or other tools because they have their own instrumented code.
### Test retries
Sometimes, tests fail even with above mechanisms in place. In the case of [native nunner](#native-runner), a test retry mechanism has been put in place. The number of retries can be controlled through [cbtr.json](#cbtrjson). This has been seen to improve on test failures as well.
## Configuration
### .cbtr-browsers.yml
#### Format
```yml
BrowserStack:
  JS:
    Windows:
      7:
        Chrome:
          - 32.0-36.0
          - "23.0"
    iOS:
      "6.0":
        Mobile Safari:
          - "iPad 3rd (6.0)"
          - "iPhone 4S (6.0)"
  Selenium:
    Mac OSX:
      Lion:
        Firefox:
          - 23.0-31.0
          - "36.0"
    Android:
      "5.0":
        Android Browser Selenium:
          - "Google Nexus 5"
```
##### Level 1: Platform
Currently supported values: `BrowserStack`.
##### Level 2: Testing Category
Currently supported value: `JS`, and `Selenium`. This matters as platforms like BrowserStack provide different browsers for JS testing and Selenium testing.
##### Level 3: Operating System
Supported values can be found in `./node_modules/cross-browser-tests-runner/conf/cbtr-conf.json`.
##### Level 4: Operating System Version
Supported values can be found in `./node_modules/cross-browser-tests-runner/conf/cbtr-conf.json`.
> Please use double quotes around numeric values.
##### Level 5: Browser Name
Supported values can be found in `./node_modules/cross-browser-tests-runner/conf/cbtr-conf.json`.
##### Level 6: Browser Version/Device
A compact range format of browser versions can be used as shown in the above sample.
> Please use double quotes around numeric values.
###### BrowserStack
- For desktop operating systems: browser version needs to be specified.
- For mobile operting systems: device needs to be specified.
- Supported values can be found in `./node_modules/cross-browser-tests-runner/conf/browserstack-conf.json`.
#### Multiple Files
You can keep more than one file containing browsers configuration, if that suits your testing. See [cbtr-init](#cbtr-init).
#### Samples
`./node_modules/cross-browser-tests-runner/samples/.cbtr-browsers*.yml`
### cbtr.json
#### Format
```json
{
  "framework": "jasmine",
  "retries": 1,
  "limit": "4mb",
  "test_file": [
    "samples/native/tests/html/jasmine/tests.html",
    "samples/native/tests/html/jasmine/tests-cov.html"
  ],
  "test_script": "samples/native/scripts/script-1.js",
  "browsers": {
    "BrowserStack": {
      "JS": [
        {
          "os": "Windows",
          "osVersion": "7",
          "browser": "Chrome",
          "browserVersion": "32.0"
        },
        {
          "os": "iOS",
          "osVersion": "6.0",
          "browser": "Mobile Safari",
          "browserVersion": null,
          "device": "iPad 3rd (6.0)"
        }
      ],
      "Selenium": [
        {
          "os": "Mac OSX",
          "osVersion": "Mavericks",
          "browser": "Firefox",
          "browserVersion": "39.0"
        },
        {
          "os": "Android",
          "osVersion": "4.0",
          "browser": "Android Browser Selenium",
          "browserVersion": null,
          "device": "Motorola Razr"
        }
      ]
    }
  },
  "capabilities": {
    "BrowserStack": {
      "local": true,
      "localIdentifier": "tunnel-1",
      "screenshots": true,
      "timeout": 120
    }
  },
  "server": {
    "port": 7982,
    "host": "127.0.0.1"
  }
}
```
##### framework
Needed only if using native runner. Currently allowed values: `jasmine`.
##### retries
Needed only if using native runner. Number of retries to try for a failed test. Default is 0. See [Failover](#failover).
##### limit
Size limit of data (test reports) to accept. Default is "4mb".
##### test_file
Needed only if using native runner. A string or an array of strings - one per test html file. The path should be relative to root directory of your project/repository.

For JS testing, see [Test HTML Format](#test-html-format) to understand the required structure of the HTML test files.
##### test_script
Needed only if using native runner for Selenium testing. A string or an array of strings - one per test script file. The path should be relative to root directory of your project/repository.

See [Test Script Contents](#test-script-contents) to understand the required structure of the test script.
##### browsers
This section is generated by [cbtr-init](#cbtr-init) based on browsers specified in your [.cbtr-browsers.yml](#cbtr-browsersyml) file.
##### capabilities
This section is generated by [cbtr-init](#cbtr-init) based on browsers specified in your [.cbtr-browsers.yml](#cbtr-browsersyml) file with few default settings viz. `local`, `screenshots`, and `timeout`. Following capabilities are supported:

- `local`: `true` if performing local testing, else `false`
- `localIdentifier`: name of the tunnel identifier, a string
- `screenshots`: `true` if screenshots should be enabled, else `false`
- `video`: `true` if a video of the testing session should be captured, else `false`
- `timeout`: timeout for a browser/test session in seconds (**note**: BrowserStack has a minimum 60s timeout guideline)
- `project`: name/slug of your project (default: anonymous/anonymous)
- `build`: build id for your tests (default: git HEAD sha1)
- `test`: session id for all browser sessions in your tests (default: uuid)

For Travis and Appveyor environments, best values for the last 3 capabilities are guessed using the environment and you do not need to manually provide them.
##### server
This section provides the settings for cross-browser-tests-runner server. At this point, no changes should be required unless the default port `7982` is in use by some other process.
#### Multiple Files
You can keep more than one file containing cross-browser-tests-runner server ettings, if that suits your testing. See [cbtr-init](#cbtr-init). See [cbtr-testem-browserstack-init](#cbtr-testem-browserstack-init), [Server Usage](#usage) to know how to use such files not in project root or not named `cbtr.json` as input.
#### Samples
`./node_modules/cross-browser-tests-runner/samples/cbtr*.json`
## Utilities
### cbtr-init
```bash
$ ./node_modules/.bin/cbtr-init [--help|-h] [--input|-i <browsers-yaml-file>] [--output|-o <cbtr-settings-file>]

Defaults:
 input             .cbtr-browsers.yml in project root
 output            cbtr.json in project root

Options:
 help              print this help
 input             input data of browsers to use in a compact format
 output            cross-browser-tests-runner settings file
```
### cbtr-testem-browserstack-init
```bash
$ ./node_modules/.bin/cbtr-testem-browserstack-init [--help|-h] [--input|-i <cbtr-settings-file>] [--output|-o <testem-settings-file>]

Defaults:
 input             cbtr.json in project root
 output            testem.json in project root

Options:
 help              print this help
 input             cross-browser-tests-runner settings file
 output            testem settings file
```
The utility would ask you the following questions:

- Are you using multiple tunnels with different identifiers? (y/n) [If unsure, choose "n"]
    - BrowserStack supports multiple tunnels with different identifiers as well as a single tunnel without any id. If your tests need multiple tunnels, choose 'y', or else 'n'. The tool would generate tunnel IDs in case you chose 'y'.
- Do you need to take screenshots of your tests once completed? (y/n)
- Do you need to take video of your test? (y/n)
    - Some browsers may not support taking a video, and this behavior is pretty dynamic. So you need to experiment and figure out for yourself.
- Please provide a timeout value [60]
    - Minimum timeout on BrowserStack has to be 60 seconds.
### cbtr-browserstack-update
```bash
$ ./node_modules/.bin/cbtr-browserstack-update
```
### cbtr-quick-start
```bash
$ ./node_modules/.bin/cbtr-quick-start [--help|-h] [--platform|-p <cross-browser platform>] [--runner|-o <tests-runner>]

Options:
 help              print this help
 platform          browserstack
 runner            testem
```
