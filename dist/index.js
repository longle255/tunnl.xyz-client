function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _tunnl = require('./tunnl');

var _tunnl2 = _interopRequireDefault(_tunnl);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

process.env.NODE_ENV = 'development';
process.env.TUNNL_LOG = 'debug';
process.env.TUNNL_ROOT_DIR = _path2['default'].join(__dirname, '../');

// assign global variable
global.Promise = _bluebird2['default'];
global._ = _lodash2['default'];
global.Tunnl = _tunnl2['default'];
_tunnl2['default'].start();