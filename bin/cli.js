'use strict';

var actions = {
  install: function install(callback) {
    return require('./actions/install')(callback);
  },
  uninstall: function uninstall(callback) {
    return require('./actions/uninstall')(callback);
  }
};

// Parse command line arguments and call the right action
module.exports = function (_ref) {
  var argv = _ref.argv,
      exit = _ref.exit;

  if (argv && argv.length > 2) {
    var cmd = argv[2];

    if (!actions[cmd]) {
      console.log('Invalid command to go-npm. `install` and `uninstall` are the only supported commands');
      exit(1);
    } else {
      actions[cmd](function (err) {
        if (err) {
          console.error(err);
          exit(1);
        } else {
          exit(0);
        }
      });
    }
  } else {
    console.log('No command supplied. `install` and `uninstall` are the only supported commands');
    exit(1);
  }
};