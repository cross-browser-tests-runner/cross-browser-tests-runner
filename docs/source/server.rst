Server
======

Cross-browser-tests-runner uses a server written using ``express`` that manages testing state and processes.

Modes
-----

Third Party Test Runners
~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: sh

    $ ./node_modules/.bin/cbtr-server

The server would run and keep waiting. Hooks are provided that bind a third party test runner like Testem with the interfaces provided by the server to create and manage tests. See :ref:`how-to-test-using-testem` for an example of how to use this mode.

Native Runner
~~~~~~~~~~~~~

Please see :doc:`native-runner` for details on this home-grown tests runner.

.. code-block:: sh

    $ ./node_modules/.bin/cbtr-server --native-runner [--config <path-to-settings-file>]

Debugging Mode
..............

If the ``--config`` option is not provided, or there are no browsers/testing information specified in the settings file mentioned, the server would keep running. A user then can open test HTML files on a local browser. In this mode, you can debug your tests before running the tests on a cross-browser testing platform. For example, if the server is listening on port ``7982``, and ``tests.html`` exists in the root directory of your project, you can open ``http://127.0.0.1:7982/tests.html`` in a local browser.

CI Mode
.......

The server runs all the tests and exits if the following are provided in
the input settings file:

-  JS browsers and ``test_file`` (:ref:`settings-parameters`) parameter, or
-  Selenium browsers, ``test_file`` (:ref:`settings-parameters`), and ``test_script`` (See :ref:`settings-parameters`) parameters

Usage
-----

::

    $ ./node_modules/.bin/cbtr-server [--help|-h] [--config|-c <config-file>] [--native-runner|-n] [--errors-only|-e] [--omit-traces|-o] [--error-reports-only|-E] [--omit-report-traces|-O]
    
    Defaults:
     config              cbtr.json in project root, or CBTR_SETTINGS env var
     native-runner       false
     errors-only         false
     omit-traces         false
     error-reports-only  false
     omit-report-traces  false
    
    Options:
     help                print this help
     config              cross-browser-tests-runner settings file
     native-runner       if the server should work as native test runner
     errors-only         (native runner only) print only the specs that failed
     omit-traces         (native runner only) print only the error message and no stack traces
     error-reports-only  (native runner only) report only the error specs from browser
     omit-report-traces  (native runner only) do not include stack traces in reports sent by browser

Important Options
~~~~~~~~~~~~~~~~~

**NOTE**: Please note that all of the following apply to native runner mode only

-  ``errors-only``: use this if you are interested in looking at only the failed test specs/suites
-  ``omit-traces``: use this if you are interested in the failure messages only and not the stack trace
-  ``error-reports-only``: use this if you want to send data of only the failed test specs/suites from the browser
-  ``omit-report-traces``: use this if you want to not send stack traces of failures from the browser

First two are aimed at removing clutter in the output. Next two are aimed at reducing the size of test results data sent by browser.
