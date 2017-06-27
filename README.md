[![Build Status](https://travis-ci.org/cross-browser-tests-runner/cross-browser-tests-runner.svg?branch=master)](https://travis-ci.org/cross-browser-tests-runner/cross-browser-tests-runner) [![CircleCI](https://circleci.com/gh/cross-browser-tests-runner/cross-browser-tests-runner/tree/master.svg?style=shield)](https://circleci.com/gh/cross-browser-tests-runner/cross-browser-tests-runner/tree/master) [![Build status](https://ci.appveyor.com/api/projects/status/c6is6otj3afjnybj?svg=true)](https://ci.appveyor.com/project/reeteshranjan/cross-browser-tests-runner) [![codecov](https://codecov.io/gh/cross-browser-tests-runner/cross-browser-tests-runner/branch/master/graph/badge.svg)](https://codecov.io/gh/cross-browser-tests-runner/cross-browser-tests-runner) [![Coverage Status](https://coveralls.io/repos/github/cross-browser-tests-runner/cross-browser-tests-runner/badge.svg?branch=master)](https://coveralls.io/github/cross-browser-tests-runner/cross-browser-tests-runner?branch=master) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/cross-browser-tests-runner/cross-browser-tests-runner/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/cross-browser-tests-runner/cross-browser-tests-runner/?branch=master) [![Code Climate](https://codeclimate.com/github/cross-browser-tests-runner/cross-browser-tests-runner.svg)](https://codeclimate.com/github/cross-browser-tests-runner/cross-browser-tests-runner) [![bitHound Code](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/badges/code.svg)](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner) [![bitHound Dependencies](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/badges/dependencies.svg)](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/master/dependencies/npm) [![bitHound Dev Dependencies](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/badges/devDependencies.svg)](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/master/dependencies/npm) [![npm](https://img.shields.io/npm/v/cross-browser-tests-runner.svg)](https://www.npmjs.com/package/cross-browser-tests-runner)
# cross-browser-tests-runner
Helps you perform cross-browser javascript testing using multiple cross-browser testing platforms, runners and frameworks seamlessly.
## What does it do?
- One tool, multiple cross-browser platforms (e.g. BrowserStack, SauceLabs, TestingBot, CrossBrowserTesting etc.) and test runners (e.g. Testem, Intern, Karma, Yeti etc.) integrations. See [Support Status](#support-status).
- Well tested runner-platform integrations. Exhaustive testing performed to understand documented and undocumented aspects of cross-browser platforms and test runners so your tests run smoothly using the integrations provided.
- A common browsers and capabilities syntax to describe your tests, which is converted into platform specific syntax using utilities. Save time understanding each platform's syntax.
- From tests written in common format, generate your test runner's configuration using utilities. Save time manually managing test runner configurations, which is typically significant if you use a large set of test browsers.
- A native test runner included that came out of limitations faced with existing runners. If you experienced what led to building it, here is the solution you need.
## Support Status
### Integrations
Cross-browser Testing Platform | Native Runner | Testem ^1.16.2 | Yeti | Karma | Intern
-|-|-|-|-|-
BrowserStack | [v0.2.0+](#v020) | [v0.1.3+](#v013) | | |
SauceLabs | | | | |
TestingBot | | | | |
crossbrowserstesting.com | | | | |
### Native Runner
Unit Testing Framework | Version
-|-
Jasmine 1.x | [v0.2.0+](#v020)
Jasmine 2.x |
Mocha |
QUnit |
Buster |
### Operating Systems
Runner | Windows | Linux | Mac OSX
-|-|-|-
Native Runner | [v0.2.0+](#v020) | [v0.2.0+](#v020) | [v0.2.0+](#v020)
Testem | [v0.1.3+](#v013) | [v0.1.3+](#v013) | [v0.1.3+](#v013)
Yeti | | |
Karma | | |
Intern | | |
## Installation
```
npm install cross-browser-tests-runner
```
## Quick Start
### BrowserStack
```
$ export BROWSERSTACK_USERNAME=<your-browserstack-username>
$ export BROWSERSTACK_ACCESS_KEY=<your-browserstack-access-key>
```
### Native Runner
#### BrowserStack
In your project root directory
```
$ cp -r ./node_modules/cross-browser-tests-runner/samples/ samples/
$ node ./node_modules/cross-browser-tests-runner/server.js --native-runner --config ./node_modules/cross-browser-tests-runner/samples/cbtr-browserstack.json
```
> This would run 4 tests (2 tests x 2 browsers) in your BrowserStack account.
### Testem
Create `testem.json` in your project's root directory with `src_files` (or `test_page`) and `framework` (if required) settings.
#### BrowserStack
```
$ ./node_modules/.bin/cbtr-quick-start -p browserstack -r testem
$ node ./node_modules/cross-browsers-tests-runner/server.js
```
In another terminal:
```
$ testem ci
```
## Getting Started - Step by Step
### 1. Environment Variables
#### BrowserStack
```
$ export BROWSERSTACK_USERNAME=<your-browserstack-username>
$ export BROWSERSTACK_ACCESS_KEY=<your-browserstack-access-key>
```
### 2. Update Supported Browsers
#### BrowserStack
```
$ ./node_modules/.bin/cbtr-browserstack-update
```
This updates `./node_modules/cross-browser-tests-runner/conf/browserstack-conf.json` and `./node_modules/cross-browser-tests-runner/conf/cbtr-conf.json`.
### 3. Select Browsers
#### BrowserStack
```
$ cp ./node_modules/cross-browser-tests-runner/samples/.cbtr-browsers-browserstack.yml` .cbtr-browsers.yml`
```
The above is a sample to help you understand the process. Eventually, you'll write your own. See [.cbtr-browsers.yml](#cbtr-browsersyml).
### 4. Create Common Config
```
$ ./node_modules/.bin/cbtr-init
```
This would create `cbtr.json` in your project's root directory, based on the information in `.cbtr-browsers.yml`. It serves as configuration for native runner, as well as the common intermediate format using which individual test runner's configuration is generated. See [cbtr.json](#cbtrjson), [cbtr-init](#cbtr-init).
### 5. Create Runner Config
#### Native Runner
Add `framework` and `test_file` settings in `cbtr.json`. See [cbtr.json](#cbtrjson) for details.
#### Testem
##### BrowserStack
```
$ ./node_modules/.bin/cbtr-testem-browserstack-init
```
This would create or update existing `testem.json` in your project's root directory.
> It overwrites `launchers` and `launch_in_ci` settings. Any other settings specified in existing `testem.json` would be untouched.
See [cbtr-testem-browserstack-init](#cbtr-testem-browserstack-init) for more details.
### 6. Run Server
#### Native Runner
```
$ node ./node_modules/cross-browser-tests-runner/server.js --native-runner
```
This would run all your tests and exit once they complete.
#### Other Runners
```
$ node ./node_modules/cross-browser-tests-runner/server.js
```
More: [server](#server).
### 7. Run Tests
> Only if you are using other test runners, and not the native one.
#### Testem
```
$ testem ci
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
Multiple files with browsers can be created and with any file name. See [cbtr-init](#cbtr-init) to know how to use such a file not in project's root directory or not named `.cbtr-browsers.yml`.
#### Samples
See `./node_modules/cross-browser-tests-runner/samples/.cbtr-browsers*.yml`
### cbtr.json
#### Format
```
{
  "framework": "jasmine",
  "test_file": [
    "samples/native/tests/html/jasmine/tests.html",
    "samples/native/tests/html/jasmine/tests-cov.html"
  ],
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
      ]
    }
  },
  "server": {
    "port": 7982,
    "host": "127.0.0.1"
  }
}
```
##### framework
Needed only if using native runner. Allowed values: `jasmine`, `jasmine2`, `mocha`, `qunit`, and `buster`. Default is `jasmine`.
> Currently only `jasmine` is supported.
##### test_file
Needed only if using native runner. A string of array of strings - one per test html file. See [Test HTML](#test-html) to understand what structure is required.
##### browsers setting
This section is typically generated using [cbtr-init](#cbtr-init).
##### server setting
This section provides the settings for cross-browser-tests-runner server. At this point, no changes should be required unless the default port `7982` is in use by some other process.
#### Multiple Files
Multiple files with cross-browser-tests-runner settings can be created and with any file name. See [cbtr-init](#cbtr-init) to know how to create such files not in project root or not named `cbtr.json`. See [cbtr-testem-browserstack-init](#cbtr-testem-browserstack-init), [server](#server) to know how to use such files not in project root or not named `cbtr.json` as input.
#### Samples
See `./node_modules/cross-browser-tests-runner/samples/cbtr*.json`
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
The cross-browser-tests-runner server helps creating and managing tests and their state.
### Native Runner mode
```
$ node ./node_modules/cross-browser-tests-runner/server.js --native-runner
```
It would exit after completing all tests.
### Other Runners mode
```
$ node ./node_modules/cross-browser-tests-runner/server.js
```
It would keep running in foreground, and you can use PM2 to run it in background, or add `&` on Linux/OSX to move it to background.
### Usage
```
./node_modules/cross-browser-tests-runner/server.js [--help|-h] [--config|-c <config-file>] [--native-runner|-n]

Defaults:
 config            cbtr.json in project root, or CBTR_SETTINGS env var
 native-runner     false

Options:
 help              print this help
 config            cross-browser-tests-runner settings file
 native-runner     if the server should work as native test runner
```
## Native Runner
### Test HTML
A test HTML needs to have a certain structure. The Native Runner needs that to be able to instrument your test code.
#### Jasmine 1.x
The following sample test html shows the structure needed.
- Jasmine javascript and css files need to be loaded manually.
- `/cross-browser-tests-runner.js` is a 'dynamically' served file which constitutes the 'instrumentation' needed by native runner
- The Jasmine setup, execution code and `jasmine_content` div elements are needed as shown.
- Your javascript source and unit test files can be relative to the html file (as shown in this sample), or relative to root. The root directory of your project is the root directory of web serving.
```
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
  <script src="../../js/src/app.js"></script>
  <script src="../../js/tests/jasmine/test.js"></script>
  <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/jasmine/1.3.1/jasmine.css">
</head>
<body>
  <div id="jasmine_content"></div>
</body>
</html>
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
0.2.0 | BrowserStack | Native Runner | node 6, 7<br>[Issue 1](https://github.com/cross-browser-tests-runner/cross-browser-tests-runner/issues/1) | node 4, 6, 7<br>[Issue 2](https://github.com/cross-browser-tests-runner/cross-browser-tests-runner/issues/2) | node 4-7
0.1.3 | BrowserStack | Testem | node 6, 7<br>[Issue 1](https://github.com/cross-browser-tests-runner/cross-browser-tests-runner/issues/1) | node 4, 6, 7<br>[Issue 2](https://github.com/cross-browser-tests-runner/cross-browser-tests-runner/issues/2) | node 4-7
### Deprecated
- v0.1.1-v0.1.2
## Caveats & Limitations
Please check [Issues](https://github.com/cross-browser-tests-runner/cross-browser-tests-runner/issues)
## Change Log
### v0.2.1
- CI detection and usage for specifying test, project and build capabilities for native runner
- Fixed break in cbtr-init due to change in default settings structure
- BrowserStack rate limit exceeds easily with monitoring test status every 10 seconds. Moved to 60 seconds.
### v0.2.0
- Implementation of Native Runner supporting BrowserStack platform and Jasmine 1.x
### v0.1.5
- The utilty `cbtr-browserstack-update` also updates `conf/cbtr-conf.json` to avoid gaps between main config and browserstack config which was causing errors while generating Testem runner config for BrowserStack
- Format-only updates to `conf/cbtr-conf.json` post the above change
- Fixed a bug in `cbtr-testem-browserstack-init` around not being able to generate mobile devices in runner config
### v0.1.4
- The utility `cbtr-testem-browserstack-init` now allows specifying BrowserStack browser timeout capability
- Fixed few missing valid OS and OS versions in `conf/cbtr-conf.json`
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
