'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _require = require('path'),
    join = _require.join;

var _require2 = require('child_process'),
    exec = _require2.exec;

var _require3 = require('fs'),
    existsSync = _require3.existsSync,
    readFileSync = _require3.readFileSync;

var mkdirp = require('mkdirp');

// Mapping from Node's `process.arch` to Golang's `$GOARCH`
var ARCH_MAPPING = {
  ia32: '386',
  x64: 'amd64',
  arm: 'arm'
};

// Mapping between Node's `process.platform` to Golang's
var PLATFORM_MAPPING = {
  darwin: 'darwin',
  linux: 'linux',
  win32: 'windows',
  freebsd: 'freebsd'
};

function getInstallationPath(callback) {

  // `npm bin` will output the path where binary files should be installed
  exec('npm bin', function (err, stdout, stderr) {

    var dir = null;
    if (err || stderr || !stdout || stdout.length === 0) {

      // We couldn't infer path from `npm bin`. Let's try to get it from
      // Environment variables set by NPM when it runs.
      // npm_config_prefix points to NPM's installation directory where `bin` folder is available
      // Ex: /Users/foo/.nvm/versions/node/v4.3.0
      var env = process.env;

      if (env && env.npm_config_prefix) {
        dir = join(env.npm_config_prefix, 'bin');
      } else {
        return callback(new Error('Error finding binary installation directory'));
      }
    } else {
      dir = stdout.trim();
    }

    mkdirp.sync(dir);

    callback(null, dir);
  });
}

function validateConfiguration(_ref) {
  var version = _ref.version,
      goBinary = _ref.goBinary;


  if (!version) {
    return "'version' property must be specified";
  }

  if (!goBinary || (typeof goBinary === 'undefined' ? 'undefined' : _typeof(goBinary)) !== 'object') {
    return "'goBinary' property must be defined and be an object";
  }

  if (!goBinary.name) {
    return "'name' property is necessary";
  }

  if (!goBinary.path) {
    return "'path' property is necessary";
  }

  if (!goBinary.url) {
    return "'url' property is required";
  }
}

function getUrl(url, process) {
  if (typeof url === 'string') {
    return url;
  }

  var _url = void 0;

  if (url[process.platform]) {
    _url = url[process.platform];
  } else {
    _url = url.default;
  }

  if (typeof _url === 'string') {
    return _url;
  }

  if (_url[process.arch]) {
    _url = _url[process.arch];
  } else {
    _url = _url.default;
  }

  return _url;
}

function parsePackageJson() {
  if (!(process.arch in ARCH_MAPPING)) {
    console.error('Installation is not supported for this architecture: ' + process.arch);
    return;
  }

  if (!(process.platform in PLATFORM_MAPPING)) {
    console.error('Installation is not supported for this platform: ' + process.platform);
    return;
  }

  var packageJsonPath = join('.', 'package.json');
  if (!existsSync(packageJsonPath)) {
    console.error('Unable to find package.json. ' + 'Please run this script at root of the package you want to be installed');
    return;
  }

  var packageJson = JSON.parse(readFileSync(packageJsonPath));
  var error = validateConfiguration(packageJson);

  if (error && error.length > 0) {
    console.error('Invalid package.json: ' + error);
    return;
  }

  // We have validated the config. It exists in all its glory
  var binPath = packageJson.goBinary.path;
  var binName = packageJson.goBinary.name;
  var url = getUrl(packageJson.goBinary.url, process);
  var version = packageJson.version;

  if (!url) {
    console.error('Could not find url matching platform and architecture');
    return;
  }

  if (version[0] === 'v') version = version.substr(1); // strip the 'v' if necessary v0.0.1 => 0.0.1

  // Binary name on Windows has .exe suffix
  if (process.platform === 'win32') {
    binName += '.exe';

    url = url.replace(/{{win_ext}}/g, '.exe');
  } else {
    url = url.replace(/{{win_ext}}/g, '');
  }

  // Interpolate variables in URL, if necessary
  url = url.replace(/{{arch}}/g, ARCH_MAPPING[process.arch]);
  url = url.replace(/{{platform}}/g, PLATFORM_MAPPING[process.platform]);
  url = url.replace(/{{version}}/g, version);
  url = url.replace(/{{bin_name}}/g, binName);

  return {
    binName: binName,
    binPath: binPath,
    url: url,
    version: version
  };
}

module.exports = { parsePackageJson: parsePackageJson, getUrl: getUrl, getInstallationPath: getInstallationPath };