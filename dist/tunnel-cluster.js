Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _headerHostTransformer = require('./header-host-transformer');

var _headerHostTransformer2 = _interopRequireDefault(_headerHostTransformer);

var log = _logger2['default'].getLogger(module);
var EventEmitter = _events2['default'].EventEmitter;

var TunnelCluster = (function (_EventEmitter) {
  _inherits(TunnelCluster, _EventEmitter);

  function TunnelCluster(options) {
    _classCallCheck(this, TunnelCluster);

    _get(Object.getPrototypeOf(TunnelCluster.prototype), 'constructor', this).call(this);
    this.options = options;
  }

  _createClass(TunnelCluster, [{
    key: 'onRemoteClose',
    value: function onRemoteClose() {
      log.debug('remote close');
      this.emit('dead');
      this.local.end();
    }
  }, {
    key: 'onRemoteConnect',
    value: function onRemoteConnect() {
      var _this = this;

      this.emit('open', this.remote);
      if (this.remote.destroyed) {
        log.debug('remote destroyed');
        this.emit('dead');
        return;
      }

      log.debug('connecting locally to %s:%d', this.options.localHost, this.options.localPort);
      this.remote.pause();

      // connection to local http server
      this.local = _net2['default'].connect({
        host: this.options.localHost,
        port: this.options.localPort
      });

      this.remote.once('close', this.onRemoteClose.bind(this));

      // TODO some languages have single threaded servers which makes opening up
      // multiple local connections impossible. We need a smarter way to scale
      // and adjust for such instances to avoid beating on the door of the server
      this.local.once('error', function (err) {
        log.debug('local error %s', err.message);
        _this.local.end();

        _this.remote.removeListener('close', _this.onRemoteClose);

        if (err.code !== 'ECONNREFUSED') {
          return _this.remote.end();
        }

        // retrying connection to local server
        setTimeout(_this.onRemoteConnect.bind(_this), 1000);
      });

      this.local.once('connect', function () {
        log.debug('connected locally');
        _this.remote.resume();

        var stream = _this.remote;

        // if user requested specific local host
        // then we use host header transform to replace the host header
        if (_this.options.localHost) {
          log.debug('transform Host header to %s', _this.options.localHost);
          stream = _this.remote.pipe((0, _headerHostTransformer2['default'])({
            host: _this.options.localHost
          }));
        }

        stream.pipe(_this.local).pipe(_this.remote);

        // when local closes, also get a new remote
        _this.local.once('close', function (error) {
          return log.debug('local connection closed [%s]', error);
        });
      });
    }
  }, {
    key: 'open',
    value: function open() {
      var _this2 = this;

      log.debug('establishing tunnel %s:%s <> %s:%s', this.options.localHost, this.options.localPort, this.options.remoteHost, this.options.remotePort);

      // connection to localtunnel server
      this.remote = _net2['default'].connect({
        host: this.options.remoteHost,
        port: this.options.remotePort
      });

      this.remote.setKeepAlive(true);

      this.remote.on('error', function (err) {
        // emit connection refused errors immediately, because they
        // indicate that the tunnel can't be established.
        if (err.code === 'ECONNREFUSED') {
          _this2.emit('error', new Error('connection refused: ' + _this2.options.remoteHost + ':' + _this2.options.remotePort + ' (check your firewall settings)'));
        }
        _this2.remote.end();
      });

      // tunnel is considered open when remote connects
      this.remote.once('connect', this.onRemoteConnect.bind(this));
      // this.remote.once('connect', function() {
      //   this.emit('open', remote);
      //   conn_local();
      // });
    }
  }]);

  return TunnelCluster;
})(EventEmitter);

exports['default'] = TunnelCluster;
module.exports = exports['default'];