(function(ns) {

  ns.runEnd = function(results, callback) {
    post('run', results, function() {
      if(window.__coverage__) {
        ns.coverage(window.__coverage__, callback)
      }
      else {
        callback()
      }
    }, Math.random())
  }

  ns.coverage = function(coverage, callback) {
    post('coverage', coverage, callback, Math.random())
  }

  function post(relative, data, callback, id) {
    var req = getXhr();
    req.open("POST", '/cbtr/' + relative + (window.location.search ? window.location.search : ''), true);
    req.onreadystatechange = function () {
      if (4 === req.readyState) {
        if(0 === req.status) {
          retryPost(relative, data, callback, id);
        } else {
          callback(req.responseText);
        }
      }
    };
    req.setRequestHeader('Content-type', 'application/json');
    req.send(JSON.stringify(data));
  }

  function getXhr() {
    if (window.ActiveXObject) {
      return new window.ActiveXObject('Microsoft.XMLHTTP');
    } else if (window.XMLHttpRequest) {
      return new window.XMLHttpRequest();
    } else {
      throw new Error("No AJAX support in browser");
    }
  }

  var retries = { }

  function retryPost(relative, data, callback, id) {
    var idStr = id.toString();
    if(!retries[idStr]) {
      retries[idStr] = 1;
    }
    if(retries[idStr] <= 5) {
      setTimeout(function(){
        post(relative, data, callback, id);
      }, Math.pow(2, retries[idStr]) * 1000)
      ++retries[idStr];
    }
  }

}(window.CrossBrowserTestsRunner = { }))
