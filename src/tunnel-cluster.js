import events from 'events';
import net from 'net';
import Logger from './logger';
import HeaderHostTransformer from './header-host-transformer';
let log = Logger.getLogger(module);
let EventEmitter = events.EventEmitter;

class TunnelCluster extends EventEmitter {
  constructor(options) {
    super();
    this.options = options;
    log.debug('start TunnelCluster ', this.options);
  }

  onRemoteClose() {
    log.debug('remote close');
    this.emit('dead');
    this.local.end();
  }
  onRemoteConnect() {
    this.emit('open', this.remote);
    if (this.remote.destroyed) {
      log.debug('remote destroyed');
      this.emit('dead');
      return;
    }

    log.debug('connecting locally to %s:%d', this.options.localHost, this.options.localPort);
    this.remote.pause();

    // connection to local http server
    this.local = net.connect({
      host: this.options.localHost,
      port: this.options.localPort
    });

    this.remote.once('close', this.onRemoteClose.bind(this));

    // TODO some languages have single threaded servers which makes opening up
    // multiple local connections impossible. We need a smarter way to scale
    // and adjust for such instances to avoid beating on the door of the server
    this.local.once('error', err => {
      log.debug('local error %s', err.message);
      this.local.end();

      this.remote.removeListener('close', this.onRemoteClose);

      if (err.code !== 'ECONNREFUSED') {
        return this.remote.end();
      }

      // retrying connection to local server
      setTimeout(this.onRemoteConnect.bind(this), 1000);
    });

    this.local.once('connect', () => {
      log.debug('connected locally');
      this.remote.resume();

      var stream = this.remote;

      // if user requested specific local host
      // then we use host header transform to replace the host header
      if (this.options.localHost) {
        log.debug('transform Host header to %s', this.options.localHost);
        stream = this.remote.pipe(new HeaderHostTransformer({
          host: this.options.localHost
        }));
      }

      stream.pipe(this.local).pipe(this.remote);

      // when local closes, also get a new remote
      this.local.once('close', error => log.debug('local connection closed [%s]', error));
    });
  }
  open() {
    log.debug('establishing tunnel %s:%s <> %s:%s', this.options.localHost, this.options.localPort, this.options.remoteHost, this.options.remotePort);

    // connection to localtunnel server
    this.remote = net.connect({
      host: this.options.remoteHost,
      port: this.options.remotePort
    });

    this.remote.setKeepAlive(true);

    this.remote.on('error', err => {
      // emit connection refused errors immediately, because they
      // indicate that the tunnel can't be established.
      if (err.code === 'ECONNREFUSED') {
        this.emit('error', new Error('connection refused: ' + this.options.remoteHost + ':' + this.options.remotePort + ' (check your firewall settings)'));
      }
      this.remote.end();
    });

    // tunnel is considered open when remote connects
    this.remote.once('connect', this.onRemoteConnect.bind(this));
    // this.remote.once('connect', function() {
    //   this.emit('open', remote);
    //   conn_local();
    // });
  }
}

export default TunnelCluster;
