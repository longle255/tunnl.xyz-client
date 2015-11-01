import path from 'path';
import TunnelClient from './client';
import _ from 'lodash';
import Promise from 'bluebird';

process.env.NODE_ENV = 'development';
process.env.TUNNL_LOG = 'debug';
process.env.TUNNL_ROOT_DIR = path.join(__dirname, '../');

// assign global variable
global.Promise = Promise;
global._ = _;


var opt = {
  host: 'http://localhost:8080',
  port: '4567',
  localHost: 'localhost',
  localPort: '4567',
  subdomain: 'test1'
};

TunnelClient(opt.port, opt, function(err, tunnel) {
  if (err) {
    throw err;
  }
  tunnel.on('error', err1 => console.log(err1));
});
