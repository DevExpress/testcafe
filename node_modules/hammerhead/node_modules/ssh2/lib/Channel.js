var inherits = require('util').inherits,
    DuplexStream = require('stream').Duplex
                   || require('readable-stream').Duplex,
    ReadableStream = require('stream').Readable
                     || require('readable-stream').Readable;

var consts = require('./Parser.constants');

var PACKET_SIZE = 32 * 1024,
    MAX_WINDOW = 1 * 1024 * 1024,
    SIGNALS = ['ABRT', 'ALRM', 'FPE', 'HUP', 'ILL', 'INT', 'KILL', 'PIPE',
               'QUIT', 'SEGV', 'TERM', 'USR1', 'USR2'],
    MESSAGE = consts.MESSAGE,
    TERMINAL_MODE = consts.TERMINAL_MODE;

var CUSTOM_EVENTS = [
  'CHANNEL_EOF',
  'CHANNEL_CLOSE',
  'CHANNEL_DATA',
  'CHANNEL_EXTENDED_DATA',
  'CHANNEL_WINDOW_ADJUST',
  'CHANNEL_SUCCESS',
  'CHANNEL_FAILURE',
  'CHANNEL_REQUEST'
], CUSTOM_EVENTS_LEN = CUSTOM_EVENTS.length;

function Channel(info, conn) {
  if (!(this instanceof Channel))
    return new Channel(info, conn);

  var self = this;

  this.type = info.type;
  this.subtype = undefined;
  /*
    incoming and outgoing contain these properties:
    {
      id: undefined,
      window: undefined,
      packetSize: undefined,
      state: 'closed'
    }
  */
  this.incoming = info.incoming;
  this.outgoing = info.outgoing;

  this._conn = conn;
  this._stream = undefined;
  this._callbacks = [];
  this._hasX11 = false;

  function ondrain() {
    var stream = self._stream;
    if (stream && stream._waitConDrain) {
      stream._waitConDrain = false;
      if (!stream._waitWindow) {
        if (stream._chunk)
          stream._write(stream._chunk, null, stream._chunkcb);
        else if (stream._chunkcb)
          stream._chunkcb();
      }
    }
  }
  conn.on('drain', ondrain);

  conn._parser.once('CHANNEL_EOF:' + this.incoming.id, function() {
    self.incoming.state = 'eof';
    if (self._stream) {
      self._stream.push(null);
      self._stream.stderr.push(null);
    }
  });

  conn._parser.once('CHANNEL_CLOSE:' + this.incoming.id, function() {
    self.incoming.state = 'closed';
    if (self.outgoing.state === 'open' || self.outgoing.state === 'eof')
      self.close();
    if (self.outgoing.state === 'closing')
      self.outgoing.state = 'closed';
    conn._channels.splice(conn._channels.indexOf(self.incoming.id), 1);
    if (self._stream) {
      var stream = self._stream,
          state = stream._writableState;
      self._stream = undefined;
      conn.removeListener('drain', ondrain);
      if (!state.ending && !state.finished)
        stream.end();
      stream.emit('close');
      stream.stderr.emit('close');
    }
    for (var i = 0; i < CUSTOM_EVENTS_LEN; ++i) {
      // Since EventEmitters do not actually *delete* event names in the
      // emitter's event array, we must do this manually so as not to leak
      // our custom, channel-specific event names.
      delete conn._parser._events[CUSTOM_EVENTS[i] + ':' + self.incoming.id];
    }
  });

  conn._parser.on('CHANNEL_DATA:' + this.incoming.id, function(data) {
    self.incoming.window -= data.length;
    if (self._stream) {
      if (!self._stream.push(data)) {
        self._stream._waitChanDrain = true;
        return;
      }
    }
    if (self.incoming.window === 0)
      self._sendWndAdjust();
  });

  conn._parser.on('CHANNEL_EXTENDED_DATA:' + this.incoming.id,
    function(type, data) {
      self.incoming.window -= data.length;
      if (self._stream) {
        if (!self._stream.stderr.push(data)) {
          self._stream._waitChanDrain = true;
          return;
        }
      }
      if (self.incoming.window === 0)
        self._sendWndAdjust();
    }
  );

  conn._parser.on('CHANNEL_WINDOW_ADJUST:' + this.incoming.id, function(amt) {
    // the server is allowing us to send `amt` more bytes of data
    self.outgoing.window += amt;
    var stream = self._stream;
    if (stream && stream._waitWindow) {
      stream._waitWindow = false;
      if (!stream._waitConDrain) {
        if (stream._chunk)
          stream._write(stream._chunk, null, stream._chunkcb);
        else if (stream._chunkcb)
          stream._chunkcb();
      }
    }
  });

  conn._parser.on('CHANNEL_SUCCESS:' + this.incoming.id, function() {
    if (self._callbacks.length)
      self._callbacks.shift()(false);
  });

  conn._parser.on('CHANNEL_FAILURE:' + this.incoming.id, function() {
    if (self._callbacks.length)
      self._callbacks.shift()(true);
  });

  conn._parser.on('CHANNEL_REQUEST:' + this.incoming.id, function(info) {
    if (self._stream) {
      if (info.request === 'exit-status')
        self._stream.emit('exit', info.code);
      else if (info.request === 'exit-signal') {
        self._stream.emit('exit',
                          null,
                          'SIG' + info.signal,
                          info.coredump,
                          info.description,
                          info.lang);
      } else
        return;
      self.close();
    }
  });
}

Channel.prototype.eof = function() {
  if (this.outgoing.state === 'open') {
    this._conn._debug&&this._conn._debug('DEBUG: Channel: Sent EOF');
    // Note: CHANNEL_EOF does not consume window space
    /*
      byte      SSH_MSG_CHANNEL_EOF
      uint32    recipient channel
    */
    var buf = new Buffer(1 + 4);
    this.outgoing.state = 'eof';
    buf[0] = MESSAGE.CHANNEL_EOF;
    buf.writeUInt32BE(this.outgoing.id, 1, true);
    return this._conn._send(buf);
  } else
    return;
};

Channel.prototype.close = function() {
  if (this.outgoing.state === 'open' || this.outgoing.state === 'eof') {
    this._conn._debug&&this._conn._debug('DEBUG: Channel: Sent CLOSE');
    // Note: CHANNEL_CLOSE does not consume window space
    /*
      byte      SSH_MSG_CHANNEL_CLOSE
      uint32    recipient channel
    */
    var buf = new Buffer(1 + 4);
    buf[0] = MESSAGE.CHANNEL_CLOSE;
    buf.writeUInt32BE(this.outgoing.id, 1, true);
    this.outgoing.state = 'closing';
    return this._conn._send(buf);
  } else
    return;
};

Channel.prototype._sendAgentFwd = function(cb) {
  // Note: CHANNEL_REQUEST does not consume window space
  /*
    byte      SSH_MSG_CHANNEL_REQUEST
    uint32    recipient channel
    string    "auth-agent-req@openssh.com"
    boolean   want reply
  */
  this._conn._debug&&this._conn._debug('DEBUG: Channel: Sent CHANNEL_REQUEST (auth-agent-req@openssh.com)');
  var buf = new Buffer(1 + 4 + 4 + 26 + 1);
  buf[0] = MESSAGE.CHANNEL_REQUEST;
  buf.writeUInt32BE(this.outgoing.id, 1, true);
  buf.writeUInt32BE(26, 5, true);
  buf.write('auth-agent-req@openssh.com', 9, 26, 'ascii');
  buf[35] = 1;

  var self = this;
  this._callbacks.push(function(had_err) {
    if (had_err)
      return cb(new Error('Unable to request agent forwarding'));
    self.agentForward = true;
    cb();
  });

  return this._conn._send(buf);
};

Channel.prototype._sendTermSizeChg = function(rows, cols, height, width) {
  // Note: CHANNEL_REQUEST does not consume window space
  /*
    byte      SSH_MSG_CHANNEL_REQUEST
    uint32    recipient channel
    string    "window-change"
    boolean   FALSE
    uint32    terminal width, columns
    uint32    terminal height, rows
    uint32    terminal width, pixels
    uint32    terminal height, pixels
  */
  this._conn._debug&&this._conn._debug('DEBUG: Channel: Sent CHANNEL_REQUEST (window-change)');
  var buf = new Buffer(1 + 4 + 4 + 13 + 1 + 4 + 4 + 4 + 4);
  buf[0] = MESSAGE.CHANNEL_REQUEST;
  buf.writeUInt32BE(this.outgoing.id, 1, true);
  buf.writeUInt32BE(13, 5, true);
  buf.write('window-change', 9, 13, 'ascii');
  buf[22] = 0;
  buf.writeUInt32BE(cols, 23, true);
  buf.writeUInt32BE(rows, 27, true);
  buf.writeUInt32BE(width, 31, true);
  buf.writeUInt32BE(height, 35, true);

  return this._conn._send(buf);
};

Channel.prototype._sendPtyReq = function(rows, cols, height, width, term, modes,
                                         cb) {
  // Note: CHANNEL_REQUEST does not consume window space
  /*
    byte      SSH_MSG_CHANNEL_REQUEST
    uint32    recipient channel
    string    "pty-req"
    boolean   want reply
    string    TERM environment variable value (e.g., vt100)
    uint32    terminal width, characters (e.g., 80)
    uint32    terminal height, rows (e.g., 24)
    uint32    terminal width, pixels (e.g., 640)
    uint32    terminal height, pixels (e.g., 480)
    string    encoded terminal modes
  */
  this._conn._debug&&this._conn._debug('DEBUG: Channel: Sent CHANNEL_REQUEST (pty-req)');
  if (!term || !term.length)
    term = 'vt100';
  if (!modes || !modes.length)
    modes = String.fromCharCode(TERMINAL_MODE.TTY_OP_END);
  var termLen = term.length,
      modesLen = modes.length,
      p = 21,
      buf = new Buffer(1 + 4 + 4 + 7 + 1 + 4 + termLen + 4 + 4 + 4 + 4 + 4
                       + modesLen);
  buf[0] = MESSAGE.CHANNEL_REQUEST;
  buf.writeUInt32BE(this.outgoing.id, 1, true);
  buf.writeUInt32BE(7, 5, true);
  buf.write('pty-req', 9, 7, 'ascii');
  buf[16] = 1;
  buf.writeUInt32BE(termLen, 17, true);
  buf.write(term, 21, termLen, 'utf8');
  buf.writeUInt32BE(cols, p += termLen, true);
  buf.writeUInt32BE(rows, p += 4, true);
  buf.writeUInt32BE(width, p += 4, true);
  buf.writeUInt32BE(height, p += 4, true);
  buf.writeUInt32BE(modesLen, p += 4, true);
  buf.write(modes, p += 4, modesLen, 'utf8');

  this._callbacks.push(function(had_err) {
    if (had_err)
      return cb(new Error('Unable to request a pseudo-terminal'));
    cb();
  });

  return this._conn._send(buf);
};

Channel.prototype._sendShell = function(cb) {
  // Note: CHANNEL_REQUEST does not consume window space
  /*
    byte      SSH_MSG_CHANNEL_REQUEST
    uint32    recipient channel
    string    "shell"
    boolean   want reply
  */
  this._conn._debug&&this._conn._debug('DEBUG: Channel: Sent CHANNEL_REQUEST (shell)');
  var self = this;
  var buf = new Buffer(1 + 4 + 4 + 5 + 1);
  buf[0] = MESSAGE.CHANNEL_REQUEST;
  buf.writeUInt32BE(this.outgoing.id, 1, true);
  buf.writeUInt32BE(5, 5, true);
  buf.write('shell', 9, 5, 'ascii');
  buf[14] = 1;

  this._callbacks.push(function(had_err) {
    if (had_err)
      return cb(new Error('Unable to open shell'));
    self.subtype = 'shell';
    self._stream = new ChannelStream(self);
    cb(undefined, self._stream);
  });

  return this._conn._send(buf);
};

Channel.prototype._sendExec = function(cmd, opts, cb) {
  // Note: CHANNEL_REQUEST does not consume window space
  /*
    byte      SSH_MSG_CHANNEL_REQUEST
    uint32    recipient channel
    string    "exec"
    boolean   want reply
    string    command
  */
  this._conn._debug&&this._conn._debug('DEBUG: Channel: Sent CHANNEL_REQUEST (exec)');
  var self = this;
  var cmdlen = (Buffer.isBuffer(cmd) ? cmd.length : Buffer.byteLength(cmd)),
      buf = new Buffer(1 + 4 + 4 + 4 + 1 + 4 + cmdlen);
  buf[0] = MESSAGE.CHANNEL_REQUEST;
  buf.writeUInt32BE(this.outgoing.id, 1, true);
  buf.writeUInt32BE(4, 5, true);
  buf.write('exec', 9, 4, 'ascii');
  buf[13] = 1;
  buf.writeUInt32BE(cmdlen, 14, true);
  if (Buffer.isBuffer(cmd))
    cmd.copy(buf, 18);
  else
    buf.write(cmd, 18, cmdlen, 'utf8');

  this._callbacks.push(function(had_err) {
    if (had_err)
      return cb(new Error('Unable to exec'));
    self.subtype = 'exec';
    self._stream = new ChannelStream(self, opts);
    cb(undefined, self._stream);
  });

  return this._conn._send(buf);
};

Channel.prototype._sendSignal = function(signal) {
  // Note: CHANNEL_REQUEST does not consume window space
  /*
    byte      SSH_MSG_CHANNEL_REQUEST
    uint32    recipient channel
    string    "signal"
    boolean   FALSE
    string    signal name (without the "SIG" prefix)
  */
  this._conn._debug&&this._conn._debug('DEBUG: Channel: Sent CHANNEL_REQUEST (signal)');
  signal = signal.toUpperCase();
  if (signal.length >= 3
      && signal[0] === 'S' && signal[1] === 'I' && signal[2] === 'G')
    signal = signal.substr(3);
  if (SIGNALS.indexOf(signal) === -1)
    throw new Error('Invalid signal: ' + signal);
  var signalLen = signal.length,
      buf = new Buffer(1 + 4 + 4 + 6 + 1 + 4 + signalLen);
  buf[0] = MESSAGE.CHANNEL_REQUEST;
  buf.writeUInt32BE(this.outgoing.id, 1, true);
  buf.writeUInt32BE(6, 5, true);
  buf.write('signal', 9, 6, 'ascii');
  buf[15] = 0;
  buf.writeUInt32BE(signalLen, 16, true);
  buf.write(signal, 20, signalLen, 'ascii');

  return this._conn._send(buf);
};

Channel.prototype._sendEnv = function(env) {
  var keys, buf, ret = true;
  if (env && (keys = Object.keys(env)).length > 0) {
    this._conn._debug&&this._conn._debug('DEBUG: Channel: Sent CHANNEL_REQUEST (env)');
    // Note: CHANNEL_REQUEST does not consume window space
    /*
      byte      SSH_MSG_CHANNEL_REQUEST
      uint32    recipient channel
      string    "env"
      boolean   want reply
      string    variable name
      string    variable value
    */
    for (var i = 0, klen, vlen, len = keys.length; i < len; ++i) {
      klen = Buffer.byteLength(keys[i]);
      if (Buffer.isBuffer(env[keys[i]]))
        vlen = env[keys[i]].length;
      else
        vlen = Buffer.byteLength(env[keys[i]]);
      buf = new Buffer(1 + 4 + 4 + 3 + 1 + 4 + klen + 4 + vlen);
      buf[0] = MESSAGE.CHANNEL_REQUEST;
      buf.writeUInt32BE(this.outgoing.id, 1, true);
      buf.writeUInt32BE(3, 5, true);
      buf.write('env', 9, 3, 'ascii');
      buf[12] = 0;
      buf.writeUInt32BE(klen, 13, true);
      buf.write(keys[i], 17, klen, 'ascii');
      buf.writeUInt32BE(vlen, 17 + klen, true);
      if (Buffer.isBuffer(env[keys[i]]))
        env[keys[i]].copy(buf, 17 + klen + 4);
      else
        buf.write(env[keys[i]], 17 + klen + 4, vlen, 'utf8');
      ret = this._conn._send(buf);
    }
    return ret;
  } else
    return;
};

Channel.prototype._sendX11 = function(cfg, cb) {
  // Note: CHANNEL_REQUEST does not consume window space
  /*
    byte      SSH_MSG_CHANNEL_REQUEST
    uint32    recipient channel
    string    "x11-req"
    boolean   want reply
    boolean   single connection
    string    x11 authentication protocol
    string    x11 authentication cookie
    uint32    x11 screen number
  */
  this._conn._debug&&this._conn._debug('DEBUG: Channel: Sent CHANNEL_REQUEST (x11)');
  var self = this;
  var protolen = Buffer.byteLength(cfg.proto),
      cookielen = Buffer.byteLength(cfg.cookie),
      buf = new Buffer(1 + 4 + 4 + 7 + 1 + 1 + 4 + protolen + 4 + cookielen + 4);
  buf[0] = MESSAGE.CHANNEL_REQUEST;
  buf.writeUInt32BE(this.outgoing.id, 1, true);
  buf.writeUInt32BE(7, 5, true);
  buf.write('x11-req', 9, 7, 'ascii');
  buf[16] = 1;
  buf[17] = (cfg.single ? 1 : 0);
  buf.writeUInt32BE(protolen, 18, true);
  var bp = 22;
  if (Buffer.isBuffer(cfg.proto))
    cfg.proto.copy(buf, bp);
  else
    buf.write(cfg.proto, bp, protolen, 'utf8');
  bp += protolen;
  buf.writeUInt32BE(cookielen, bp, true);
  bp += 4;
  if (Buffer.isBuffer(cfg.cookie))
    cfg.cookie.copy(buf, bp);
  else
    buf.write(cfg.cookie, bp, cookielen, 'utf8');
  bp += cookielen;
  buf.writeUInt32BE((cfg.screen || 0), bp, true);

  this._callbacks.push(function(had_err) {
    if (had_err)
      return cb(new Error('Unable to request X11'));
    self._hasX11 = true;
    ++self._conn._acceptX11;
    cb();
  });

  return this._conn._send(buf);
};

Channel.prototype._sendSubsystem = function(name, cb) {
  // Note: CHANNEL_REQUEST does not consume window space
  /*
    byte      SSH_MSG_CHANNEL_REQUEST
    uint32    recipient channel
    string    "subsystem"
    boolean   want reply
    string    subsystem name
  */
  this._conn._debug&&this._conn._debug('DEBUG: Channel: Sent CHANNEL_REQUEST (subsystem)');
  var sublen = Buffer.byteLength(name),
      self = this,
      buf = new Buffer(1 + 4 + 4 + 9 + 1 + 4 + sublen);
  buf[0] = MESSAGE.CHANNEL_REQUEST;
  buf.writeUInt32BE(this.outgoing.id, 1, true);
  buf.writeUInt32BE(9, 5, true);
  buf.write('subsystem', 9, 9, 'ascii');
  buf[18] = 1;
  buf.writeUInt32BE(sublen, 19, true);
  buf.write(name, 23, sublen, 'ascii');

  this._callbacks.push(function(had_err) {
    if (had_err)
      return cb(new Error('Unable to start subsystem: ' + name));
    self.subtype = 'subsystem';
    self._stream = new ChannelStream(self);
    cb(undefined, self._stream);
  });

  return this._conn._send(buf);
};

Channel.prototype._sendWndAdjust = function(amt) {
  /*
    byte      SSH_MSG_CHANNEL_WINDOW_ADJUST
    uint32    recipient channel
    uint32    bytes to add
  */
  this._conn._debug&&this._conn._debug('DEBUG: Channel: Sent CHANNEL_WINDOW_ADJUST');
  amt = amt || MAX_WINDOW;
  var buf = new Buffer(1 + 4 + 4);
  buf[0] = MESSAGE.CHANNEL_WINDOW_ADJUST;
  buf.writeUInt32BE(this.outgoing.id, 1, true);
  buf.writeUInt32BE(amt, 5, true);

  this.incoming.window += amt;

  return this._conn._send(buf);
};

Channel.MAX_WINDOW = MAX_WINDOW;
Channel.PACKET_SIZE = PACKET_SIZE;
Channel.ChannelStream = ChannelStream;

module.exports = Channel;

function ChannelStream(channel, opts) {
  if (!(this instanceof ChannelStream))
    return new ChannelStream(channel, opts);

  var streamOpts = {
    highWaterMark: MAX_WINDOW,
    allowHalfOpen: (!opts || (opts && opts.allowHalfOpen))
  };

  DuplexStream.call(this, streamOpts);

  this.stdin = this.stdout = this;
  this.stderr = new ReadableStream(streamOpts);
  var self = this;
  this.stderr._read = function(n) {
    if (self._waitChanDrain) {
      self._waitChanDrain = false;
      if (self._channel.incoming.window === 0)
        self._channel._sendWndAdjust();
    }
  };
  this._channel = channel;

  // outgoing data
  this._waitConDrain = false; // TCP-level backpressure
  this._waitWindow = false; // SSH-level backpressure

  // incoming data
  this._waitChanDrain = false; // ChannelStream Readable side backpressure

  this._chunk = undefined;
  this._chunkcb = undefined;
  this.on('finish', function() {
    self._channel.eof();
    if (!self.allowHalfOpen)
      self._channel.close();
  });
  channel._conn.once('close', function() {
    if (self.readable) {
      self.push(null);
      self.once('end', function() {
        process.nextTick(function() {
          self.emit('close');
        });
      });
    }
    if (self.writable)
      self.end();
  });
}
inherits(ChannelStream, DuplexStream);

ChannelStream.prototype._read = function(n) {
  if (this._waitChanDrain) {
    this._waitChanDrain = false;
    if (this._channel.incoming.window === 0)
      this._channel._sendWndAdjust();
  }
};

ChannelStream.prototype._write = function(data, encoding, cb) {
  var chan = this._channel,
      len = data.length,
      p = 0,
      buf,
      sliceLen;

  while (len - p > 0 && chan.outgoing.window > 0) {
    sliceLen = len - p;
    if (sliceLen > chan.outgoing.window)
      sliceLen = chan.outgoing.window;
    if (sliceLen > chan.outgoing.packetSize)
      sliceLen = chan.outgoing.packetSize;

    chan._conn._debug&&chan._conn._debug('DEBUG: Channel: Sent CHANNEL_DATA');
    /*
      byte      SSH_MSG_CHANNEL_DATA
      uint32    recipient channel
      string    data
    */
    buf = new Buffer(1 + 4 + 4 + sliceLen);
    buf[0] = MESSAGE.CHANNEL_DATA;
    buf.writeUInt32BE(chan.outgoing.id, 1, true);
    buf.writeUInt32BE(sliceLen, 5, true);
    data.copy(buf, 9, p, p + sliceLen);

    p += sliceLen;
    chan.outgoing.window -= sliceLen;

    if (!chan._conn._send(buf)) {
      this._waitConDrain = true;
      this._chunk = undefined;
      this._chunkcb = cb;
      break;
    }
  }

  if (len - p > 0) {
    if (chan.outgoing.window === 0)
      this._waitWindow = true;
    if (p > 0) {
      // partial
      buf = new Buffer(len - p);
      data.copy(buf, 0, p);
      this._chunk = buf;
    } else
      this._chunk = data;
    this._chunkcb = cb;
    return;
  }

  if (!this._waitConDrain)
    cb();
};

ChannelStream.prototype.destroy = function() {
  this.end();
};

// session type-specific methods

ChannelStream.prototype.setWindow = function(rows, cols, height, width) {
  if (this._channel.type === 'session' && this._channel.subtype === 'shell')
    return this._channel._sendTermSizeChg(rows, cols, height, width);
};

ChannelStream.prototype.signal = function(signalName) {
  if (this._channel.type === 'session'
      && (this._channel.subtype === 'shell'
          || this._channel.subtype === 'exec'))
    return this._channel._sendSignal(signalName);
};
