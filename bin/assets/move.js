'use strict';

var _require = require('path'),
    join = _require.join;

var _require2 = require('fs'),
    createWriteStream = _require2.createWriteStream;

/**
 * Move strategy for binary resources without compression.
 */


function move(_ref) {
  var opts = _ref.opts,
      req = _ref.req,
      onSuccess = _ref.onSuccess,
      onError = _ref.onError;


  var stream = createWriteStream(join(opts.binPath, opts.binName));

  stream.on('error', onError);
  stream.on('close', onSuccess);

  req.pipe(stream);
}

module.exports = move;