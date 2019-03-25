'use strict';

var _require = require('path'),
    join = _require.join;

var _require2 = require('fs'),
    existsSync = _require2.existsSync,
    renameSync = _require2.renameSync,
    chmodSync = _require2.chmodSync;

var _require3 = require('../common'),
    getInstallationPath = _require3.getInstallationPath;

function verifyAndPlaceBinary(binName, binPath, callback) {
  if (!existsSync(join(binPath, binName))) {
    return callback('Downloaded binary does not contain the binary specified in configuration - ' + binName);
  }

  getInstallationPath(function (err, installationPath) {
    if (err) {
      return callback(err);
    }

    // Move the binary file and make sure it is executable
    renameSync(join(binPath, binName), join(installationPath, binName));
    chmodSync(join(installationPath, binName), '755');

    console.log('Placed binary on', join(installationPath, binName));

    callback(null);
  });
}

module.exports = verifyAndPlaceBinary;