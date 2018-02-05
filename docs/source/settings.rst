Settings
========

Here is a summary of 2 entities of cross-browser-tests-runrer created towards the aim of providing a uniform/standard interface across various cross-browser testing platforms:

1. As one can see in :doc:`platform-configuration`, since different cross-browser testing platform use different names for browsers and OSes, cross-browser-tests-runner helps your write your tests using uniform browser and platform name aliases, and would convert them to platform-specific names internally.
2. To improve efficiency in writing your test configuration, you write browsers involved in your tests in a :doc:`browsers-yaml` in a smart and compact format, using the uniform aliases from above.

The 'Settings File' is the third link of the above chain. It is a JSON format file that is generated based on the Browsers YAML file (using :doc:`cbtr-init`). It eventually contains other details of your tests e.g. unit testing framework, the test file paths etc. It serves the following purposes:

1. Provides test settings for the in-built JavaScript unit tests and Selenium tests runner
2. Serves as the common input file to generate multiple third party unit tests runner settings file e.g. testem.json, using executable binaries provided by cross-browser-tests-runner. Since each third-party unit tests runner has their own configuration syntax, generating each of them from a common settings file helps reducing efforts.

Format
------

Examples
~~~~~~~~

JavaScript Unit Testing
.......................

.. code:: javascript

    {
      "framework": "jasmine",
      "test_file": "tests/functional/code/tests/jasmine/html/tests.html",
      "retries": 1,
      "limit": "4mb",
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
            }      ]
        },
        "SauceLabs": {
          "JS": [
            {
              "os": "Windows",
              "osVersion": "7",
              "browser": "Chrome",
              "browserVersion": "32.0"
            },
            {
              "os": "OS X",
              "osVersion": "Sierra",
              "browser": "Mobile Safari",
              "browserVersion": "10.3"
            }
          ]
        },
        "CrossBrowserTesting": {
          "JS": [
            {
              "os": "Android",
              "osVersion": "7.0",
              "browser": "Dolphin Mobile",
              "browserVersion": "12.0"
            },
            {
              "os": "OS X",
              "osVersion": "Sierra",
              "browser": "Safari",
              "browserVersion": "10.0"
            }
          ]
        }
      },
      "capabilities": {
        "BrowserStack": {
          "local": true,
          "localIdentifier": "native-functional-tests",
          "build": "native-runner-build",
          "test": "native-runner-functional-test",
          "project": "cross-browser-tests-runner/cross-browser-tests-runner",
          "screenshots": true
        },
        "SauceLabs": {
          "local": true,
          "localIdentifier": "native-functional-tests",
          "build": "native-runner-build",
          "test": "native-runner-functional-test",
          "timeout": 90,
          "screenshots": true
        },
        "CrossBrowserTesting": {
          "local": true,
          "localIdentifier": "native-functional-tests",
          "build": "native-runner-build",
          "test": "native-runner-functional-test",
          "project": "cross-browser-tests-runner/cross-browser-tests-runner",
          "screenshots": true,
          "timeout": 90
        }
      },
      "server": {
        "port": 8000,
        "host": "127.0.0.1"
      },
      "parallel": {
        "BrowserStack": 2,
        "SauceLabs": 5,
        "CrossBrowserTesting": 5
      }
    }

Selenium Testing
................

.. code:: javascript

    {
      "test_file": "tests/functional/code/tests/selenium/html/tests.html",
      "test_script": "tests/functional/code/scripts/selenium/script-1.js",
      "browsers": {
        "BrowserStack": {
          "Selenium": [
            {
              "os": "OS X",
              "osVersion": "Mavericks",
              "browser": "Firefox",
              "browserVersion": "39.0"
            },
            {
              "os": "Android",
              "osVersion": "4.0",
              "browser": "Android Browser",
              "browserVersion": null,
              "device": "Motorola Razr"
            }
          ]
        },
        "SauceLabs": {
          "Selenium": [
            {
              "os": "OS X",
              "osVersion": "Mavericks",
              "browser": "Chrome",
              "browserVersion": "33.0"
            },
            {
              "os": "Android",
              "osVersion": "5.0",
              "browser": "Android Browser",
              "browserVersion": null,
              "device": "Android Emulator"
            },
            {
              "os": "iOS",
              "osVersion": "8.3",
              "browser": "Safari",
              "browserVersion": null,
              "device": "iPhone 6 Plus Simulator"
            }
          ]
        },
        "CrossBrowserTesting": {
          "Selenium": [
            {
              "os": "OS X",
              "osVersion": "Yosemite",
              "browser": "Firefox",
              "browserVersion": "39.0"
            },
            {
              "os": "Windows",
              "osVersion": "8.1",
              "browser": "Internet Explorer",
              "browserVersion": "11.0"
            }
          ]
        }
      },
      "capabilities": {
        "BrowserStack": {
          "local": true,
          "localIdentifier": "native-functional-tests",
          "build": "native-runner-build",
          "test": "native-runner-functional-test",
          "project": "cross-browser-tests-runner/cross-browser-tests-runner",
          "screenshots": true,
          "timeout": 120
        },
        "SauceLabs": {
          "local": true,
          "localIdentifier": "native-functional-tests",
          "build": "native-runner-build",
          "test": "native-runner-functional-test",
          "project": "cross-browser-tests-runner/cross-browser-tests-runner",
          "timeout": 120
        },
        "CrossBrowserTesting": {
          "local": true,
          "localIdentifier": "native-functional-tests",
          "build": "native-runner-build",
          "test": "native-runner-functional-test",
          "project": "cross-browser-tests-runner/cross-browser-tests-runner",
          "screenshots": true,
          "timeout": 120
        }
      },
      "server": {
        "port": 7883,
        "host": "127.0.0.1"
      },
      "parallel": {
        "BrowserStack": 2,
        "SauceLabs": 5,
        "CrossBrowserTesting": 5
      }
    }

.. _settings-parameters:

Parameters
~~~~~~~~~~

+-------------------+-------------------+-------------------+-------------------+-------------------+
| Parameter         | Applies To        | Description       | Possible Values   | Default           |
+===================+===================+===================+===================+===================+
| ``framework``     | JavaScript unit   | It is the name of | ``jasmine``       | ``jasmine``       |
|                   | tests using the   | the JavaScript    |                   |                   |
|                   | in-built native   | unit tests        |                   |                   |
|                   | runner            | framework used in |                   |                   |
|                   |                   | your tests        |                   |                   |
+-------------------+-------------------+-------------------+-------------------+-------------------+
| ``retries``       | JavaScript unit   | Number of retries | >=0               | ``0``             |
|                   | tests using the   | to try a test     |                   |                   |
|                   | in-built native   | once it fails     |                   |                   |
|                   | runner            | (See :ref:`nativ\ |                   |                   |
|                   |                   | e-runner-test-re\ |                   |                   |
|                   |                   | tries`)           |                   |                   |
+-------------------+-------------------+-------------------+-------------------+-------------------+
| ``limit``         | JavaScript unit   | Size limit of     | See `Request Size | ``"4mb"``         |
|                   | tests using the   | data (test        | Limit <https://ww |                   |
|                   | in-built native   | reports, and code | w.npmjs.com/packa |                   |
|                   | runner            | coverage data)    | ge/body-parser#li |                   |
|                   |                   | sent by a browser | mit>`__           |                   |
|                   |                   | to accept         |                   |                   |
+-------------------+-------------------+-------------------+-------------------+-------------------+
| ``test_file``     | JavaScript unit   | Path of test HTML | A string or an    |                   |
|                   | tests and         | file(s), must be  | array of strings  |                   |
|                   | Selenium tests    | relative to root  | - one per test    |                   |
|                   | using the         | directory of your | html file         |                   |
|                   | in-built native   | project (See      |                   |                   |
|                   | runner            | :ref:`native-ru\  |                   |                   |
|                   |                   | nner-test-html`   |                   |                   |
|                   |                   | for details)      |                   |                   |
+-------------------+-------------------+-------------------+-------------------+-------------------+
| ``test_script``   | Selenium tests    | Path of Selenium  | A string or an    |                   |
|                   |                   | test script(s),   | array of strings  |                   |
|                   |                   | must be relative  | - one per test    |                   |
|                   |                   | to root directory | script file       |                   |
|                   |                   | of your project   |                   |                   |
|                   |                   | (See :ref:`native\|                   |                   |
|                   |                   | -runner-test-scr\ |                   |                   |
|                   |                   | ipt` for details) |                   |                   |
+-------------------+-------------------+-------------------+-------------------+-------------------+
| ``browsers``      | All testing       | The set of        |                   |                   |
|                   |                   | browsers to use   |                   |                   |
|                   |                   | for your tests -  |                   |                   |
|                   |                   | generated by      |                   |                   |
|                   |                   | :doc:`cbtr-init`  |                   |                   |
|                   |                   | based on browsers |                   |                   |
|                   |                   | specified in your |                   |                   |
|                   |                   | :doc:`browsers-ya\|                   |                   |
|                   |                   | ml` file          |                   |                   |
+-------------------+-------------------+-------------------+-------------------+-------------------+
| ``capabilities``  | All testing       | Testing           | See               | See               |
|                   |                   | "capabilities"    | `capabilities <#c | `capabilities <#c |
|                   |                   | other than        | apabilities>`__   | apabilities>`__   |
|                   |                   | browser details - |                   |                   |
|                   |                   | generated with    |                   |                   |
|                   |                   | defaults by       |                   |                   |
|                   |                   | :doc:`cbtr-init`  |                   |                   |
+-------------------+-------------------+-------------------+-------------------+-------------------+
| ``server``        | All testing       | Server host and   | See               | See               |
|                   |                   | port - generated  | `server <#serv    | `server <#serv    |
|                   |                   | with defaults by  | er>`__            | er>`__            |
|                   |                   | :doc:`cbtr-init`  |                   |                   |
+-------------------+-------------------+-------------------+-------------------+-------------------+
| ``parallel``      | All testing       | Number of         | See               | See               |
|                   |                   | sessions to run   | `parallel <#paral | `parallel <#paral |
|                   |                   | in parallel on a  | lel>`__           | lel>`__           |
|                   |                   | cross-browser     |                   |                   |
|                   |                   | testing platform  |                   |                   |
|                   |                   | - generated with  |                   |                   |
|                   |                   | defaults by       |                   |                   |
|                   |                   | :doc:`cbtr-init`  |                   |                   |
+-------------------+-------------------+-------------------+-------------------+-------------------+


capabilities
............

+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| Parameter                         | Platforms                         | Description                       | Possible Values                   | Default                           |
+===================================+===================================+===================================+===================================+===================================+
| ``local``                         | All                               | Enforces testing of local pages   | ``true``, ``false``               | ``true``                          |
|                                   |                                   | if set to ``true``                |                                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``localIdentifier``               | All                               | Identifier for tunnel used for    | ``string`` type                   |                                   |
|                                   |                                   | local testing                     |                                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``screenshots``                   | All                               | Enables taking screenshots if set | ``true``, ``false``               | ``true`` for ``BrowserStack``     |
|                                   |                                   | to ``true``, disables if set to   |                                   |                                   |
|                                   |                                   | false                             |                                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``video``                         | All                               | Enables capturing a video of test | ``true``, ``false``               |                                   |
|                                   |                                   | if set to ``true``, disables if   |                                   |                                   |
|                                   |                                   | set to false                      |                                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``timeout``                       | All                               | Timeout for a browser/test        | >0                                | ``120``                           |
|                                   |                                   | session in seconds (**note**:     |                                   |                                   |
|                                   |                                   | BrowserStack has a minimum 60s    |                                   |                                   |
|                                   |                                   | timeout requirement)              |                                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``project``                       | ``BrowserStack``                  | ``username/repo`` slug of your    | ``string`` type                   | ``"anonymous/anonymous"``         |
|                                   |                                   | project, automatically set if     |                                   |                                   |
|                                   |                                   | running on Travis, Circle or      |                                   |                                   |
|                                   |                                   | Appveyor                          |                                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``build``                         | All                               | build id for your tests,          | ``string`` type                   | Output of ``git rev-parse HEAD``  |
|                                   |                                   | automatically set if running on   |                                   |                                   |
|                                   |                                   | Travis, Circle of Appveyor to     |                                   |                                   |
|                                   |                                   | commit SHA1                       |                                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``test``                          | All                               | Name for your test session        | ``string`` type                   | A uuid                            |
|                                   |                                   | (applies to all browser sessions  |                                   |                                   |
|                                   |                                   | in your tests), automatically set |                                   |                                   |
|                                   |                                   | to a unique identifier if running |                                   |                                   |
|                                   |                                   | on Travis, Circle or Appveyor     |                                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``tags``                          | ``SauceLabs``                     | An array of arbitrary tags for a  | ``array`` type                    |                                   |
|                                   |                                   | test                              |                                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``customData``                    | ``SauceLabs``                     | An object with arbitrary key      | ``object`` type                   |                                   |
|                                   |                                   | values                            |                                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``priority``                      | ``SauceLabs``                     | To assign higher/lower priority   | ``number`` type                   |                                   |
|                                   |                                   | to a test as compared to others   |                                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``parentTunnel``                  | ``SauceLabs``                     | While using sub-accounts, use     | ``string`` type                   |                                   |
|                                   |                                   | this to use parent user's tunnel  |                                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``noServerFailureScreenshots``    | ``SauceLabs``                     | Do not take screenshots of        | ``true``, ``false``               | ``true``                          |
|                                   |                                   | selenium script failure points    |                                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``videoUploadOnPass``             | ``SauceLabs``                     | Upload video even if a test       | ``true``, ``false``               | ``true``                          |
|                                   |                                   | passes                            |                                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``seleniumVersion``               | ``BrowserStack`` ``SauceLabs``    | Selenium version to use           | ``string`` type                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``appiumVersion``                 | ``BrowserStack`` ``SauceLabs``    | Appium version to use             | ``string`` type                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``timezone``                      | ``BrowserStack``  ``SauceLabs``   | Time zone to use for a test       | ``string`` type                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``captureConsole``                | ``BrowserStack``                  | Capture console logs of a test    | ``string`` type                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``captureNetwork``                | ``BrowserStack``                  | Capture network packets of a test | ``true``, ``false``               | ``false``                         |
|                                   | ``CrossBrowserTesting``           |                                   |                                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``captureLogs``                   | ``SauceLabs``                     | Record logs of a test             | ``true``, ``false``               | ``true``                          |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``captureHtml``                   | ``SauceLabs``                     | Capture HTML output of a test     | ``true``, ``false``               | ``false``                         |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``ieNoFlash``                     | ``BrowserStack``                  | Do not use Flash in Internet      | ``true``, ``false``               | ``false``                         |
|                                   |                                   | Explorer                          |                                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``ieDriver``                      | ``BrowserStack`` ``SauceLabs``    | Version of Internet Explorer      | ``string`` type                   |                                   |
|                                   |                                   | webdriver                         |                                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``ieCompat``                      | ``BrowserStack``                  | Compatibility level of Internet   | ``number`` type                   |                                   |
|                                   |                                   | Explorer                          |                                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``iePopups``                      | ``BrowserStack``                  | Enable pop-ups in Internet        | ``true``, ``false``               | ``false``                         |
|                                   |                                   | Explorer                          |                                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``edgePopups``                    | ``BrowserStack``                  | Enable pop-ups in Edge            | ``true``, ``false``               | ``false``                         |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``safariPopups``                  | ``BrowserStack``                  | Enable pop-ups in Safari          | ``true``, ``false``               | ``false``                         |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``safariAllCookies``              | ``BrowserStack``                  | Allow all cookies in Safari       | ``true``, ``false``               | ``true``                          |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``safariDriver``                  | ``BrowserStack``                  | Version of Safari webdriver       | ``string`` type                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``geckoDriver``                   | ``BrowserStack``                  | Version of gecko (Firefox) driver | ``string`` type                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``chromeDriver``                  | ``SauceLabs``                     | Version of Chrome webdriver       | ``string`` type                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``automationEngine``              | ``SauceLabs``                     | Automation engine to use on       | ``string`` type                   | ``Appium``                        |
|                                   |                                   | devices                           |                                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``autoAcceptAlerts``              | ``SauceLabs``                     | Automatically accept JavaScript   | ``true``, ``false``               | ``false``                         |
|                                   |                                   | created alerts                    |                                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+
| ``prerun``                        | ``SauceLabs``                     | An object that describes an       | ``object`` type                   |                                   |
|                                   |                                   | executable to run before the test |                                   |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+-----------------------------------+

server
......

+-----------------+-----------------+-----------------+-----------------+
| Parameter       | Description     | Possible Values | Default         |
+=================+=================+=================+=================+
| ``host``        | The IP address  | ip address,     | ``"127.0.0.1"`` |
|                 | on which the    | host name       |                 |
|                 | test server     |                 |                 |
|                 | listens         |                 |                 |
+-----------------+-----------------+-----------------+-----------------+
| ``port``        | The port on     | ``number`` type | ``7982``        |
|                 | which the test  |                 |                 |
|                 | server listens  |                 |                 |
+-----------------+-----------------+-----------------+-----------------+

No changes in this section are needed unless:

-  You need to connect to the server from a separate machine (probably
   for your local testing) and not using a tunnel. In such case you may
   want to change it to ``"0.0.0.0"``.
-  The port ``7982`` is in use by some other process

parallel
........

+-------------------------+-----------------------------------------------------------------------+-----------------+---------+
| Parameter               | Description                                                           | Possible Values | Default |
+=========================+=======================================================================+=================+=========+
| ``BrowserStack``        | Number of sessions that can be run in parallel on BrowserStack        | >0              | ``2``   |
+-------------------------+-----------------------------------------------------------------------+-----------------+---------+
| ``SauceLabs``           | Number of sessions that can be run in parallel on SauceLabs           | >0              | ``5``   |
+-------------------------+-----------------------------------------------------------------------+-----------------+---------+
| ``CrossBrowserTesting`` | Number of sessions that can be run in parallel on CrossBrowserTesting | >0              | ``5``   |
+-------------------------+-----------------------------------------------------------------------+-----------------+---------+


Multiple Copies
---------------

You can have more than one test settings files, if you need to break
your work down into multiple tests.

Samples
-------

``./node_modules/cross-browser-tests-runner/samples/cbtr/*/*.json``
