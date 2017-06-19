**Due to a bug in package.json, the server.js file does not exist in v0.1.1 and tests would not work. Please use v0.1.2+ that fixes the issue**

[![Build Status](https://travis-ci.org/cross-browser-tests-runner/cross-browser-tests-runner.svg?branch=master)](https://travis-ci.org/cross-browser-tests-runner/cross-browser-tests-runner) [![CircleCI](https://circleci.com/gh/cross-browser-tests-runner/cross-browser-tests-runner/tree/master.svg?style=shield)](https://circleci.com/gh/cross-browser-tests-runner/cross-browser-tests-runner/tree/master) [![Build status](https://ci.appveyor.com/api/projects/status/c6is6otj3afjnybj?svg=true)](https://ci.appveyor.com/project/reeteshranjan/cross-browser-tests-runner) [![codecov](https://codecov.io/gh/cross-browser-tests-runner/cross-browser-tests-runner/branch/master/graph/badge.svg)](https://codecov.io/gh/cross-browser-tests-runner/cross-browser-tests-runner) [![Coverage Status](https://coveralls.io/repos/github/cross-browser-tests-runner/cross-browser-tests-runner/badge.svg?branch=master)](https://coveralls.io/github/cross-browser-tests-runner/cross-browser-tests-runner?branch=master) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/cross-browser-tests-runner/cross-browser-tests-runner/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/cross-browser-tests-runner/cross-browser-tests-runner/?branch=master) [![Code Climate](https://codeclimate.com/github/cross-browser-tests-runner/cross-browser-tests-runner.svg)](https://codeclimate.com/github/cross-browser-tests-runner/cross-browser-tests-runner) [![bitHound Code](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/badges/code.svg)](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner) [![bitHound Dependencies](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/badges/dependencies.svg)](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/master/dependencies/npm) [![bitHound Dev Dependencies](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/badges/devDependencies.svg)](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/master/dependencies/npm) [![npm](https://img.shields.io/npm/v/cross-browser-tests-runner.svg)](https://www.npmjs.com/package/cross-browser-tests-runner)
# cross-browser-tests-runner
Helps you perform cross-browser javascript testing using multiple cross-browser testing platforms, runners and frameworks seamlessly.
## How does it help?
### Uniform Interface, Minimum Configuration
- Each cross-browser testing platform comes with their own design of how they specify browser, os etc. and other capabilities
- Each test runner comes with their own ways to specify launchers and configuration syntax
- Here you specify test browsers in a smart and compact format and use utilities to generate the settings for different platforms and runners
### Integration & Abstraction of Platforms & Runners
- BrowserStack local testing using tunnels gets involved in terms of things like how tunnels with and without ID co-exist together, errors thrown in various stress/boundary conditions by tunnels and test workers etc. All the knowledge acquired around platform internals through thorough testing is abstracted into a robust design underneath an easy-to-use interface.
- Several pieces of fragmented work for integrating cross-browser platforms with different runners exist (and some integrations do not exist yet). This tool aims to be a single-stop solution to cut the effort needed to learn and use multiple tools.
- As more platforms and runners are integrated, this tool would help save the effort spent on above.
## Support Status
Cross-browser Testing Platform | Testem ^1.16.2 | Yeti | Karma | Intern
-|-|-|-|-
BrowserStack | [v0.1.2+](#v012) | | |
SauceLabs | | | |
TestingBot | | | |
crossbrowserstesting.com | | | |
## Installation
```
npm install cross-browser-tests-runner
```
## Quick Start
### Testem
Create `testem.json` in your project's root directory with `src_files` (or `test_page`) and `framework` (if required) settings.
#### BrowserStack
```
export BROWSERSTACK_USERNAME=<your-browserstack-username>
export BROWSERSTACK_ACCESS_KEY=<your-browserstack-access-key>
./node_modules/.bin/cbtr-quick-start -p browserstack -r testem
cd ./node_modules/cross-browsers-tests-runner/ && npm start
```
In another terminal:
```
testem ci
```
## Getting Started - Step by Step
### Environment Variables
#### BrowserStack
Set `BROWSERSTACK_ACCESS_KEY` and `BROWSERSTACK_USERNAME` environment variables.
### Update Supported Browsers
#### BrowserStack
```
./node_modules/.bin/cbtr-browserstack-update
```
This updates `./node_modules/cross-browser-tests-runner/conf/browserstack-conf.json`. A copy of this file is provided in the package.
### Select Browsers
#### BrowserStack
Copy `./node_modules/cross-browser-tests-runner/samples/.cbtr-browsers-browserstack.yml` to `.cbtr-browsers.yml` in your project's root directory.
The above is a sample to help you get started quickly as well as understand the process. Eventually, you'll write your own.

More: [.cbtr-browsers.yml](#cbtr-browsersyml).
### Generate Settings
```
./node_modules/.bin/cbtr-init
```
This would create `cbtr.json` in your project's root directory, based on the information in `.cbtr-browsers.yml`.

More: [cbtr.json](#cbtrjson), [cbtr-init](#cbtr-init).
### Generate Runner Config
#### Testem
##### BrowserStack
```
./node_modules/.bin/cbtr-testem-browserstack-init
```
This would create or update existing `testem.json` in your project's root directory.
> It overwrites `launchers` and `launch_in_ci` settings. Any other settings specified in existing `testem.json` would be untouched.

More: [cbtr-testem-browserstack-init](#cbtr-testem-browserstack-init).
### Start Server
```
cd ./node_modules/cross-browser-tests-runner && npm start
```
More: [server](#server).
### Done! Run Tests
#### Testem
```
testem ci
```
## Configuration Files
### .cbtr-browsers.yml
#### Format
```
BrowserStack:
  JS:
    Windows:
      "7":
        Chrome:
        - 16.0-32.0
        - "43.0"
    iOS:
      "6.0":
        Mobile Safari:
          - "iPad 3rd (6.0)"
          - "iPhone 4S (6.0)"          
```
##### Level 1 - Platform
Currently supported values: `BrowserStack`.
##### Level 2 - Testing Category
Javascript Unit Testing and Selenium Web Driver based testing would be supported by this tool. Currently supported value: `JS`. This matters as platforms like BrowserStack provide different browsers for JS testing and Selenium testing.
##### Level 3 - Operating System
Supported values can be found in `./node_modules/cross-browser-tests-runner/conf/cbtr-conf.json`
##### Level 4 - Operating System Version
Supported values can be found in `./node_modules/cross-browser-tests-runner/conf/cbtr-conf.json`.
> Please use double quotes around numeric values.
##### Level 5 - Browser Name
Supported values can be found in `./node_modules/cross-browser-tests-runner/conf/cbtr-conf.json`.
##### Level 6 - Browser Version/Device
A compact range format of browser versions can be used as shown in the above sample.
> Please use double quotes around numeric values.
###### BrowserStack
For desktop operating systems: browser version needs to be specified. For mobile operting systems: device needs to be specified. Supported values can be found in `./node_modules/cross-browser-tests-runner/conf/browserstack-conf.json`.
#### Multiple Files
Multiple files with browsers can be created and with any file name.

See [cbtr-init](#cbtr-init) to know how to use such a file not in project's root directory or not named `.cbtr-browsers.yml`.
#### Samples
`./node_modules/cross-browser-tests-runner/samples/.cbtr-browsers*.yml`
### cbtr.json
#### Format
```
{
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
          "os": "Windows",
          "osVersion": "7",
          "browser": "Chrome",
          "browserVersion": "33.0"
        },
        {
          "os": "Windows",
          "osVersion": "7",
          "browser": "Chrome",
          "browserVersion": "34.0"
        },
        {
          "os": "Windows",
          "osVersion": "7",
          "browser": "Chrome",
          "browserVersion": "35.0"
        },
        {
          "os": "Windows",
          "osVersion": "7",
          "browser": "Chrome",
          "browserVersion": "36.0"
        },
        {
          "os": "Windows",
          "osVersion": "7",
          "browser": "Chrome",
          "browserVersion": "23.0"
        },
        {
          "os": "iOS",
          "osVersion": "6.0",
          "browser": "Mobile Safari",
          "browserVersion": null,
          "device": "iPad 3rd (6.0)"
        },
        {
          "os": "iOS",
          "osVersion": "6.0",
          "browser": "Mobile Safari",
          "browserVersion": null,
          "device": "iPhone 4S (6.0)"
        }
      ]
    }
  },
  "server": {
    "port": 7982,
    "host": "127.0.0.1"
  }
}
```
#### browsers setting
This section is typically generated using [cbtr-init](#cbtr-init).
#### server setting
This section provides the settings for cross-browser-tests-runner server. At this point, no changes should be required unless the default port `7982` is in use by some other process.
#### Multiple Files
Multiple files with cross-browser-tests-runner settings can be created and with any file name.

See [cbtr-init](#cbtr-init) to know how to create such files not in project root or not named `cbtr.json`.

See [cbtr-testem-browserstack-init](#cbtr-testem-browserstack-init), [server](#server) to know how to use such files not in project root or not named `cbtr.json` as input.
#### Samples
`./node_modules/cross-browser-tests-runner/samples/cbtr*.json`
## Utilities
### cbtr-init
```
./node_modules/.bin/cbtr-init [--help|-h] [--input|-i <browsers-yaml-file>] [--output|-o <cbtr-settings-file>]

Defaults:
 input             .cbtr-browsers.yml in project root
 output            cbtr.json in project root

Options:
 help              print this help
 input             input data of browsers to use in a compact format
 output            cross-browser-tests-runner settings file
```
### Testem
#### BrowserStack
##### cbtr-testem-browserstack-init
```
./node_modules/.bin/cbtr-testem-browserstack-init [--help|-h] [--input|-i <cbtr-settings-file>] [--output|-o <testem-settings-file>]

Defaults:
 input             cbtr.json in project root
 output            testem.json in project root

Options:
 help              print this help
 input             cross-browser-tests-runner settings file
 output            testem settings file
```
## Server
The cross-browser-tests-runner server helps creating and managing tests and their state. It can be started with: `cd ./node_modules/cross-browser-tests-runner && npm start` or `node ./node_modules/cross-browser-tests-runner/server.js`. It would keep running in foreground, and you can use PM2 to run it in background, or add '&' on Linux/OSX to move it to background.
```
server.js [--help|-h] [--config|-c <config-file>]

Defaults:
 config            cbtr.json in project root, or CBTR_SETTINGS env var

Options:
 help              print this help
 config            cross-browser-tests-runner settings file
```
## Debugging
Add `LOG_LEVEL=DEBUG` to any of the utilities/commands on Linux/OSX, or export `LOG_LEVEL` as an environment variable. For example:
```
LOG_LEVEL=DEBUG ./node_modules/.bin/cbtr-init
```
Supported logging levels: `DEBUG`, `INFO`, `WARN`, and `ERROR`, with `DEBUG` producing most verbose logging.

Default logging level: `ERROR`
## Releases
### Support Matrix
Version | Platform | Runner | Windows | OSX | Linux
-|-|-|-|-|-
0.1.1 | BrowserStack | Testem | node 6, 7<br>[Issue 1](https://github.com/cross-browser-tests-runner/cross-browser-tests-runner/issues/1) | node 4, 6, 7<br>[Issue 2](https://github.com/cross-browser-tests-runner/cross-browser-tests-runner/issues/2) | node 4-7
### Builds
Version | Windows | OSX | Linux
-|-|-|-
0.1.1 | [CI Build](https://ci.appveyor.com/project/reeteshranjan/cross-browser-tests-runner/build/1.0.42) | [CI Build](https://travis-ci.org/cross-browser-tests-runner/cross-browser-tests-runner/builds/244626494) | [CI Build](https://circleci.com/gh/cross-browser-tests-runner/cross-browser-tests-runner/154)
## Caveats & Limitations
Please check [Issues](https://github.com/cross-browser-tests-runner/cross-browser-tests-runner/issues)
## Change Log
### v0.1.2
- Fixed missing server.js and other issues in [Issue 3](https://github.com/cross-browser-tests-runner/cross-browser-tests-runner/issues/3)
### v0.1.1
- Interfaces and factories: cross-browser testing platforms behavior, continuous integration platforms behavior
- Reusable set of core classes
- Implementation of platform interfaces for BrowserStack
- Implementation of continuous integration interfaces for Travis, CircleCI and Appveyor
- Express server with hierarchy of router plugins. Manages and performs tests using platform factory.
- Testem integration with BrowserStack using testem server router and testem config hook applications
- Utilities that help a user get started with cross-browser testing fast
- Exhaustive unit, integration and functional tests infrastructure with Linux, OSX and Windows CI setups and integration with code coverage and quality platforms
