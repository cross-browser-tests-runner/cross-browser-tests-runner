Quick Start
===========

Selenium Tests
--------------

First do the following:

-  For BrowserStack, complete `BrowserStack common steps <#browserstack>`__
-  For SauceLabs, complete `SauceLabs common steps <#saucelabs>`__
-  For CrossBrowserTesting, complete `CrossBrowserTesting common steps <#crossbrowsertesting>`__

Replace ``{platform}`` in the following commands with one of: ``browserstack``, ``saucelabs``, ``crossbrowsertesting``.

.. code:: sh

    $ cp -r ./node_modules/cross-browser-tests-runner/samples/ samples/
    $ ./node_modules/.bin/cbtr-server --native-runner --config ./samples/cbtr-{platform}-selenium.json

JavaScript Unit Tests
---------------------

For any of the following sections first do the following:

-  For BrowserStack, complete `BrowserStack common steps <#browserstack>`__
-  For SauceLabs, complete `SauceLabs common steps <#saucelabs>`__
-  For CrossBrowserTesting, complete `CrossBrowserTesting common steps <#crossbrowsertesting>`__

Using In-built Native Runner
............................

Replace ``{platform}`` in the following commands with one of: ``browserstack``, ``saucelabs``, ``crossbrowsertesting``.

.. code:: sh

    $ cp -r ./node_modules/cross-browser-tests-runner/samples/ samples/
    $ ./node_modules/.bin/cbtr-server --native-runner --config ./samples/cbtr-{platform}-js-testing.json

Using Testem
............

**NOTE**: You need to have a ``testem.json`` with ``src_files`` or ``test_page`` setting.

Replace ``{platform}`` in the following commands with one of: ``browserstack``, ``saucelabs``, ``crossbrowsertesting``.

.. code:: sh

    $ ./node_modules/.bin/cbtr-quick-start -p {platform} -r testem
    $ ./node_modules/.bin/cbtr-server &
    $ testem ci

Common Steps
------------

BrowserStack
............

.. code:: sh

    $ export BROWSERSTACK_USERNAME=<your-browserstack-username>
    $ export BROWSERSTACK_ACCESS_KEY=<your-browserstack-access-key>

SauceLabs
.........

.. code:: sh

    $ export SAUCE_USERNAME=<your-saucelabs-username>
    $ export SAUCE_ACCESS_KEY=<your-saucelabs-access-key>

CrossBrowserTesting
...................

.. code:: sh

    $ export CROSSBROWSERTESTING_USERNAME=<your-crossbrowsertesting-username>
    $ export CROSSBROWSERTESTING_ACCESS_KEY=<your-crossbrowsertesting-access-key>
