# tunnl.xyz-server
[![Travis build status](http://img.shields.io/travis/longle255/tunnl.xyz-server.svg?style=flat)](https://travis-ci.org/longle255/tunnl.xyz-server)
[![Code Climate](https://codeclimate.com/github/longle255/tunnl.xyz-server/badges/gpa.svg)](https://codeclimate.com/github/longle255/tunnl.xyz-server)
[![Test Coverage](https://codeclimate.com/github/longle255/tunnl.xyz-server/badges/coverage.svg)](https://codeclimate.com/github/longle255/tunnl.xyz-server)
[![Dependency Status](https://david-dm.org/longle255/tunnl.xyz-server.svg)](https://david-dm.org/longle255/tunnl.xyz-server)
[![devDependency Status](https://david-dm.org/longle255/tunnl.xyz-server/dev-status.svg)](https://david-dm.org/longle255/tunnl.xyz-server#info=devDependencies)

### Rewritten of [localtunnel](https://github.com/localtunnel/localtunnel) in es 6

localtunnel exposes your localhost to the world for easy testing and sharing! No need to mess with DNS or deploy just to have others test out your changes.

Great for working with browser testing tools like browserling or external api callback services like twilio which require a public url for callbacks.

## installation ##

```
npm install -g localtunnel
```

This will install the localtunnel module globally and add the 'lt' client cli tool to your PATH.

## use ##

Assuming your local server is running on port 8000, just use the ```lt``` command to start the tunnel.

```
lt --port 8000
```

Thats it! It will connect to the tunnel server, setup the tunnel, and tell you what url to use for your testing. This url will remain active for the duration of your session; so feel free to share it with others for happy fun time!

You can restart your local server all you want, ```lt``` is smart enough to detect this and reconnect once it is back.

### arguments

Below are some common arguments. See `lt --help` for additional arguments

* `--subdomain` request a named subdomain on the localtunnel server (default is random characters)
* `--local-host` proxy to a hostname other than localhost

## API ##

The localtunnel client is also usable through an API (for test integration, automation, etc)

### localtunnel(port [,opts], fn)

Creates a new localtunnel to the specified local `port`. `fn` will be called once you have been assigned a public localtunnel url. `opts` can be used to request a specific `subdomain`.

```javascript
var localtunnel = require('localtunnel');

var tunnel = localtunnel(port, function(err, tunnel) {
    if (err) ...

    // the assigned public url for your tunnel
    // i.e. https://abcdefgjhij.localtunnel.me
    tunnel.url;
});

tunnel.on('close', function() {
    // tunnels are closed
});
```

### opts

* `subdomain` A *string* value requesting a specific subdomain on the proxy server. **Note** You may not actually receive this name depending on availablily.
* `local_host` Proxy to this hostname instead of `localhost`. This will also cause the `Host` header to be re-written to this value in proxied requests.

### Tunnel

The `tunnel` instance returned to your callback emits the following events

|event|args|description|
|----|----|----|
|error|err|fires when an error happens on the tunnel|
|close||fires when the tunnel has closed|

The `tunnel instance has the following methods

|method|args|description|
|----|----|----|
|close||close the tunnel|

## other clients ##

Clients in other languages

*go* [gotunnelme](https://github.com/NoahShen/gotunnelme)

## server ##

See defunctzombie/localtunnel-server for details on the server that powers localtunnel.

## License ##
MIT
