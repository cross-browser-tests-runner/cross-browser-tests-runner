Platform Configuration
======================

Cross-browser testing platforms have very different configurations in browsers/platforms supported, selenium/appium capabilities and various intricacies involved with these values. Another important aspect is that these change over time.

To test with multiple platforms, one needs to understand these details separately for each of these platforms and keep a tab on how these change. Cross-browser-tests-runner aims to make it easy to test across different platforms by abstracting these details beneath a simpler interface, which begins with representing each platform's configuration details through values and rules (as applicable) stored into local config files.

Local Configuration Files
-------------------------

The ``./node_modules/cross-browser-tests-runner/conf`` directory contains these:

-  Platform-specific browsers/operating systems, capabilities and configuration rules/conditions

   -  ``browserstack-conf.json``
   -  ``saucelabs-conf.json``
   -  ``crossbrowsertesting-conf.json``

-  Common/Generic config information:

   -  ``cbtr-conf.json``: pre-v1.0 this file had significant common details. Post-v1.0 it has very little details and may be removed in later releases.

Updating Configuration
----------------------

Replace ``{platform}`` in the command below with any of: ``browserstack``, ``saucelabs``, ``crossbrowsertesting``.

.. code:: bash

    $ ./node_modules/.bin/cbtr-{platform}-update

Standard Names & Conversions
----------------------------

Each cross-browser testing platform uses its own browser and OS names and from case-to-case there are intricate details as follows:

-  SauceLabs uses 'Browser' as the browser name for all Android appium tests
-  BrowserStack uses iphone or ipad name for Mobile Safari on iphones and ipads respectively

Cross-browser-tests-runner helps you specify your test configuration using standard/uniform browser/operating system names (See :doc:`browsers-yaml`). The conversions from standard/uniform names is done internally using the conversions available in Platform Configuration files.

JS & Selenium Browsers
----------------------

Some cross-browser testing platforms provide different browsers for JavaScript unit testing and Selenium testing. This is taken into account, and the configuration files store ``JS`` and ``Selenium`` browsers of each platform separately.

-  ``JS`` browsers: for writing JavaScript unit tests using testing frameworks
-  ``Selenium`` browsers: for writing Selenium-based tests

Capabilities & Conditions
-------------------------

Apart from browser, browser version, os, os version and device capabilities, which provide the unique identification of a browser, there are several capabilities e.g. selenium version, appium version, resolution, orientation etc. and each platform has its own intricacies e.g.

-  Selenium version for OS X Snow Leopard has to be < 2.47.1 on BrowserStack
-  Capturing console logs is supported only for Chrome on BrowserStack
-  Different platforms have different screen resolutions available, and different sets of them for different operating systems or devices
-  Selenium version has to be < 3.0.0 on SauceLabs if it's not Chrome/Firefox on Windows/OS X (and that's one of the conditions)
-  SauceLabs allows specific sets of appium versions with each device
-  The Gecko driver (for Firefox) has specific values depending on the Selenium version used on BrowserStack

The Platform Configuration files represent all these capabilities and conditions using a novel JSON-based syntax that represents the conditions using rules. The test configurations written by you are parsed and validated against the information in the files, so that you can avoid errors.
