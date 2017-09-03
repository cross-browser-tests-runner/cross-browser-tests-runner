/** global: cbtrReportErrorsOnly */
/** global: cbtrDontReportTraces */

var __keys = [ 'passed', 'failed', 'skipped', 'total', 'duration' ];

function __getFailures(items) {
  var results = [ ], idx, trace;
  for(idx = 0; idx < items.length; ++idx) {
    if(!items[idx].passed_) {
      delete items[idx].passed_;
      trace = items[idx].trace;
      items[idx].trace = {
        stack: !cbtrDontReportTraces && trace.stack,
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
    __handleSpec(specs[idx], data)
  }
  for(idx = 0; idx < suites.length; ++idx) {
    __handleSuite(suites[idx], data, idx);
  }
  return data;
}

function __handleSpec(spec, data) {
  var results = spec.results();
  var record = {
    description: spec.description,
    duration: spec.duration,
    passed: results.passedCount === results.totalCount,
    skipped: results.skipped,
    failures: __getFailures(results.getItems())
  }
  record.failed = !(record.passed || record.skipped);
  __updateSpecResults(record, data);
  __checkAndIncludeSpec(record, data);
  delete record.failed;
}

var statusKeys = ['passed', 'failed', 'skipped'];

function __updateSpecResults(record, data) {
  for(var idx = 0; idx < statusKeys.length; ++idx) {
    var status = statusKeys[idx];
    if(record[status]) {
      ++data[status];
    }
  }
  data.duration += record.duration;
  ++data.total;
}

function __checkAndIncludeSpec(record, data) {
  if(!cbtrReportErrorsOnly || record.failed) {
    data.specs.push(record)
  }
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
