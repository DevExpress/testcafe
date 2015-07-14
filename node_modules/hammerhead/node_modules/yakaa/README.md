## yakaa: yet another keep-alive agent

This is an extracted copy of Node 0.12's keep-alive Agent implementation with
some small changes intended to make it work with older versions of Node. It
also has one extra feature, which I needed.

The HTTP Agent is used for pooling sockets used in HTTP client requests.

The HTTP Agent also defaults client requests to using Connection:keep-alive. If
no pending HTTP requests are waiting on a socket to become free the socket is
closed. This means that Node's pool has the benefit of keep-alive when under
load but still does not require developers to manually close the HTTP clients
using KeepAlive.

If you opt into using HTTP KeepAlive, you can create an Agent object with that
flag set to `true`.  (See the [constructor options](#http_new_agent_options)
below.)  Then, the Agent will keep unused sockets in a pool for later use.
They will be explicitly marked so as to not keep the Node process running.
However, it is still a good idea to explicitly
[`destroy()`](#http_agent_destroy) KeepAlive agents when they are no longer in
use, so that the Sockets will be shut down.

Sockets are removed from the agent's pool when the socket emits either a
"close" event or a special "agentRemove" event. This means that if you intend
to keep one HTTP request open for a long time and don't want it to stay in the
pool you can do something along the lines of:

    http.get(options, function(res) {
      // Do stuff
    }).on("socket", function (socket) {
      socket.emit("agentRemove");
    });

### var Agent = require('yakaa'); new Agent([options])

* `options` {Object} Set of configurable options to set on the agent.
  Can have the following fields:
  * `keepAlive` {Boolean} Keep sockets around in a pool to be used by
    other requests in the future. Default = `false`
  * `keepAliveMsecs` {Integer} When using HTTP KeepAlive, how often
    to send TCP KeepAlive packets over sockets being kept alive.
    Default = `1000`.  Only relevant if `keepAlive` is set to `true`.
  * **ADDED** `keepAliveTimeoutMsecs` {Integer} When using HTTP KeepAlive, how
    long to keep the socket connected without activity before it gets reaped.
  * `maxSockets` {Number} Maximum number of sockets to allow per
    host.  Default = `Infinity`.
  * `maxFreeSockets` {Number} Maximum number of sockets to leave open
    in a free state.  Only relevant if `keepAlive` is set to `true`.
    Default = `256`.

The default `http.globalAgent` that is used by `http.request` has all
of these values set to their respective defaults.

To configure any of them, you must create your own `Agent` object.

```javascript
var http = require('http');
var Agent = require('yakaa');
var keepAliveAgent = new Agent({ keepAlive: true });
keepAliveAgent.request(options, onResponseCallback);
```

### agent.maxSockets

By default set to Infinity. Determines how many concurrent sockets the agent
can have open per origin. Origin is either a 'host:port' or
'host:port:localAddress' combination.

### agent.maxFreeSockets

By default set to 256.  For Agents supporting HTTP KeepAlive, this
sets the maximum number of sockets that will be left open in the free
state.

### agent.sockets

An object which contains arrays of sockets currently in use by the
Agent.  Do not modify.

### agent.freeSockets

An object which contains arrays of sockets currently awaiting use by
the Agent when HTTP KeepAlive is used.  Do not modify.

### agent.requests

An object which contains queues of requests that have not yet been assigned to
sockets. Do not modify.

### agent.destroy()

Destroy any sockets that are currently in use by the agent.

It is usually not necessary to do this.  However, if you are using an
agent with KeepAlive enabled, then it is best to explicitly shut down
the agent when you know that it will no longer be used.  Otherwise,
sockets may hang open for quite a long time before the server
terminates them.

### agent.getName(options)

Get a unique name for a set of request options, to determine whether a
connection can be reused.  In the http agent, this returns
`host:port:localAddress`.  In the https agent, the name includes the
CA, cert, ciphers, and other HTTPS/TLS-specific options that determine
socket reusability.


## new Agent.SSL(options)

An Agent object for HTTPS similar to Agent.

`options` is an object. All options from Agent are valid.

The following options from [tls.connect()][] can also be used.

- `pfx`: Certificate, Private key and CA certificates to use for SSL. Default `null`.
- `key`: Private key to use for SSL. Default `null`.
- `passphrase`: A string of passphrase for the private key or pfx. Default `null`.
- `cert`: Public x509 certificate to use. Default `null`.
- `ca`: An authority certificate or array of authority certificates to check
  the remote host against.
- `ciphers`: A string describing the ciphers to use or exclude. Consult
  <http://www.openssl.org/docs/apps/ciphers.html#CIPHER_LIST_FORMAT> for
  details on the format.
- `rejectUnauthorized`: If `true`, the server certificate is verified against
  the list of supplied CAs. An `'error'` event is emitted if verification
  fails. Verification happens at the connection level, *before* the HTTP
  request is sent. Default `true`.
- `secureProtocol`: The SSL method to use, e.g. `SSLv3_method` to force
  SSL version 3. The possible values depend on your installation of
  OpenSSL and are defined in the constant [SSL_METHODS][].

Example:

```js
var SSLAgent = require('yakaa').SSL;

var options = {
  hostname: 'encrypted.google.com',
  port: 443,
  path: '/',
  method: 'GET',
  key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
  cert: fs.readFileSync('test/fixtures/keys/agent2-cert.pem')
};
options.agent = new SSLAgent(options);
```

### LICENSE

See LICENSE in this distribution. As code derived from Node's source, it's
governed by the same license as Node itself.
