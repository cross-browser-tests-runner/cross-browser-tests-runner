Troubleshooting
===============

Add ``LOG_LEVEL=DEBUG`` to any of the utilities/commands on Linux/OSX, or export ``LOG_LEVEL`` as an environment variable on Windows before running them. For example:

.. code-block:: sh

    $ LOG_LEVEL=DEBUG ./node_modules/.bin/cbtr-init

Supported logging levels: ``DEBUG``, ``INFO``, ``WARN``, and ``ERROR``, with ``DEBUG``
producing most verbose logging.

Default logging level: ``ERROR``
