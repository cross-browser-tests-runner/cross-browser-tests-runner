describe('Core', function() {
  if(process.version > 'v6') {
    require('./core/scriptjob')
  }
})
