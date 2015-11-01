Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = localtunnel;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _tunnel = require('./tunnel');

var _tunnel2 = _interopRequireDefault(_tunnel);

function localtunnel(port, opt, fn) {
  if (typeof opt === 'function') {
    fn = opt;
    opt = {};
  }

  opt = opt || {};
  opt.port = port;

  var client = new _tunnel2['default'](opt);
  client.open(function (err) {
    if (err) {
      return fn(err);
    }

    fn(null, client);
  });
  return client;
}

module.exports = exports['default'];