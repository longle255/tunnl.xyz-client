import Tunnel from './tunnel';
import Logger from './logger';

let log = Logger.getLogger(module);

export default function TunnelClient(port, opt, fn) {
  if (typeof opt === 'function') {
    fn = opt;
    opt = {};
  }

  opt = opt || {};
  opt.port = port;

  var client = new Tunnel(opt);
  log.info('Starting client with options:', opt);
  client.open(err => {
    if (err) {
      return fn(err);
    }

    fn(null, client);
  });
  return client;
}
