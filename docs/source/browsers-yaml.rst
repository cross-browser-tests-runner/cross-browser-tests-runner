Browsers YAML
=============

A typical cross-browser test involves running your code on multiple browsers. Specifying them in the form of what is referred as "Selenium capabilities" and managing them becomes complex as it requires too much of code.

Cross-browser-tests-runner provides you with a compact and smart format in which you can specify the browsers. This helps you manage the browsers to be used in your tests more efficiently.

Format
------

Example
~~~~~~~

.. code:: yaml

    CrossBrowserTesting:
      JS:
        Windows:
          "10":
            Chrome x64:
              "45.0-49.0, 54.0":
                resolution: 1920x1200
        Android:
          "6.0":
            Dolphin Mobile:
              "11.5":
                Android Nexus 9:
            Maxthon Mobile:
              "4.3":
                Android Nexus 9:
                  resolution: 1536x2048
      Selenium:
        OS X:
          El Capitan:
            Safari:
              "9.0":
                resolution: 2560x1440
        iOS:
          "9.3":
            iPhone 6s Plus Simulator, iPad Pro Simulator:

Variations
~~~~~~~~~~

The example above illustrates 3 variations of the format.

Desktop Browsers
................

.. code:: yaml

    {Platform}:
      {TestType}:
        {OS}:
          {Os Version}:
            {Browser}:
              {Browser Versions}:
                {Properties}

Mobile Browsers
...............

.. code:: yaml

    {Platform}:
      {TestType}:
        {OS}:
          {Os Version}:
            {Browser}:
              {Browser Versions}:
                {Devices}:
                  {Properties}

Single-Version Native Mobile Browsers
.....................................

There are cases where a mobile device has exactly one browser that either has exactly one version or has a null version. In such cases, the browser details **must** be skipped, and the format looks like the following:

.. code:: yaml

    {Platform}:
      {TestType}:
        {OS}:
          {Os Version}:
            {Devices}:
              {Properties}

Parameters
~~~~~~~~~~

+-----------------------------------+-----------------------------------+
| Parameter                         | Values                            |
+===================================+===================================+
| ``Platform``                      | ``BrowserStack``, ``SauceLabs``,  |
|                                   | ``CrossBrowserTesting``           |
+-----------------------------------+-----------------------------------+
| ``Test Type``                     | ``JS``, ``Selenium``              |
+-----------------------------------+-----------------------------------+
| ``OS``                            | Any of the OSes specified in      |
|                                   | platform-specific configuration   |
|                                   | for the given ``Platform`` and    |
|                                   | ``Test Type`` e.g.                |
|                                   | node_modules/cross-browser-test\  |
|                                   | s-runner/conf/browserstack-conf.j\|
|                                   | son                               |
|                                   | for ``BrowserStack``              |
+-----------------------------------+-----------------------------------+
| ``OS Version``                    | Any of the versions available for |
|                                   | the chosen ``OS`` in              |
|                                   | platform-specific configuration   |
+-----------------------------------+-----------------------------------+
| ``Browser``                       | Any of the browsers available for |
|                                   | the chosen ``OS Version`` in      |
|                                   | platform-specific configuration   |
+-----------------------------------+-----------------------------------+
| ``Browser Versions``              | A comma-separated list of         |
|                                   | versions from those available for |
|                                   | the chosen ``Browser`` in         |
|                                   | platform-specific configuration.  |
|                                   | As can be seen in the example     |
|                                   | above, a range of versions can be |
|                                   | specified e.g. 12.0-19.0.         |
+-----------------------------------+-----------------------------------+
| ``Devices``                       | A comma-separated list of devices |
|                                   | from those available for the      |
|                                   | chosen ``Browser`` in             |
|                                   | platform-specific configuration   |
+-----------------------------------+-----------------------------------+
| ``Properties``                    | Capabilities like resolution,     |
|                                   | orientation etc. from those       |
|                                   | available for the chosen          |
|                                   | ``Browser``/``Device`` in         |
|                                   | platform-specific configuration.  |
|                                   | See `Properties <#properties>`__  |
|                                   | for details.                      |
+-----------------------------------+-----------------------------------+

**NOTE**: Please use double quotes around numeric values to avoid unwanted errors caused by the YAML parser.

Properties
..........

+----------------------+---------------+-------------+-------------+-------------+
| Property             | Values        | BrowserStac\| SauceLabs   | CrossBrowse\|
|                      |               | k           |             | rTesting    |
+======================+===============+=============+=============+=============+
| ``deviceType``       | ``phone``     | ✗           | ✓           | ✗           |
|                      | ``tablet``    |             |             |             |
|                      |               |             |             |             |
+----------------------+---------------+-------------+-------------+-------------+
| ``resolution``       | ``string``    | ✓           | ✓           | ✓           |
|                      | type          |             |             |             |
+----------------------+---------------+-------------+-------------+-------------+
| ``orientation``      | ``portrait``  | ✓           | ✓           | ✓           |
|                      | ``landscape`` |             |             |             |
|                      |               |             |             |             |
+----------------------+---------------+-------------+-------------+-------------+
| ``isPhysicalDevice`` | ``true``      | ✓           | ✗           | ✗           |
|                      | ``false``     |             |             |             |
+----------------------+---------------+-------------+-------------+-------------+

Multiple Copies
---------------

You can create this file anywhere in your project, and you can have multiple such files if you have various tests, with each using different sets of browsers.

Samples
-------

``./node_modules/cross-browser-tests-runner/samples/yml/*.yml``
