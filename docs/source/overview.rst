Overview
========

What is cross-browser-tests-runner?
-----------------------------------

It is a tool to help you run cross-browser javascript unit tests and selenium tests on multiple cross-browser testing platforms.

Why this tool?
-----------------

This tool was created to test `browse.js <https://github.com/browsejs/browse.js>`__, with following requirements:

*  Be able to run Jasmine 1.x unit tests to cover oldest browsers not supported by other newer versions or other frameworks like Mocha
*  Be able to send the Jasmine 1.x test data to server that can display it in a popular test results format (Mocha chosen eventually)
*  Be able to collect code coverage data and send to test server that can store it in a widely supported format (lcov) which could be uploaded to any third party code coverage tool/website
*  Be able to run tests in parallel on multiple cross-browser testing platforms e.g. browserstack.com, saucelabs.com, crossbrowsertesting.com to minimize build duration

Existing tools were not able to bring all the above pieces together, as was seen while trying to write the tests, and this tool was born.

Get Started
-----------

- Install::

    $ npm install cross-browser-tests-runner
- :doc:`quick-start`: Get started quickly and see some sample tests running
- :doc:`how-to-test`: See a more detailed description of the testing steps

References
----------

Configuration Files
...................

-  :doc:`platform-configuration`: About how and why we store each platform's supported browser/os configuration locally
-  :doc:`browsers-yaml`: Syntax of specifying browsers for your test
-  :doc:`settings`: Test settings file serving multiple purposes

Executables
...........

-  :doc:`cbtr-init`: Binary that generates test settings file given an input browsers YAML file
-  :doc:`cbtr-testem-browserstack-init`: Binary that helps your generate ``testem.json`` for testing on BrowserStack
-  :doc:`cbtr-testem-saucelabs-init`: Binary that helps your generate ``testem.json`` for testing on SauceLabs
-  :doc:`cbtr-testem-crossbrowsertesting-init`: Binary that helps you generate ``testem.json`` for testing on CrossBrowserTesting

Components
..........

-  :doc:`server`: Description of the test server
-  :doc:`native-runner`: Description of the in-built unit and selenium tests runner

Troubleshooting
---------------

-  See :doc:`troubleshooting`
