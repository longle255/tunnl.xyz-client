import url from 'url';
import Events from 'events';
import request from 'request';
import Logger from './logger';
import TunnelCluster from './tunnel-cluster';
let log = Logger.getLogger(module);
let EventEmitter = Events.EventEmitter;

class Tunnel extends EventEmitter {
  constructor(options) {
    super();
    this._closed = false;
    this.options = options || {};

    this.options.host = this.options.host || 'https://tunnl.xyz';
    log.debug('start Tunnel ', this.options);
  }

  _init(cb) {
    var params = {
      path: '/',
      json: true,
      method: 'POST'
    };

    var baseUri = this.options.host;

    // optionally override the upstream server
    var upstream = url.parse(this.options.host);

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
      request.post(params, (err, res, body) => {
        if (err) {
          // TODO (shtylman) don't print to stdout?
          console.log('tunnel server offline: ' + err.message + ', retry 1s');
          return setTimeout(getUrl, 1000);
        }
        if (res.statusCode !== 200) {
          let retErr = new Error((body && body.message) || 'localtunnel server returned an error, please try again');
          return cb(retErr);
        }

        var port = body.port;
        var host = upstream.hostname;

        var maxConn = body.maxConnCount || 1;

        cb(null, {
          remoteHost: upstream.hostname,
          remotePort: body.port,
          name: body.id,
          url: body.url,
          maxConn: maxConn
        });
      });
    })();
  }

  _establish(info) {
    var options = this.options;

    // increase max event listeners so that localtunnel consumers don't get
    // warning messages as soon as they setup even one listener. See #71
    this.setMaxListeners(info.maxConn + (EventEmitter.defaultMaxListeners || 10));

    info.localHost = options.localHost;
    info.localPort = options.port;

    var tunnels = this.tunnelCluster = new TunnelCluster(info);

    // only emit the url the first time
    tunnels.once('open', () => this.emit('url', info.url));

    var tunnelCount = 0;

    // track open count
    tunnels.on('open', tunnel => {
      tunnelCount++;
      log.debug('tunnel open [total: %d]', tunnelCount);

      function closeHandler() {
        tunnel.destroy();
      }

      if (this._closed) {
        return closeHandler();
      }

      this.once('close', closeHandler);
      tunnel.once('close', () => {
        this.removeListener('close', closeHandler);
      });
    });

    // when a tunnel dies, open a new one
    tunnels.on('dead', function(tunnel) {
      tunnelCount--;
      log.debug('tunnel dead [total: %d]', tunnelCount);

      if (this._closed) {
        return;
      }

      tunnels.open();
    });

    // establish as many tunnels as allowed
    log.debug('max tunnel allowed: %d', info.maxConn);
    for (var count = 0; count < info.maxConn; ++count) {
      tunnels.open();
    }
  }


  open(cb) {

    this._init((err, info) => {
      if (err) {
        return cb(err);
      }
      this.url = info.url;
      this._establish(info);
      cb();
    });
  }

  // shutdown tunnels
  close() {

    this._closed = true;
    this.emit('close');
  }
}

export default Tunnel;
