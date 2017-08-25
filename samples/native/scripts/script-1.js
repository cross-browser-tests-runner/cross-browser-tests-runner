'use strict'

exports.script = (driver, webdriver) => {
  return driver.findElement({id: 'test-message'})
  .then(el => {
    return el.getText()
  })
  .then(text => {
    console.log('Selenium Test Script: text of #test-message %s', text)
    return true
  })
}

exports.decider = (driver, webdriver) => {
  return Promise.resolve(true)
}
