[![Build Status](https://travis-ci.org/cross-browser-tests-runner/cross-browser-tests-runner.svg?branch=master)](https://travis-ci.org/cross-browser-tests-runner/cross-browser-tests-runner) [![codecov](https://codecov.io/gh/cross-browser-tests-runner/cross-browser-tests-runner/branch/master/graph/badge.svg)](https://codecov.io/gh/cross-browser-tests-runner/cross-browser-tests-runner) [![Coverage Status](https://coveralls.io/repos/github/cross-browser-tests-runner/cross-browser-tests-runner/badge.svg?branch=master)](https://coveralls.io/github/cross-browser-tests-runner/cross-browser-tests-runner?branch=master) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/cross-browser-tests-runner/cross-browser-tests-runner/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/cross-browser-tests-runner/cross-browser-tests-runner/?branch=master) [![Code Climate](https://codeclimate.com/github/cross-browser-tests-runner/cross-browser-tests-runner.svg)](https://codeclimate.com/github/cross-browser-tests-runner/cross-browser-tests-runner) [![bitHound Dependencies](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/badges/dependencies.svg)](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/master/dependencies/npm) [![bitHound Dev Dependencies](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/badges/devDependencies.svg)](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/master/dependencies/npm) [![npm](https://img.shields.io/npm/v/cross-browser-tests-runner.svg)](https://www.npmjs.com/package/cross-browser-tests-runner) [![npm downloads](https://img.shields.io/npm/dt/cross-browser-tests-runner.svg)](https://www.npmjs.com/package/cross-browser-tests-runner)

# cross-browser-tests-runner

One tool to do cross-browser testing across multiple cross-browser testing platforms, runners and frameworks.

- [Installation](#installation)
- [Quick Start](#quick-start)
- [How To Test](#how-to-test)
- [Status](#status)
- [Acknowledgements](#acknowledgements)

## Installation

```bash
$ npm install cross-browser-tests-runner
```

## Quick Start

To see few sample tests running quickly, see [Quick Start](https://github.com/cross-browser-tests-runner/cross-browser-tests-runner/wiki/Quick-Start).

## How to Test

Use the [How to Test](https://github.com/cross-browser-tests-runner/cross-browser-tests-runner/wiki/How-to-Test) guide to start writing and running your own tests.

## Troubleshooting

See [Troubleshooting](https://github.com/cross-browser-tests-runner/cross-browser-tests-runner/wiki/Troubleshooting)

## Status
### Integrations

Platform|JS - Testem|JS - In-built Runner|Selenium
-|-|-|-
BrowserStack|✓|✓|✓
SauceLabs|✓|✓|✓
CrossBrowserTesting|✓|✓|✓

### JS Frameworks supported by Native Runner

Unit Testing Framework|
-|
Jasmine 1.x|

### Supported Node.js Versions

Node version|Linux|OS X
-|-|-
4.8.5|✓|✓
8.8.1|✓|✓

> Windows builds on Appveyor were stopped since 1.0.0 as unpredictable network failures between VMs and cross-browser testing platforms make some jobs in the build fail (expected behavior) at times and if one job fails, then the whole build needs to be restarted again, and there is no guarantee that anything won't fail again. This makes the build cycle's length unpredictable and the whole exercise very counter-productive, especially when the build duration is 4+ hours. Please see the [Appveyor open issue](https://github.com/appveyor/ci/issues/58).

> Builds with v5.x, v6.x and v7.x would be attempted time-to-time and updated

### Minimum Node.js Versions

Platform|JS - Testem|JS - In-built Runner|Selenium
-|-|-|-
BrowserStack|v4.8.5+<br>✗ v5.x.x|v4.8.5+|v6.9.0+
SauceLabs|v4.8.5+<br>✗ v5.x.x|v6.9.0+|v6.9.0+
CrossBrowserTesting|v4.8.5+<br>✗ v5.x.x|v4.8.5+|v6.9.0+

## Acknowledgements
[![BrowserStack](doc/img/ack/browserstack-logo.png)](https://www.browserstack.com) [![SauceLabs](doc/img/ack/saucelabs-logo.png)](https://www.saucelabs.com) [![CrossBrowserTesting](doc/img/ack/crossbrowsertesting-logo.png)](https://crossbrowsertesting.com) [![Travis CI](doc/img/ack/travis-logo.png)](https://travis-ci.org)
