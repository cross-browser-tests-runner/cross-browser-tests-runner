[![Build Status](https://travis-ci.org/cross-browser-tests-runner/cross-browser-tests-runner.svg?branch=master)](https://travis-ci.org/cross-browser-tests-runner/cross-browser-tests-runner) [![Build status](https://ci.appveyor.com/api/projects/status/4xl0kdywtxkv6dje/branch/master?svg=true)](https://ci.appveyor.com/project/reeteshranjan/cross-browser-tests-runner/branch/master)
 [![codecov](https://codecov.io/gh/cross-browser-tests-runner/cross-browser-tests-runner/branch/master/graph/badge.svg)](https://codecov.io/gh/cross-browser-tests-runner/cross-browser-tests-runner) [![Coverage Status](https://coveralls.io/repos/github/cross-browser-tests-runner/cross-browser-tests-runner/badge.svg?branch=master)](https://coveralls.io/github/cross-browser-tests-runner/cross-browser-tests-runner?branch=master) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/cross-browser-tests-runner/cross-browser-tests-runner/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/cross-browser-tests-runner/cross-browser-tests-runner/?branch=master) [![Code Climate](https://codeclimate.com/github/cross-browser-tests-runner/cross-browser-tests-runner.svg)](https://codeclimate.com/github/cross-browser-tests-runner/cross-browser-tests-runner) [![bitHound Dependencies](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/badges/dependencies.svg)](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/master/dependencies/npm) [![bitHound Dev Dependencies](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/badges/devDependencies.svg)](https://www.bithound.io/github/cross-browser-tests-runner/cross-browser-tests-runner/master/dependencies/npm) [![npm](https://img.shields.io/npm/v/cross-browser-tests-runner.svg)](https://www.npmjs.com/package/cross-browser-tests-runner) [![npm downloads](https://img.shields.io/npm/dt/cross-browser-tests-runner.svg)](https://www.npmjs.com/package/cross-browser-tests-runner)

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

Node version|Linux|OS X|Windows
-|-|-|-
4.8.5|✓|✓|✓
8.9.0|✓|✓|✓

> v6.9.0 is the minimum version for Selenium tests and core Selenium functionality has been verified on this version. For the sake of time, v6 is not part of CI builds currently, and would be included later. As of now the overall build time is 12+ hours for verifying functionality on Windows, Linux and OS X, for latest v4 LTS and v8 LTS.

> Only LTS node versions (v6.9.0-v6.11.5, v4.2.0-v4.8.5, v8.9.0+) would be supported and included in CI builds. This does not necessarily mean that things don't work on other versions. In the earlier phases, builds with various v4, v5, v6, v7 and v8 versions (non-LTS ones included) were attempted and most functionality worked. However; maintaining a huge build matrix is not feasible currently.

### Minimum Node.js Versions

Platform|JS - Testem|JS - In-built Runner|Selenium
-|-|-|-
BrowserStack|v4.8.5+<br>✗ v5.x.x|v4.8.5+|v6.9.0+
SauceLabs|v6.9.0+|v6.9.0+|v6.9.0+
CrossBrowserTesting|v4.8.5+<br>✗ v5.x.x|v4.8.5+|v6.9.0+

## Acknowledgements
[![BrowserStack](doc/img/ack/browserstack-logo.png)](https://www.browserstack.com) [![SauceLabs](doc/img/ack/saucelabs-logo.png)](https://www.saucelabs.com) [![CrossBrowserTesting](doc/img/ack/crossbrowsertesting-logo.png)](https://crossbrowsertesting.com) [![Travis CI](doc/img/ack/travis-logo.png)](https://travis-ci.org) [![Appveyor](doc/img/ack/appveyor-logo.png)](https://appveyor.com)
