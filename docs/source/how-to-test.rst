How To Test
===========

Initial Common Steps
--------------------

Environment Settings
~~~~~~~~~~~~~~~~~~~~

BrowserStack
............

.. code:: bash

    $ export BROWSERSTACK_USERNAME=<your-browserstack-username>
    $ export BROWSERSTACK_ACCESS_KEY=<your-browserstack-access-key>

SauceLabs
.........

.. code:: bash

    $ export SAUCE_USERNAME=<your-saucelabs-username>
    $ export SAUCE_ACCESS_KEY=<your-saucelabs-access-key>

CrossBrowserTesting
...................

.. code:: bash

    $ export CROSSBROWSERTESTING_USERNAME=<your-crossbrowsertesting-username>
    $ export BROWSECROSSBROWSERTESTINGRSTACK_ACCESS_KEY=<your-crossbrowsertesting-access-key>

Update Supported Browsers (Optional)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

See :doc:`platform-configuration` for the significance and details of this step.

Replace ``{platform}`` in the command below with any of: ``browserstack``, ``saucelabs``, ``crossbrowsertesting``.

.. code:: bash

    $ ./node_modules/.bin/cbtr-{platform}-update

Specify Your Browsers
~~~~~~~~~~~~~~~~~~~~~

See :doc:`browsers-yaml` for details on how to specify browsers for your tests.

Here is a list of few sample files you can use, if you want to understand the format later:

-  BrowserStack sample:
   ``./node_modules/cross-browser-tests-runner/samples/yml/browserstack.yml``
-  SauceLabs sample:
   ``./node_modules/cross-browser-tests-runner/samples/yml/saucelabs.yml``
-  CrossBrowserTesting sample:
   ``./node_modules/cross-browser-tests-runner/samples/yml/crossbrowsertesting.yml``

Generate Test Settings
~~~~~~~~~~~~~~~~~~~~~~

See :doc:`settings` for details on the JSON format test settings ``cross-browser-tests-runner`` uses.

Generate it using the following command that uses the browsers YAML file as input:

.. code:: bash

    $ ./node_modules/.bin/cbtr-init --input <path-to-browsers-yml-file> --output <path-to-settings-file>

See :doc:`cbtr-init` for usage and how to use defaults for the command line input options.

JavaScript Unit Testing
-----------------------

First complete the `Initial Common Steps <#initial-common-steps>`__, as applicable.

Using Native Runner
~~~~~~~~~~~~~~~~~~~

To run your tests using :doc:`native-runner`, add the following parameters in your test settings file:

-  ``framework`` (See :ref:`settings-parameters`) - the JavaScript unit test framework used in your tests
-  ``test_file`` (See :ref:`settings-parameters`) - the local HTML file that your test would open (See :ref:`native-runner-test-html`)

Run the following:

.. code:: bash

    $ ./node_modules/.bin/cbtr-server --native-runner --config <path-to-settings-file>

This would run all your tests and exit once completed.

See :doc:`server` for details on ``cbtr-server`` command.

.. _how-to-test-using-testem:

Using Testem
~~~~~~~~~~~~

Generate the Testem configuration file ``testem.json`` for your platform.

Replace {platform} in the command below with one of: ``browserstack``, ``saucelabs``, ``crossbrowsertesting``.

.. code:: bash

    $ ./node_modules/.bin/cbtr-testem-{platform}-init --input <path-to-settings-file> --output <path-to-testem-json>

..

    It would overwrite ``launchers`` and ``launch_in_ci`` settings in an existing testem settings file

See the following for details on platform-specific executable binaries for generating testem settings:

-  :doc:`cbtr-testem-browserstack-init`
-  :doc:`cbtr-testem-saucelabs-init`
-  :doc:`cbtr-testem-crossbrowsertesting-init`

Run the cross-browser-tests-runner server using the following command:

.. code:: bash

    $ ./node_modules/.bin/cbtr-server &

Now run testem in CI mode as follows:

.. code:: bash

    $ testem ci

Selenium Testing
----------------

First complete the `Initial Common Steps <#initial-common-steps>`__, as applicable.

Add the following parameters in the test settings file:

-  ``test_file`` (See :ref:`settings-parameters`) - the local HTML file that your test would open
-  ``test_script`` (See :ref:`settings-parameters`) - a file that contains your Selenium test script (See :ref:`native-runner-test-script`)

Run the cross-browser-tests-runner server using the following command:

.. code:: bash

    $ ./node_modules/.bin/cbtr-server --native-runner --config <path-to-settings-file>

This would run all your tests and exit once completed.
