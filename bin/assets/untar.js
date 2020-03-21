'use strict';

var tar = require('tar');
var zlib = require('zlib');

/**
 * Unzip strategy for resources using `.tar.gz`.
 *
 * First we will Un-GZip, then we will untar. So once untar is completed,
 * binary is downloaded into `binPath`. Verify the binary and call it good.
 */
function untar(_ref) {
  var opts = _ref.opts,
      req = _ref.req,
      onSuccess = _ref.onSuccess,
      onError = _ref.onError;


  var ungz = zlib.createGunzip();
  var untar = tar.Extract({ path: opts.binPath });

  ungz.on('error', onError);
  untar.on('error', onError);
  untar.on('end', onSuccess);

  req.pipe(ungz).pipe(untar);
}

module.exports = untar;