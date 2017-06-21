**v0.1.1, v0.1.2 npm versions have been deprecated due to being unstable**

[![Build Status](https://travis-ci.org/cross-browser-tests-runner/cross-browser-tests-runner.svg?branch=master)](https://travis-ci.org/cross-browser-tests-runner/cross-browser-tests-runner) [![CircleCI](https://circleci.com/gh/cross-browser-tests-runner/cross-browser-tests-runner/tree/master.svg?style=shield)](https://circleci.com/gh/cross-browser-tests-runner/cross-browser-tests-runner/tree/master) [![Build status](https://ci.appveyor.com/api/projects/status/c6is6otj3afjnybj?svg=true)](https://ci.appveyor.com/project/reeteshranjan/cross-browser-tests-runner) [![codecov](https://codecov.io/gh/cross-browser-tests-runner/cross-browser-tests-runner/branch/master/graph/badge.svg)](https://codecov.io/gh/cross-browser-tests-runner/cross-browser-tests-runner) [![Coverage Status](https://coveralls.io/repos/github/cross-browser-tests-runner/cross-browser-tests-runner/badge.svg?branch=master)](https://coveralls.io/github/cross-browser-tests-runner/cross-browser-tests-runner?branch=master) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/cross-browser-tests-runner/cross-browser-tests-runner/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/cross-browser-tests-runner/cross-browser-tests-runner/?branch=master) [![Code Climate](https://codeclimate.com/github/cross-browser-tests-runner/cross-browser-tests-runner.svg)](https://codeclimate.com/github/cross-browser-tests-runner/cross-browser-tests-runner) [![bitHound Code](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/badges/code.svg)](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner) [![bitHound Dependencies](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/badges/dependencies.svg)](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/master/dependencies/npm) [![bitHound Dev Dependencies](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/badges/devDependencies.svg)](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/master/dependencies/npm) [![npm](https://img.shields.io/npm/v/cross-browser-tests-runner.svg)](https://www.npmjs.com/package/cross-browser-tests-runner)
# cross-browser-tests-runner
Helps you perform cross-browser javascript testing using multiple cross-browser testing platforms, runners and frameworks seamlessly.
## How does it help?
### Issues with cross-browser testing
- Diversity & Lack of Standardization
    - Each cross-browser testing platform provides different APIs/interface, different browser/capabilities specification syntax, and different local testing tunneling solutions
    - Each unit test runner has its own configuration syntax and aspects
- Cross-browser testing platform integration with unit test runners
    - Unit test runners do not natively extend to/intergate with cross-browser testing platforms
    - Several fragmented works of integrating different runners with different platforms exist, one separate tool per integration
- Management
    - Tests that need multiple browsers need to be managed manually when support for browsers changes in a platform, and it's often that each cross-browser testing platform updates their browser cloud 
    - With extremely verbose syntax for launchers/browsers used by unit test runners, significant manual effort may be needed to manage the set of test browsers that involves getting the updated browsers list through APIs or support pages and manually changing test runner configuration
### Solutions provided
- Utilities to update a platform's supported browsers set
- A smart and compact format to describe the test browsers
- Utilities to generate test runner configuration using input written in the above format verified against updated set of supported browsers
- Easy-to-use and well-tested cross-browser platform-test runner integrations supported across Windows, Linux and OSX.
    - BrowserStack local testing and testing APIs have involved details e.g. how do tunnels with and without ID co-exist, what errors test worker APIs throw in different conditions and the actual behavior is not well-documented. The implementation is based on experience/knowledge acquired through exhaustive testing around such internal aspects.
## Support Status
Cross-browser Testing Platform | Testem ^1.16.2 | Yeti | Karma | Intern
-|-|-|-|-
BrowserStack | [v0.1.3+](#v013) | | |
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
The utility would ask you the following questions:

- Are you using multiple tunnels with different identifiers? (y/n) [If unsure, choose "n"]
    - BrowserStack supports multiple tunnels with different identifiers as well as a single tunnel without any id. If your tests need multiple tunnels, choose 'y', or else 'n'. The tool would generate tunnel IDs in case you chose 'y'.
- Do you need to take screenshots of your tests once completed? (y/n)
- Do you need to take video of your test? (y/n)
    - Some browsers may not support taking a video, and this behavior is pretty dynamic. So you need to experiment and figure out for yourself.
- Please provide a timeout value [60]
    - Minimum timeout on BrowserStack has to be 60 seconds.

## Server
The cross-browser-tests-runner server helps creating and managing tests and their state. It can be started with: `cd ./node_modules/cross-browser-tests-runner && npm start` or `node ./node_modules/cross-browser-tests-runner/server.js`. It would keep running in foreground, and you can use PM2 to run it in background, or add '&' on Linux/OSX to move it to background.
```
./node_modules/cross-browser-tests-runner/server.js [--help|-h] [--config|-c <config-file>]

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
Supported logging levels: DEBUG, INFO, WARN, and ERROR, with DEBUG producing most verbose logging.

Default logging level: `ERROR`
## Releases
### Support Matrix
Version | Platform | Runner | Windows | OSX | Linux
-|-|-|-|-|-
0.1.3 | BrowserStack | Testem | node 6, 7<br>[Issue 1](https://github.com/cross-browser-tests-runner/cross-browser-tests-runner/issues/1) | node 4, 6, 7<br>[Issue 2](https://github.com/cross-browser-tests-runner/cross-browser-tests-runner/issues/2) | node 4-7
### Deprecated
- v0.1.1-v0.1.2
## Caveats & Limitations
Please check [Issues](https://github.com/cross-browser-tests-runner/cross-browser-tests-runner/issues)
## Change Log
### v0.1.4
- The utility cbtr-testem-browserstack-init now allows specifying BrowserStack browser timeout capability
### v0.1.3
- The OSX specific BrowserStackLocal got added to npm package. Removed it. Things otherwise would have worked only on OSX.
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
