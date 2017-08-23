'use strict'

exports.msleep = function(ms) {
  const start = (new Date()).getTime()
  let end
  do {
    for(let x = 0; x < 100; ++x){
      /** some comment */
    }
    end = (new Date()).getTime()
  }
  while((end - start) < ms)
}

exports.sleep = function(sec) {
  exports.msleep(sec * 1000)  
}
