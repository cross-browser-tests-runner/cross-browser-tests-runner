'use strict';

let
  platform = require('./../core/platform'),
  PlatformBase = platform.Platform,
  Values = require('./values').Values,
  Job = require('./job').Job,
  ScriptJob = require('./scriptjob').ScriptJob,
  Tunnel = require('./tunnel').Tunnel,
  Manager = require('./manager').Manager

class Platform extends PlatformBase {

  constructor() {
    super(Values, Tunnel, Manager, undefined, /cbt-tunnels/, Job, ScriptJob)
  }

}

exports.Platform = Platform
