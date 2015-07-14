Description
===========

An SSH2 client module written in pure JavaScript for [node.js](http://nodejs.org/).

Development/testing is done against OpenSSH (6.6 currently).

Upgrading from v0.2.x? See the [list of changes](https://github.com/mscdex/ssh2/wiki/Changes-from-0.2.x-to-0.3.x) (including backwards incompatibilities).


Requirements
============

* [node.js](http://nodejs.org/) -- v0.8.7 or newer


Install
============

    npm install ssh2


Examples
========

* Authenticate using keys and execute `uptime` on a server:

```javascript
var Connection = require('ssh2');

var conn = new Connection();
conn.on('ready', function() {
  console.log('Connection :: ready');
  conn.exec('uptime', function(err, stream) {
    if (err) throw err;
    stream.on('exit', function(code, signal) {
      console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
    }).on('close', function() {
      console.log('Stream :: close');
      conn.end();
    }).on('data', function(data) {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', function(data) {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: '192.168.100.100',
  port: 22,
  username: 'frylock',
  privateKey: require('fs').readFileSync('/here/is/my/key')
});

// example output:
// Connection :: ready
// STDOUT:  17:41:15 up 22 days, 18:09,  1 user,  load average: 0.00, 0.01, 0.05
//
// Stream :: close
// Stream :: exit :: code: 0, signal: undefined
```

* Authenticate using keys and start an interactive shell session:

```javascript
var Connection = require('ssh2');

var conn = new Connection();
conn.on('ready', function() {
  console.log('Connection :: ready');
  conn.shell('uptime', function(err, stream) {
    if (err) throw err;
    stream.on('close', function() {
      console.log('Stream :: close');
      conn.end();
    }).on('data', function(data) {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', function(data) {
      console.log('STDERR: ' + data);
    });
    stream.end('ls -l\nexit\n');
  });
}).connect({
  host: '192.168.100.100',
  port: 22,
  username: 'frylock',
  privateKey: require('fs').readFileSync('/here/is/my/key')
});

// example output:
// Connection :: ready
// STDOUT: Last login: Sun Jun 15 09:37:21 2014 from 192.168.100.100
//
// STDOUT: ls -l
// exit
//
// STDOUT: frylock@athf:~$ ls -l
//
// STDOUT: total 8
//
// STDOUT: drwxr-xr-x 2 frylock frylock 4096 Nov 18  2012 mydir
//
// STDOUT: -rw-r--r-- 1 frylock frylock   25 Apr 11  2013 test.txt
//
// STDOUT: frylock@athf:~$ exit
//
// STDOUT: logout
//
// Stream :: close
```

* Authenticate using password and send an HTTP request to port 80 on the server:

```javascript
var Connection = require('ssh2');

var conn = new Connection();
conn.on('ready', function() {
  console.log('Connection :: ready');
  conn.forwardOut('192.168.100.102', 8000, '127.0.0.1', 80, function(err, stream) {
    if (err) throw err;
    stream.on('close', function() {
      console.log('TCP :: CLOSED');
      conn.end();
    }).on('data', function(data) {
      console.log('TCP :: DATA: ' + data);
    }).end([
      'HEAD / HTTP/1.1',
      'User-Agent: curl/7.27.0',
      'Host: 127.0.0.1',
      'Accept: */*',
      'Connection: close',
      '',
      ''
    ].join('\r\n'));
  });
}).connect({
  host: '192.168.100.100',
  port: 22,
  username: 'frylock',
  password: 'nodejsrules'
});

// example output:
// Connection :: ready
// TCP :: DATA: HTTP/1.1 200 OK
// Date: Thu, 15 Nov 2012 13:52:58 GMT
// Server: Apache/2.2.22 (Ubuntu)
// X-Powered-By: PHP/5.4.6-1ubuntu1
// Last-Modified: Thu, 01 Jan 1970 00:00:00 GMT
// Content-Encoding: gzip
// Vary: Accept-Encoding
// Connection: close
// Content-Type: text/html; charset=UTF-8
//
//
// TCP :: CLOSED
```

* Authenticate using password and forward remote connections on port 8000 to us:

```javascript
var Connection = require('ssh2');

var conn = new Connection();
conn.on('ready', function() {
  console.log('Connection :: ready');
  conn.forwardIn('127.0.0.1', 8000, function(err) {
    if (err) throw err;
    console.log('Listening for connections on server on port 8000!');
  });
}).on('tcp connection', function(info, accept, reject) {
  console.log('TCP :: INCOMING CONNECTION:');
  console.dir(info);
  accept().on('close', function() {
    console.log('TCP :: CLOSED');
  }).on('data', function(data) {
    console.log('TCP :: DATA: ' + data);
  }).end([
    'HTTP/1.1 404 Not Found',
    'Date: Thu, 15 Nov 2012 02:07:58 GMT',
    'Server: ForwardedConnection',
    'Content-Length: 0',
    'Connection: close',
    '',
    ''
  ].join('\r\n'));
}).connect({
  host: '192.168.100.100',
  port: 22,
  username: 'frylock',
  password: 'nodejsrules'
});

// example output:
// Connection :: ready
// Listening for connections on server on port 8000!
//  (.... then from another terminal on the server: `curl -I http://127.0.0.1:8000`)
// TCP :: INCOMING CONNECTION: { destIP: '127.0.0.1',
//  destPort: 8000,
//  srcIP: '127.0.0.1',
//  srcPort: 41969 }
// TCP DATA: HEAD / HTTP/1.1
// User-Agent: curl/7.27.0
// Host: 127.0.0.1:8000
// Accept: */*
//
//
// TCP :: CLOSED
```

* Authenticate using password and get a directory listing via SFTP:

```javascript
var Connection = require('ssh2');

var conn = new Connection();
conn.on('ready', function() {
  console.log('Connection :: ready');
  conn.sftp(function(err, sftp) {
    if (err) throw err;
    sftp.readdir('foo', function(err, list) {
      if (err) throw err;
      console.dir(list);
      conn.end();
    });
  });
}).connect({
  host: '192.168.100.100',
  port: 22,
  username: 'frylock',
  password: 'nodejsrules'
});

// example output:
// Connection :: ready
// [ { filename: 'test.txt',
//     longname: '-rw-r--r--    1 frylock   frylock         12 Nov 18 11:05 test.txt',
//     attrs:
//      { size: 12,
//        uid: 1000,
//        gid: 1000,
//        mode: 33188,
//        atime: 1353254750,
//        mtime: 1353254744 } },
//   { filename: 'mydir',
//     longname: 'drwxr-xr-x    2 frylock   frylock       4096 Nov 18 15:03 mydir',
//     attrs:
//      { size: 1048576,
//        uid: 1000,
//        gid: 1000,
//        mode: 16877,
//        atime: 1353269007,
//        mtime: 1353269007 } } ]
```

* Connection hopping:

```javascript
var Connection = require('ssh2');

var conn1 = new Connection(),
    conn2 = new Connection();

conn1.on('ready', function() {
  console.log('FIRST :: connection ready');
  conn1.exec('nc 192.168.1.2 22', function(err, stream) {
    if (err) {
      console.log('FIRST :: exec error: ' + err);
      return conn1.end();
    }
    conn2.connect({
      sock: stream,
      username: 'user2',
      password: 'password2',
    });
  });
}).connect({
  host: '192.168.1.1',
  username: 'user1',
  password: 'password1',
});

conn2.on('ready', function() {
  console.log('SECOND :: connection ready');
  conn2.exec('uptime', function(err, stream) {
    if (err) {
      console.log('SECOND :: exec error: ' + err);
      return conn1.end();
    }
    stream.on('end', function() {
      conn1.end(); // close parent (and this) connection
    }).on('data', function(data) {
      console.log(data.toString());
    });
  });
});
```

* Forward X11 connections (xeyes):

```javascript
var net = require('net'),
    Connection = require('ssh2');

var conn = new Connection();

conn.on('x11', function(info, accept, reject) {
  var xserversock = new net.Socket();
  xserversock.on('connect', function() {
    var xclientsock = accept();
    xclientsock.pipe(xserversock).pipe(xclientsock);
  });
  // connects to localhost:0.0
  xserversock.connect(6000, 'localhost');
});

conn.on('ready', function() {
  conn.exec('xeyes', { x11: true }, function(err, stream) {
    if (err) throw err;
    var code = 0;
    stream.on('end', function() {
      if (code !== 0)
        console.log('Do you have X11 forwarding enabled on your SSH server?');
      conn.end();
    }).on('exit', function(exitcode) {
      code = exitcode;
    });
  });
}).connect({
  host: '192.168.1.1',
  username: 'foo',
  password: 'bar'
});
```

* Dynamic (1:1) port forwarding using a SOCKSv5 proxy (using [socksv5](https://github.com/mscdex/socksv5)):

```javascript
var socks = require('socksv5'),
    Connection = require('ssh2');

var ssh_config = {
  host: '192.168.100.1',
  port: 22,
  username: 'nodejs',
  password: 'rules'
};

socks.createServer(function(info, accept, deny) {
  var conn = new Connection();
  conn.on('ready', function() {
    conn.forwardOut(info.srcAddr,
                    info.srcPort,
                    info.dstAddr,
                    info.dstPort,
                    function(err, stream) {
      if (err)
        return deny();

      var clientSocket;
      if (clientSocket = accept(true)) {
        stream.pipe(clientSocket).pipe(stream).on('close', function() {
          conn.end();
        });
      } else
        conn.end();
    });
  }).on('error', function(err) {
    deny();
  }).connect(ssh_config);
}).listen(1080, 'localhost', function() {
  console.log('SOCKSv5 proxy server started on port 1080');
}).useAuth(socks.auth.None());

// test with cURL:
//   curl -i --socks5 localhost:1080 google.com
```

* Invoke an arbitrary subsystem (netconf in this example):

```javascript
var Connection = require('ssh2'),
    xmlhello = '<?xml version="1.0" encoding="UTF-8"?>'+
               '<hello xmlns="urn:ietf:params:xml:ns:netconf:base:1.0">'+
               '    <capabilities>'+
               '		<capability>urn:ietf:params:netconf:base:1.0</capability>'+
               '	</capabilities>'+
               '</hello>]]>]]>';

var conn = new Connection();

conn.on('ready', function() {
  console.log('Connection :: ready');
  conn.subsys('netconf', function(err, stream) {
    if (err) throw err;
    stream.on('data', function(data) {
      console.log(data);
    }).write(xmlhello);
  });
}).connect({
  host: '1.2.3.4',
  port: 22,
  username: 'blargh',
  password: 'honk'
});
```


API
===

`require('ssh2')` returns a **_Connection_** constructor

Connection events
-----------------

* **banner**(< _string_ >message, < _string_ >language) - A notice was sent by the server upon connection.

* **ready**() - Authentication was successful.

* **tcp connection**(< _object_ >details, < _function_ >accept, < _function_ >reject) - An incoming forwarded TCP connection is being requested. Calling `accept` accepts the connection and returns a `ChannelStream` object. Calling `reject` rejects the connection and no further action is needed. `details` contains:

    * **srcIP** - _string_ - The originating IP of the connection.

    * **srcPort** - _integer_ - The originating port of the connection.

    * **dstIP** - _string_ - The remote IP the connection was received on (given in earlier call to `forwardIn()`).

    * **dstPort** - _integer_ - The remote port the connection was received on (given in earlier call to `forwardIn()`).

* **x11**(< _object_ >details, < _function_ >accept, < _function_ >reject) - An incoming X11 connection is being requested. Calling `accept` accepts the connection and returns a `ChannelStream` object. Calling `reject` rejects the connection and no further action is needed. `details` contains:

    * **srcIP** - _string_ - The originating IP of the connection.

    * **srcPort** - _integer_ - The originating port of the connection.

* **keyboard-interactive**(< _string_ >name, < _string_ >instructions, < _string_ >instructionsLang, < _array_ >prompts, < _function_ >finish) - The server is asking for replies to the given `prompts` for keyboard-interactive user authentication. `name` is generally what you'd use as a window title (for GUI apps). `prompts` is an array of `{ prompt: 'Password: ', echo: false }` style objects (here `echo` indicates whether user input should be displayed on the screen). The answers for all prompts must be provided as an array of strings and passed to `finish` when you are ready to continue. Note: It's possible for the server to come back and ask more questions.

* **change password**(< _string_ >message, < _string_ >language, < _function_ >done) - If using password-based user authentication, the server has requested that the user's password be changed. Call `done` with the new password.

* **error**(< _Error_ >err) - An error occurred. A 'level' property indicates 'connection-socket' for socket-level errors and 'connection-ssh' for SSH disconnection messages. In the case of 'connection-ssh' messages, there may be a 'description' property that provides more detail.

* **end**() - The socket was disconnected.

* **close**(< _boolean_ >hadError) - The socket was closed. `hadError` is set to true if this was due to error.

* **debug**(< _string_ >message) - If `debug` is set in the object passed to connect(), then this event will be emitted when the server sends debug messages. For OpenSSH, these usually are messages like "Pty allocation disabled.", "X11 forwarding disabled.", etc. when options are set for particular keys in `~/.ssh/authorized_keys`.


Connection methods
------------------

* **(constructor)**() - Creates and returns a new Connection instance.

* **connect**(< _object_ >config) - _(void)_ - Attempts a connection to a server using the information given in `config`:

    * **host** - < _string_ > - Hostname or IP address of the server. **Default:** `'localhost'`

    * **port** - < _integer_ > - Port number of the server. **Default:** `22`

    * **hostHash** - < _string_ > - 'md5' or 'sha1'. The host's key is hashed using this method and passed to the **hostVerifier** function. **Default:** (none)

    * **hostVerifier** - < _function_ > - Function that is passed a string hex hash of the host's key for verification purposes. Return true to continue with the connection, false to reject and disconnect. **Default:** (none)

    * **username** - < _string_ > - Username for authentication. **Default:** (none)

    * **password** - < _string_ > - Password for password-based user authentication. **Default:** (none)

    * **agent** - < _string_ > - Path to ssh-agent's UNIX socket for ssh-agent-based user authentication. **Windows users: set to 'pageant' for authenticating with Pageant or (actual) path to a cygwin "UNIX socket."** **Default:** (none)

    * **privateKey** - < _mixed_ > - Buffer or string that contains a private key for key-based user authentication (OpenSSH format). **Default:** (none)

    * **passphrase** - < _string_ > - For an encrypted private key, this is the passphrase used to decrypt it. **Default:** (none)

    * **tryKeyboard** - < _boolean_ > - Try keyboard-interactive user authentication if primary user authentication method fails. **Default:** `false`

    * **pingInterval** - < _integer_ > - How often (in milliseconds) to send SSH-level keepalive packets to the server. **Default:** `60000`

    * **readyTimeout** - < _integer_ > - How long (in milliseconds) to wait for the SSH handshake to complete. **Default:** `10000`

    * **sock** - < _ReadableStream_ > - A _ReadableStream_ to use for communicating with the server instead of creating and using a new TCP connection (useful for connection hopping).

    * **agentForward** - < _boolean_ > - Set to true to use OpenSSH agent forwarding ('auth-agent@openssh.com'). **Default:** `false`

**Authentication method priorities:** Password -> Private Key -> Agent (-> keyboard-interactive if `tryKeyboard` is true) -> None

* **exec**(< _string_ >command[, < _object_ >options], < _function_ >callback) - _(void)_ - Executes `command` on the server. Valid `options` properties are:

    * **env** - < _object_ > - An environment to use for the execution of the command.

    * **pty** - < _mixed_ > - Set to true to allocate a pseudo-tty with defaults, or an object containing specific pseudo-tty settings (see 'Pseudo-TTY settings'). Setting up a pseudo-tty can be useful when working with remote processes that expect input from an actual terminal (e.g. sudo's password prompt).

    * **x11** - < _mixed_ > - Set to true to use defaults below, a number to specify a specific screen number, or an object with the following valid properties:

        * **single** - < _boolean_ > - Allow just a single connection? **Default:** `false`

        * **screen** - < _number_ > - Screen number to use **Default:** `0`

    `callback` has 2 parameters: < _Error_ >err, < _ChannelStream_ >stream.

* **shell**([[< _object_ >window,] < _object_ >options]< _function_ >callback) - _(void)_ - Starts an interactive shell session on the server, with optional `window` pseudo-tty settings (see 'Pseudo-TTY settings'). `options` supports the 'x11' option as described in exec(). `callback` has 2 parameters: < _Error_ >err, < _ChannelStream_ >stream.

* **forwardIn**(< _string_ >remoteAddr, < _integer_ >remotePort, < _function_ >callback) - _(void)_ - Bind to `remoteAddr` on `remotePort` on the server and forward incoming connections. `callback` has 2 parameters: < _Error_ >err, < _integer_ >port (`port` is the assigned port number if `remotePort` was 0). Here are some special values for `remoteAddr` and their associated binding behaviors:

    * '' - Connections are to be accepted on all protocol families supported by the server.

    * '0.0.0.0' - Listen on all IPv4 addresses.

    * '::' - Listen on all IPv6 addresses.

    * 'localhost' - Listen on all protocol families supported by the server on loopback addresses only.

    * '127.0.0.1' and '::1' - Listen on the loopback interfaces for IPv4 and IPv6, respectively.

* **unforwardIn**(< _string_ >remoteAddr, < _integer_ >remotePort, < _function_ >callback) - _(void)_ - Unbind `remoteAddr` on `remotePort` on the server and stop forwarding incoming connections. Until `callback` is called, more connections may still come in. `callback` has 1 parameter: < _Error_ >err.

* **forwardOut**(< _string_ >srcIP, < _integer_ >srcPort, < _string_ >dstIP, < _integer_ >dstPort, < _function_ >callback) - _(void)_ - Open a connection with `srcIP` and `srcPort` as the originating address and port and `dstIP` and `dstPort` as the remote destination address and port. `callback` has 2 parameters: < _Error_ >err, < _ChannelStream_ >stream.

* **sftp**(< _function_ >callback) - _(void)_ - Starts an SFTP (protocol version 3) session. `callback` has 2 parameters: < _Error_ >err, < _SFTP_ >sftpConnection.

* **subsys**(< _string_ >subsystem, < _function_ >callback) - _(void)_ - Invokes `subsystem` on the server. `callback` has 2 parameters: < _Error_ >err, < _ChannelStream_ >stream.

* **end**() - _(void)_ - Disconnects the socket.


ChannelStream
-------------

This is a normal **streams2** Duplex Stream, with the following changes:

* A boolean property 'allowHalfOpen' exists and behaves similarly to the property of the same name for net.Socket. When the stream's end() is called, if 'allowHalfOpen' is `true`, only EOF will be sent (the server can still send data if they have not already sent EOF). The default value for this property is `true`.

* For shell():

    * **setWindow**(< _integer_ >rows, < _integer_ >cols, < _integer_ >height, < _integer_ >width) - _(void)_ - Lets the server know that the local terminal window has been resized. The meaning of these arguments are described in the 'Pseudo-TTY settings' section.

* For exec():

    * An 'exit' event will be emitted when the process finishes. If the process finished normally, the process's return value is passed to the 'exit' callback. If the process was interrupted by a signal, the following are passed to the 'exit' callback: null, < _string_ >signalName, < _boolean_ >didCoreDump, < _string_ >description.

* For shell() and exec():

    * The readable side represents stdout and the writable side represents stdin.

    * A `stderr` property that represents the stream of output from stderr.

    * **signal**(< _string_ >signalName) - _(void)_ - Sends a POSIX signal to the current process on the server. Valid signal names are: 'ABRT', 'ALRM', 'FPE', 'HUP', 'ILL', 'INT', 'KILL', 'PIPE', 'QUIT', 'SEGV', 'TERM', 'USR1', and 'USR2'. Also, from the RFC: "Some systems may not implement signals, in which case they SHOULD ignore this message." Note: If you are trying to send SIGINT and you find signal() doesn't work, try writing '\x03' to the exec/shell stream instead.


SFTP events
-----------

* **end**() - The SFTP session was ended.


SFTP methods
------------

* **end**() - _(void)_ - Ends the SFTP session.

* **fastGet**(< _string_ >remotePath, < _string_ >localPath[, < _object_ >options], < _function_ >callback) - _(void)_ - Downloads a file at `remotePath` to `localPath` using parallel reads for faster throughput. `options` can have the following properties:

    * concurrency - _integer_ - Number of concurrent reads **Default:** `25`

    * chunkSize - _integer_ - Size of each read in bytes **Default:** `32768`

    * step - _function_(< _integer_ >total_transferred, < _integer_ >chunk, < _integer_ >total) - Called every time a part of a file was transferred

    `callback` has 1 parameter: < _Error_ >err.

* **fastPut**(< _string_ >localPath, < _string_ >remotePath[, < _object_ >options], < _function_ >callback) - _(void)_ - Uploads a file from `localPath` to `remotePath` using parallel reads for faster throughput. `options` can have the following properties:

    * concurrency - _integer_ - Number of concurrent reads **Default:** `25`

    * chunkSize - _integer_ - Size of each read in bytes **Default:** `32768`

    * step - _function_(< _integer_ >total_transferred, < _integer_ >chunk, < _integer_ >total) - Called every time a part of a file was transferred

    `callback` has 1 parameter: < _Error_ >err.

* **createReadStream**(< _string_ >path[, < _object_ >options]) - _ReadStream_ - Returns a new readable stream for `path`. `options` has the following defaults:

    ```javascript
    { flags: 'r',
      encoding: null,
      handle: null,
      mode: 0666,
      autoClose: true
    }
    ```

    `options` can include `start` and `end` values to read a range of bytes from the file instead of the entire file. Both `start` and `end` are inclusive and start at 0. The `encoding` can be `'utf8'`, `'ascii'`, or `'base64'`.

    If `autoClose` is false, then the file handle won't be closed, even if there's an error. It is your responsiblity to close it and make sure there's no file handle leak. If `autoClose` is set to true (default behavior), on `error` or `end` the file handle will be closed automatically.

    An example to read the last 10 bytes of a file which is 100 bytes long:

    ```javascript
    sftp.createReadStream('sample.txt', {start: 90, end: 99});
    ```

* **createWriteStream**(< _string_ >path[, < _object_ >options]) - _WriteStream_ - Returns a new writable stream for `path`. `options` has the following defaults:

    ```javascript
    { flags: 'w',
      encoding: null,
      mode: 0666 }
    ```

    `options` may also include a `start` option to allow writing data at some position past the beginning of the file. Modifying a file rather than replacing it may require a flags mode of 'r+' rather than the default mode 'w'.

    If 'autoClose' is set to false and you pipe to this stream, this stream will not automatically close after there is no more data upstream -- allowing future pipes and/or manual writes.

* **open**(< _string_ >filename, < _string_ >mode, [< _ATTRS_ >attributes, ]< _function_ >callback) - _(void)_ - Opens a file `filename` for `mode` with optional `attributes`. `mode` is any of the modes supported by fs.open (except sync mode). `callback` has 2 parameters: < _Error_ >err, < _Buffer_ >handle.

* **close**(< _Buffer_ >handle, < _function_ >callback) - _(void)_ - Closes the resource associated with `handle` given by open() or opendir(). `callback` has 1 parameter: < _Error_ >err.

* **read**(< _Buffer_ >handle, < _Buffer_ >buffer, < _integer_ >offset, < _integer_ >length, < _integer_ >position, < _function_ >callback) - _(void)_ - Reads `length` bytes from the resource associated with `handle` starting at `position` and stores the bytes in `buffer` starting at `offset`. `callback` has 4 parameters: < _Error_ >err, < _integer_ >bytesRead, < _Buffer_ >buffer (offset adjusted), < _integer_ >position.

* **write**(< _Buffer_ >handle, < _Buffer_ >buffer, < _integer_ >offset, < _integer_ >length, < _integer_ >position, < _function_ >callback) - _(void)_ - Writes `length` bytes from `buffer` starting at `offset` to the resource associated with `handle` starting at `position`. `callback` has 1 parameter: < _Error_ >err.

* **fstat**(< _Buffer_ >handle, < _function_ >callback) - _(void)_ - Retrieves attributes for the resource associated with `handle`. `callback` has 2 parameters: < _Error_ >err, < _Stats_ >stats.

* **fsetstat**(< _Buffer_ >handle, < _ATTRS_ >attributes, < _function_ >callback) - _(void)_ - Sets the attributes defined in `attributes` for the resource associated with `handle`. `callback` has 1 parameter: < _Error_ >err.

* **futimes**(< _Buffer_ >handle, < _mixed_ >atime, < _mixed_ >mtime, < _function_ >callback) - _(void)_ - Sets the access time and modified time for the resource associated with `handle`. `atime` and `mtime` can be Date instances or UNIX timestamps. `callback` has 1 parameter: < _Error_ >err.

* **fchown**(< _Buffer_ >handle, < _integer_ >uid, < _integer_ >gid, < _function_ >callback) - _(void)_ - Sets the owner for the resource associated with `handle`. `callback` has 1 parameter: < _Error_ >err.

* **fchmod**(< _Buffer_ >handle, < _mixed_ >mode, < _function_ >callback) - _(void)_ - Sets the mode for the resource associated with `handle`. `mode` can be an integer or a string containing an octal number. `callback` has 1 parameter: < _Error_ >err.

* **opendir**(< _string_ >path, < _function_ >callback) - _(void)_ - Opens a directory `path`. `callback` has 2 parameters: < _Error_ >err, < _Buffer_ >handle.

* **readdir**(< _mixed_ >location, < _function_ >callback) - _(void)_ - Retrieves a directory listing. `location` can either be a _Buffer_ containing a valid directory handle from opendir() or a _string_ containing the path to a directory. `callback` has 2 parameters: < _Error_ >err, < _mixed_ >list. `list` is an _Array_ of `{ filename: 'foo', longname: '....', attrs: {...} }` style objects (attrs is of type _ATTR_). If `location` is a directory handle, this function may need to be called multiple times until `list` is boolean false, which indicates that no more directory entries are available for that directory handle.

* **unlink**(< _string_ >path, < _function_ >callback) - _(void)_ - Removes the file/symlink at `path`. `callback` has 1 parameter: < _Error_ >err.

* **rename**(< _string_ >srcPath, < _string_ >destPath, < _function_ >callback) - _(void)_ - Renames/moves `srcPath` to `destPath`. `callback` has 1 parameter: < _Error_ >err.

* **mkdir**(< _string_ >path, [< _ATTRS_ >attributes, ]< _function_ >callback) - _(void)_ - Creates a new directory `path`. `callback` has 1 parameter: < _Error_ >err.

* **rmdir**(< _string_ >path, < _function_ >callback) - _(void)_ - Removes the directory at `path`. `callback` has 1 parameter: < _Error_ >err.

* **stat**(< _string_ >path, < _function_ >callback) - _(void)_ - Retrieves attributes for `path`. `callback` has 2 parameter: < _Error_ >err, < _Stats_ >stats.

* **lstat**(< _string_ >path, < _function_ >callback) - _(void)_ - Retrieves attributes for `path`. If `path` is a symlink, the link itself is stat'ed instead of the resource it refers to. `callback` has 2 parameters: < _Error_ >err, < _Stats_ >stats.

* **setstat**(< _string_ >path, < _ATTRS_ >attributes, < _function_ >callback) - _(void)_ - Sets the attributes defined in `attributes` for `path`. `callback` has 1 parameter: < _Error_ >err.

* **utimes**(< _string_ >path, < _mixed_ >atime, < _mixed_ >mtime, < _function_ >callback) - _(void)_ - Sets the access time and modified time for `path`. `atime` and `mtime` can be Date instances or UNIX timestamps. `callback` has 1 parameter: < _Error_ >err.

* **chown**(< _string_ >path, < _integer_ >uid, < _integer_ >gid, < _function_ >callback) - _(void)_ - Sets the owner for `path`. `callback` has 1 parameter: < _Error_ >err.

* **chmod**(< _string_ >path, < _mixed_ >mode, < _function_ >callback) - _(void)_ - Sets the mode for `path`. `mode` can be an integer or a string containing an octal number. `callback` has 1 parameter: < _Error_ >err.

* **readlink**(< _string_ >path, < _function_ >callback) - _(void)_ - Retrieves the target for a symlink at `path`. `callback` has 2 parameters: < _Error_ >err, < _string_ >target.

* **symlink**(< _string_ >targetPath, < _string_ >linkPath, < _function_ >callback) - _(void)_ - Creates a symlink at `linkPath` to `targetPath`. `callback` has 1 parameter: < _Error_ >err.

* **realpath**(< _string_ >path, < _function_ >callback) - _(void)_ - Resolves `path` to an absolute path. `callback` has 2 parameters: < _Error_ >err, < _string_ >absPath.


ATTRS
-----

An object with the following valid properties:

* **mode** - < _integer_ > - Mode/permissions for the resource.

* **uid** - < _integer_ > - User ID of the resource.

* **gid** - < _integer_ > - Group ID of the resource.

* **size** - < _integer_ > - Resource size in bytes.

* **atime** - < _integer_ > - UNIX timestamp of the access time of the resource.

* **mtime** - < _integer_ > - UNIX timestamp of the modified time of the resource.

When supplying an ATTRS object to one of the SFTP methods:

* `atime` and `mtime` can be either a Date instance or a UNIX timestamp.

* `mode` can either be an integer or a string containing an octal number.


Stats
-----

An object with the same attributes as an ATTRS object with the addition of the following methods:

* `stats.isDirectory()`

* `stats.isFile()`

* `stats.isBlockDevice()`

* `stats.isCharacterDevice()`

* `stats.isSymbolicLink()`

* `stats.isFIFO()`

* `stats.isSocket()`


Pseudo-TTY settings
-------------------

* **rows** - < _integer_ > - Number of rows **Default:** `24`

* **cols** - < _integer_ > - Number of columns **Default:** `80`

* **height** - < _integer_ > - Height in pixels **Default:** `480`

* **width** - < _integer_ > - Width in pixels **Default:** `640`

* **term** - < _string_ > - The value to use for $TERM **Default:** `'vt100'`

`rows` and `cols` override `width` and `height` when `rows` and `cols` are non-zero.

Pixel dimensions refer to the drawable area of the window.

Zero dimension parameters are ignored.
