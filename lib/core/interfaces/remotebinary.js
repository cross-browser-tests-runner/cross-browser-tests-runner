'use strict';

class RemoteBinary {

  exists() {
    throw new Error('RemoteBinary.exists')
  }

  fetch() {
    throw new Error('RemoteBinary.fetch')
  }

  remove() {
    throw new Error('RemoteBinary.remove')
  }
}

exports.RemoteBinary = RemoteBinary
