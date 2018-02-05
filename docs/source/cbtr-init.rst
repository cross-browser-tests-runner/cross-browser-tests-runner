cbtr-init
=========

This executable binary takes a browsers YAML file as input and outputs a cross-browser-tests-runner test settings file.

Usage
-----

.. code-block:: sh

    $ ./node_modules/.bin/cbtr-init [--help|-h] [--input|-i <browsers-yaml-file>] [--output|-o <cbtr-settings-file>]
    Defaults:
     input             .cbtr-browsers.yml in project root
     output            cbtr.json in project root

    Options:
     help              print this help
     input             input data of browsers to use in a compact format
     output            cross-browser-tests-runner settings file

Defaults
--------

As can be seen in the usage section above, defaults can be used for
command line parameters.

+-----------------------------------+-----------------------------------+
| Parameter                         | Default value                     |
+===================================+===================================+
| ``-i|--input``                    | ``.cbtr-browsers.yml`` file in    |
|                                   | root directory of your project    |
+-----------------------------------+-----------------------------------+
| ``-o|--output``                   | ``cbtr.json`` file in root        |
|                                   | directory of your project         |
+-----------------------------------+-----------------------------------+
