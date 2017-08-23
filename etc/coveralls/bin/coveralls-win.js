#!/usr/bin/env node

var fs = require('fs');
var handleInput = require('../lib/handleInput');

var argv = process.argv.slice(2);
if(!argv.length) {
  throw new Error('Please specify the path to lcov.info file');
}

fs.readFile(argv[0], {encoding: 'utf8'}, function(err, data) {
  if(err) {
    throw err;
  }
  handleInput(data, function(err) {
    if (err) {
      throw err;
    }
  });
});

