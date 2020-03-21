'use strict';

var mkdirp = require('mkdirp');
var request = require('request');

var _require = require('../common'),
    parsePackageJson = _require.parsePackageJson;

var verifyAndPlaceBinary = require('../assets/binary');

/**
 * Select a resource handling strategy based on given options.
 */
function getStrategy(_ref) {
    var url = _ref.url;


    if (url.endsWith('.tar.gz')) {
        return require('../assets/untar');
    } else if (url.endsWith('.zip')) {
        return require('../assets/unzip');
    } else {
        return require('../assets/move');
    }
}

/**
 * Reads the configuration from application's package.json,
 * validates properties, downloads the binary, untars, and stores at
 * ./bin in the package's root. NPM already has support to install binary files
 * specific locations when invoked with "npm install -g"
 *
 *  See: https://docs.npmjs.com/files/package.json#bin
 */
function install(callback) {

    var opts = parsePackageJson();
    if (!opts) return callback('Invalid inputs');

    mkdirp.sync(opts.binPath);

    console.log('Downloading from URL: ' + opts.url);

    var req = request({ uri: opts.url });

    req.on('error', function () {
        return callback('Error downloading from URL: ' + opts.url);
    });
    req.on('response', function (res) {
        if (res.statusCode !== 200) return callback('Error downloading binary. HTTP Status Code: ' + res.statusCode);

        var strategy = getStrategy(opts);

        strategy({
            opts: opts,
            req: req,
            onSuccess: function onSuccess() {
                return verifyAndPlaceBinary(opts.binName, opts.binPath, callback);
            },
            onError: callback
        });
    });
}

module.exports = install;