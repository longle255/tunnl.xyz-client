function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

_winston2['default'].setLevels({
  silly: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4
});

_winston2['default'].addColors({
  silly: 'magenta',
  debug: 'green',
  info: 'cyan',
  warn: 'yellow',
  error: 'red'
});

_winston2['default'].remove(_winston2['default'].transports.Console);

_winston2['default'].add(_winston2['default'].transports.Console, {
  level: 'debug',
  colorize: true
});

/**
 * get logger for specific module
 * @param  {string} module module tag will be appended to logging line
 * @return {logger} logger instance
 */
_winston2['default'].getLogger = function (module) {
  if (!module) {
    module = 'generic';
  } else if (typeof module !== 'string') {
    module = _path2['default'].basename(module.filename);
  }
  _winston2['default'].loggers.add(module, {
    'console': {
      level: process.env.TUNNL_LOG || 'info',
      colorize: true,
      label: module
    },
    'file': {
      'filename': _path2['default'].join(process.env.TUNNL_ROOT_DIR, './logs/output.log')
    }
  });
  return _winston2['default'].loggers.get(module);
};

// export
module.exports = _winston2['default'];