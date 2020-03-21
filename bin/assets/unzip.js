'use strict';

var unzipper = require('unzipper');

/**
 * Unzip strategy for resources using `.zip`.
 *
 * Once unzip is completed, binary is downloaded into `binPath`.
 * Verify the binary and call it good.
 */
function unzip(_ref) {
  var opts = _ref.opts,
      req = _ref.req,
      onSuccess = _ref.onSuccess,
      onError = _ref.onError;


  var unzip = unzipper.Extract({ path: opts.binPath });

  unzip.on('error', onError);
  unzip.on('close', onSuccess);

  req.pipe(unzip);
}

module.exports = unzip;