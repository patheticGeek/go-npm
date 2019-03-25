'use strict';

var _require = require('path'),
    join = _require.join;

var _require2 = require('fs'),
    unlinkSync = _require2.unlinkSync;

var _require3 = require('../common'),
    parsePackageJson = _require3.parsePackageJson,
    getInstallationPath = _require3.getInstallationPath;

function uninstall(callback) {
    var _parsePackageJson = parsePackageJson(),
        binName = _parsePackageJson.binName;

    getInstallationPath(function (err, installationPath) {
        if (err) {
            return callback(err);
        }

        try {
            unlinkSync(join(installationPath, binName));
        } catch (ex) {
            // Ignore errors when deleting the file.
        }

        return callback(null);
    });
}

module.exports = uninstall;