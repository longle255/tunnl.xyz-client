Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _tunnelCluster = require('./tunnel-cluster');

var _tunnelCluster2 = _interopRequireDefault(_tunnelCluster);

var log = _logger2['default'].getLogger(module);
var EventEmitter = _events2['default'].EventEmitter;

var Tunnel = (function (_EventEmitter) {
  _inherits(Tunnel, _EventEmitter);

  function Tunnel(options) {
    _classCallCheck(this, Tunnel);

    _get(Object.getPrototypeOf(Tunnel.prototype), 'constructor', this).call(this);
    this._closed = false;
    this.options = options || {};

    this.options.host = this.options.host || 'https://tunnl.xyz';
  }

  _createClass(Tunnel, [{
    key: '_init',
    value: function _init(cb) {
      var params = {
        path: '/',
        json: true,
        method: 'POST'
      };

      var baseUri = this.options.host + '/';

      // optionally override the upstream server
      var upstream = _url2['default'].parse(this.options.host);

      // no subdomain at first, maybe use requested domain
      var assignedDomain = this.options.subdomain;
      if (assignedDomain) {
        params.body = {
          requestedId: assignedDomain
        };
      }
      // where to quest
      params.uri = baseUri;
      console.log(params);
      (function getUrl() {
        _request2['default'].post(params, function (err, res, body) {
          if (err) {
            // TODO (shtylman) don't print to stdout?
            console.log('tunnel server offline: ' + err.message + ', retry 1s');
            return setTimeout(getUrl, 1000);
          }
          if (res.statusCode !== 200) {
            var retErr = new Error(body && body.message || 'localtunnel server returned an error, please try again');
            return cb(retErr);
          }

          var port = body.port;
          var host = upstream.hostname;

          var maxConn = body.maxConn_count || 1;

          cb(null, {
            remote_host: upstream.hostname,
            remote_port: body.port,
            name: body.id,
            url: body.url,
            maxConn: maxConn
          });
        });
      })();
    }
  }, {
    key: '_establish',
    value: function _establish(info) {
      var _this = this;

      var options = this.options;

      // increase max event listeners so that localtunnel consumers don't get
      // warning messages as soon as they setup even one listener. See #71
      this.setMaxListeners(info.maxConn + (EventEmitter.defaultMaxListeners || 10));

      info.local_host = options.local_host;
      info.local_port = options.port;

      var tunnels = this.tunnel_cluster = (0, _tunnelCluster2['default'])(info);

      // only emit the url the first time
      tunnels.once('open', function () {
        return _this.emit('url', info.url);
      });

      var tunnelCount = 0;

      // track open count
      tunnels.on('open', function (tunnel) {
        tunnelCount++;
        log.debug('tunnel open [total: %d]', tunnelCount);

        if (_this._closed) {
          return tunnel.destroy();
        }

        _this.once('close', function () {
          return tunnel.destroy();
        });
        tunnel.once('close', function () {
          return _this.removeListener('close', function () {
            return tunnel.destroy();
          });
        });
      });

      // when a tunnel dies, open a new one
      tunnels.on('dead', function (tunnel) {
        tunnelCount--;
        log.debug('tunnel dead [total: %d]', tunnelCount);

        if (this._closed) {
          return;
        }

        tunnels.open();
      });

      // establish as many tunnels as allowed
      for (var count = 0; count < info.maxConn; ++count) {
        tunnels.open();
      }
    }
  }, {
    key: 'open',
    value: function open(cb) {
      var _this2 = this;

      this._init(function (err, info) {
        if (err) {
          return cb(err);
        }

        _this2.url = info.url;
        _this2._establish(info);
        cb();
      });
    }

    // shutdown tunnels
  }, {
    key: 'close',
    value: function close() {

      this._closed = true;
      this.emit('close');
    }
  }]);

  return Tunnel;
})(EventEmitter);

exports['default'] = Tunnel;
module.exports = exports['default'];