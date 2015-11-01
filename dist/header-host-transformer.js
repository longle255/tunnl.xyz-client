Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _stream = require('stream');

var _stream2 = _interopRequireDefault(_stream);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var Transform = _stream2['default'].Transform;

var HeaderHostTransformer = (function (_Transform) {
  _inherits(HeaderHostTransformer, _Transform);

  function HeaderHostTransformer(options) {
    _classCallCheck(this, HeaderHostTransformer);

    _get(Object.getPrototypeOf(HeaderHostTransformer.prototype), 'constructor', this).call(this, options);
    if (!(this instanceof HeaderHostTransformer)) {
      return new HeaderHostTransformer(options);
    }

    options = options || {};

    this.host = options.host || 'localhost';
    this.replaced = false;
  }

  _createClass(HeaderHostTransformer, [{
    key: '_transform',
    value: function _transform(chunk, enc, cb) {
      var _this = this;

      chunk = chunk.toString();

      // after replacing the first instance of the Host header
      // we just become a regular passthrough
      if (!this.replaced) {
        this.push(chunk.replace(/(\r\nHost: )\S+/, function (match, $1) {
          _this.replaced = true;
          return $1 + _this.host;
        }));
      } else {
        this.push(chunk);
      }
      return cb();
    }
  }]);

  return HeaderHostTransformer;
})(Transform);

exports['default'] = HeaderHostTransformer;
module.exports = exports['default'];