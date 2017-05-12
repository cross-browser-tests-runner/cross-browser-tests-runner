'use strict';

class RemoteBinary {

  exists() {
    throw new Error('RemoteBinary.exists: Not implemented')
  }

  fetch() {
    throw new Error('RemoteBinary.fetch: Not implemented')
  }

  remove() {
    throw new Error('RemoteBinary.remove: Not implemented')
  }
}

exports.RemoteBinary = RemoteBinary
