var __keys = [ 'passed', 'failed', 'skipped', 'total', 'duration' ];

function __getFailures(items) {
  var results = [ ], idx, trace;
  for(idx = 0; idx < items.length; ++idx) {
    if(!items[idx].passed_) {
      delete items[idx].passed_;
      trace = items[idx].trace;
      items[idx].trace = {
        stack: trace.stack,
        message: trace.message,
        file: trace.fileName,
        line: trace.lineNumber,
        column: trace.columnNumber
      }
      results.push(items[idx]);
    }
  }
  return results;
}

function __processSuite(suite) {
  var data = {
    description: suite.description,
    specs: [ ],
    suites: [ ],
    passed: 0,
    failed: 0,
    skipped: 0,
    total: 0,
    duration: 0
  },
  specs = suite.specs(),
  suites = suite.suites(),
  idx;
  for(idx = 0; idx < specs.length; ++idx) {
    __handleSpec(specs[idx], data, idx);
  }
  for(idx = 0; idx < suites.length; ++idx) {
    __handleSuite(suites[idx], data, idx);
  }
  return data;
}

function __handleSpec(spec, data, idx) {
  var results = spec.results();
  data.specs.push({
    description: spec.description,
    duration: spec.duration,
    passed: results.passedCount === results.totalCount,
    skipped: results.skipped,
    failures: __getFailures(results.getItems())
  })
  data.passed += (data.specs[idx].passed ? 1 : 0);
  data.failed += (!data.specs[idx].passed && !data.specs[idx].skipped ? 1 : 0);
  data.skipped += (data.specs[idx].skipped ? 1 : 0);
  data.duration += data.specs[idx].duration;
  ++data.total;
}

function __handleSuite(suite, data, idx) {
  var keyIdx;
  data.suites[idx] = __processSuite(suite);
  for(keyIdx = 0; keyIdx < __keys.length; ++keyIdx) {
    data[__keys[keyIdx]] += data.suites[idx][__keys[keyIdx]];
  }
}

/** global: jasmine */
jasmine.CbtrReporter = function() {
}

/** global: jasmine */
jasmine.CbtrReporter.prototype = {

  /*reportRunnerStarting: function (runner) {
    // nothing to do
  },*/

  reportSpecStarting: function (spec) {
    spec.started = (new Date()).getTime();
  },

  reportSpecResults: function (spec) {
    spec.ended = (new Date()).getTime();
    spec.duration = spec.ended - spec.started;
  },

  /*reportSuiteResults: function (suite) {
  },*/

  reportRunnerResults: function (runner) {
    var
      suites = runner.suites(), idx, counter = 0, keyIdx,
      results = { suites: [ ], passed: 0, failed: 0, skipped: 0, total: 0, duration: 0 };
    for(idx = 0; idx < suites.length; ++idx) {
      if(null === suites[idx].parentSuite) {
        results.suites.push(__processSuite(suites[idx]));
        for(keyIdx = 0; keyIdx < __keys.length; ++keyIdx) {
          results[__keys[keyIdx]] += results.suites[counter][__keys[keyIdx]];
        }
        ++counter;
      }
    }
    /** global: CrossBrowserTestsRunner */
    CrossBrowserTestsRunner.runEnd(results, function() {
      // do nothing
    })
  }
}

jasmine.getEnv().addReporter(new jasmine.CbtrReporter)
