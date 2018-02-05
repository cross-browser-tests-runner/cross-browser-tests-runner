cbtr-testem-crossbrowsertesting-init
====================================

This executable helps you generate ``testem.json`` - Testem's settings - from cross-browser-tests-runner :doc:`settings` that includes CrossBrowserTesting browsers.  

**NOTE**: Please note that browsers from other platforms would not work even if they are included in the settings file.

Usage
-----

.. code-block:: sh

    $ ./node_modules/.bin/cbtr-testem-crossbrowsertesting-init [--help|-h] [--input|-i <cbtr-settings-file>] [--output|-o <testem-settings-file>]

    Defaults:
     input             cbtr.json in project root
     output            testem.json in project root

    Options:
     help              print this help
     input             cross-browser-tests-runner settings file
     output            testem settings file

Questions asked
---------------

On running, the executable would ask you the following questions:

**NOTE**: You need to enter a value, and there are no defaults.

-  ``Are you using multiple tunnels with different identifiers? (y/n) [If unsure, choose "n"]``

   -  **Please choose 'n'**. CrossBrowserTesting does not support multiple tunnels yet. This question remains for the sake of uniformity and supporting quick-start executable and would be removed later.

-  ``Do you need to take screenshots of your tests once completed? (y/n)``
-  ``Do you need to take video of your test? (y/n)``
-  ``Please provide a timeout value [60]``
