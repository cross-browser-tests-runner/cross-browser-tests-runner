(function(ns) {

  ns.runEnd = function(results, callback) {
    post('run', results, function() {
      if(window.__coverage__) {
        ns.coverage(window.__coverage__, callback)
      }
      else {
        callback()
      }
    })
  }

  ns.coverage = function(coverage, callback) {
    post('coverage', coverage, callback)
  }

  function post(relative, data, callback) {
    var req;
    if (window.ActiveXObject) {
      req = new window.ActiveXObject('Microsoft.XMLHTTP');
    } else if (window.XMLHttpRequest) {
      req = new window.XMLHttpRequest();
    } else {
      throw "No AJAX support in browser";
    }
    req.open("POST", '/cbtr/' + relative + (window.location.search ? window.location.search : ''), true);
    req.onreadystatechange = function () {
      if (4 === req.readyState) {
        callback(req.responseText);
      }
    };
    req.setRequestHeader('Content-type', 'application/json');
    req.send(JSON.stringify(data));
  }

}(window.CrossBrowserTestsRunner = { }))
