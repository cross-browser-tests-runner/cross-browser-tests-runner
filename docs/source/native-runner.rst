Native Runner
=============

Need for a tool like cross-browser-tests-runner
-----------------------------------------------

The beginning idea for cross-browser-tests-runner was to help make JavaScript testing using cross-browser testing platforms easy. It was seen that several JavaScript test runners like Testem exist; however, they do not naturally extend to cross-browser testing platforms. And, the work to integrate different test runners with different cross-browser testing platforms is very fragmented, and that creates a steep learning curve if experimenting/working with multiple platforms and tests runners is required.

So how if there was one tool that enables you to pick any of your favorite test runners and test on any of your favorite cross-browser testing platforms? That's what cross-browser-tests-runner aims to be.

Limitations of existing work
----------------------------

However; as work on integrating existing test runners was taken up, several limitations were found:

-  Testem's instrumented JavaScript does not work on older browsers, starting with assumptions of JSON object being available in the browser (not true with older browsers). Experiments showed that a risky and major rewrite of the injected code would be required.
-  BrowserStack's own runner called browserstack-runner does work on older browsers; but does not have a proxy/bypass mechanism like Testem, so it's not possible to send client-side code coverage data to the test server and store it.
-  For local testing, each cross-browser testing platform uses tunnels.  It was seen with BrowserStack that tunnel processes die often, which means that the test results would not reach to the test server even if a client browser sends it, so completion of the test cannot be detected. There is no tool that works around such issues specific to cross-browser testing platforms.

What a cross-browser tester needs
---------------------------------

Essentially, a serious and purist cross-browser tester needs a solution that:

-  takes care of the complete testing workflow taking the state machine and undocumented/unknown/stability issues of a cross-browser testing platforms into account
-  does not cause limitations on browser coverage
-  supports essential testing features like code coverage, and
-  includes fail-over mechanisms to account for errors

It was seen that modifying existing third-party solutions to include all of above can be difficult. This is where the in-built test runner - called Native Runner - was born.

Features
--------

Large Browser Coverage
~~~~~~~~~~~~~~~~~~~~~~

The code injected by Native Runner works on oldest browsers like Internet Explorer 6, and Android 1.5.

Code Coverage Collection
~~~~~~~~~~~~~~~~~~~~~~~~

If your JavaScript source is instrumented using a tool like Istanbul, the coverage data collected on the browser is automatically sent to Native Runner, which stores it into ``coverage/`` directory in your project's root.

You can use Istanbul or any other compatible tools to generate code coverage reports, and upload the coverage data to services like https://codecov.io, https://coveralls.io and others.

JavaScript Unit and Selenium Testing
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

With versions 0.4.0+, Native Runner supports both. For Selenium testing, it abstracts various details for you so you can focus on writing test code alone.

Monitoring of Tunnels
~~~~~~~~~~~~~~~~~~~~~

BrowserStack tunnels die due to undocumented/unknown issues. Native Runner monitors tunnels created across all platforms and restarts those that die.

With 0.5.0+ this functionality has been moved to the Platform library layer, so this happens even for testing with third party test runners like Testem.

Test Results Reporting Retries
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Native Runner's injected code includes a retry with exponential back-off mechanism that tries to recover from failures that occur when tunnels die, exploiting the tunnel monitoring mechanism described above.

Since this is done by code injected by Native Runner, this is not available with third party test runners.

.. _native-runner-test-retries:

Test Retries
~~~~~~~~~~~~

Sometimes, test result reporting fails even with all above mechanisms in place. Native Runner retries tests for which no results were reported if a non-zero ``retries`` (See :ref:`settings-parameters`) parameter is provided in :doc:`settings`.

JavaScript Unit Testing
-----------------------

.. _native-runner-test-html:

Test HTML
~~~~~~~~~

Unlike Testem that generates the test HTML, one needs to write a test HTML file when using Native Runner. Following sections provide samples that show the structure the test HTML file needs to have.

A test can use more than test HTML files. The ``test_file`` (See :ref:`settings-parameters`) parameter in :doc:`settings` specified test HTML file(s) to use.

Jasmine 1.x
...........

Use the following sample and replace the annotated lines in the sample with your source and test JavaScript files.

.. code-block:: html

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
      <!-- start of your app and test code -->
      <script src="../../js/src/app.js"></script>
      <script src="../../js/tests/jasmine/test.js"></script>
      <!-- end of your app and test code -->
      <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/jasmine/1.3.1/jasmine.css">
    </head>
    <body>
      <div id="jasmine_content"></div>
    </body>
    </html>

Selenium Testing
----------------

.. _native-runner-test-script:

Test Script
~~~~~~~~~~~

For Selenium Testing, one needs to write the test code in a file and provide its path in ``test_script`` (See :ref:`settings-parameters`) parameter in :doc:`settings`.

Sample
......

The following sample shows the structure of a test script file.

.. code-block:: javascript

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

Structure
.........

A test script exports two functions:

-  ``script`` **required**: This implements the test script functionality.
-  ``decider`` *optional*: This decides whether the test succeeded or failed.

Arguments provided to both functions:

-  ``driver``: This is the ``thenable`` web driver instance created by Builder. See `Selenium
   documentation <http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_ThenableWebDriver.html>`__.
-  ``webdriver``: This is the handle obtained with ``javascript require('selenium-webdriver')``

Both functions must return a ``Promise`` or ``thenable``. See the `Selenium
documentation <http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_ThenableWebDriver.html>`__.
