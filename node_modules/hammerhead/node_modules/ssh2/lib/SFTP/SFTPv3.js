var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    inherits = util.inherits,
    isDate = util.isDate,
    fs = require('fs'),
    ReadableStream = require('stream').Readable
                     || require('readable-stream').Readable,
    WritableStream = require('stream').Writable
                     || require('readable-stream').Writable,
    Stats = require('./Stats');

var MAX_REQID = Math.pow(2, 32) - 1,
    VERSION_BUFFER = new Buffer([0, 0, 0, 5 /* length */,
                                 1 /* REQUEST.INIT */,
                                 0, 0, 0, 3 /* version */]),
    EMPTY_CALLBACK = function() {},
    /*
      http://tools.ietf.org/html/draft-ietf-secsh-filexfer-02:

         The maximum size of a packet is in practice determined by the client
         (the maximum size of read or write requests that it sends, plus a few
         bytes of packet overhead).  All servers SHOULD support packets of at
         least 34000 bytes (where the packet size refers to the full length,
         including the header above).  This should allow for reads and writes
         of at most 32768 bytes.

      OpenSSH caps this to 256kb instead of the ~34kb as mentioned in the sftpv3
      spec.
    */
    RE_OPENSSH = /^SSH-2.0-(?:OpenSSH|dropbear)/,
    OPENSSH_MAX_DATA_LEN = (256 * 1024) - (2 * 1024)/*account for header data*/;

module.exports = SFTP;

function SFTP(stream, server_ident_raw) {
  var self = this;

  this._stream = stream;
  this._requests = {};
  this._reqid = 0;
  this._reqidmaxed = false;

  this._count = 0;
  this._value = 0;
  this._string = undefined;
  this._field = 'packet_length';
  this._data = {
    len: 0,
    type: undefined,
    subtype: undefined,
    reqid: undefined,
    version: undefined,
    statusCode: undefined,
    errMsg: undefined,
    lang: undefined,
    handle: undefined,
    data: undefined,
    count: undefined,
    names: undefined,
    c: undefined,
    attrs: undefined,
    _attrs: undefined,
    _flags: undefined
  };

  if (RE_OPENSSH.test(server_ident_raw))
    this._max_data_len = OPENSSH_MAX_DATA_LEN;
  else
    this._max_data_len = 32768;

  stream.on('data', function(data) {
    self._parse(data);
  });
  stream.once('timeout', function() {
    self.emit('timeout');
  });
  stream.once('error', function(err) {
    self.emit('error', err);
  });
  stream.once('end', function() {
    self.emit('end');
  });
  stream.once('close', function(had_err) {
    self.emit('close', had_err);
  });
}
inherits(SFTP, EventEmitter);

SFTP.prototype.end = function() {
  this._stream.end();
};

SFTP.prototype.createReadStream = function(path, options) {
  return new ReadStream(this, path, options);
};

SFTP.prototype.createWriteStream = function(path, options) {
  return new WriteStream(this, path, options);
};

SFTP.prototype.open = function(path, flags, attrs, cb) {
  if (typeof attrs === 'function') {
    cb = attrs;
    attrs = undefined;
  }

  if (flags === 'r')
    flags = OPEN_MODE.READ;
  else if (flags === 'r+')
    flags = OPEN_MODE.READ | OPEN_MODE.WRITE;
  else if (flags === 'w')
    flags = OPEN_MODE.TRUNC | OPEN_MODE.CREAT | OPEN_MODE.WRITE;
  else if (flags === 'wx' || flags === 'xw')
    flags = OPEN_MODE.TRUNC | OPEN_MODE.CREAT | OPEN_MODE.WRITE | OPEN_MODE.EXCL;
  else if (flags === 'w+')
    flags = OPEN_MODE.TRUNC | OPEN_MODE.CREAT | OPEN_MODE.READ | OPEN_MODE.WRITE;
  else if (flags === 'wx+' || flags === 'xw+') {
    flags = OPEN_MODE.TRUNC | OPEN_MODE.CREAT | OPEN_MODE.READ | OPEN_MODE.WRITE
           | OPEN_MODE.EXCL;
  } else if (flags === 'a')
    flags = OPEN_MODE.APPEND | OPEN_MODE.CREAT | OPEN_MODE.WRITE;
  else if (flags === 'ax' || flags === 'xa')
    flags = OPEN_MODE.APPEND | OPEN_MODE.CREAT | OPEN_MODE.WRITE | OPEN_MODE.EXCL;
  else if (flags === 'a+')
    flags = OPEN_MODE.APPEND | OPEN_MODE.CREAT | OPEN_MODE.READ | OPEN_MODE.WRITE;
  else if (flags === 'ax+' || flags === 'xa+') {
    flags = OPEN_MODE.APPEND | OPEN_MODE.CREAT | OPEN_MODE.READ | OPEN_MODE.WRITE
           | OPEN_MODE.EXCL;
  } else
    throw new Error('Unknown file open flags: ' + flags);

  var attrFlags = 0,
      attrBytes = 0;
  if (typeof attrs === 'object') {
    attrs = attrsToBytes(attrs);
    attrFlags = attrs[0];
    attrBytes = attrs[1];
    attrs = attrs[2];
  }

  /*
    uint32        id
    string        filename
    uint32        pflags
    ATTRS         attrs
  */
  var pathlen = Buffer.byteLength(path),
      p = 9,
      buf = new Buffer(4 + 1 + 4 + 4 + pathlen + 4 + 4 + attrBytes);
  buf[4] = REQUEST.OPEN;
  buf.writeUInt32BE(pathlen, p, true);
  buf.write(path, p += 4, pathlen, 'utf8');
  buf.writeUInt32BE(flags, p += pathlen, true);
  buf.writeUInt32BE(attrFlags, p += 4, true);
  if (attrs && attrFlags) {
    p += 4;
    for (var i = 0, len = attrs.length; i < len; ++i)
      for (var j = 0, len2 = attrs[i].length; j < len2; ++j)
        buf[p++] = attrs[i][j];
  }

  return this._send(buf, cb);
};

SFTP.prototype.close = function(handle, cb) {
  if (!Buffer.isBuffer(handle))
    throw new Error('handle is not a Buffer');
  /*
    uint32     id
    string     handle
  */
  var handlelen = handle.length,
      p = 9,
      buf = new Buffer(4 + 1 + 4 + 4 + handlelen);
  buf[4] = REQUEST.CLOSE;
  buf.writeUInt32BE(handlelen, p, true);
  handle.copy(buf, p += 4);

  return this._send(buf, cb);
};

SFTP.prototype.read = function(handle, buffer, offset, length, position, cb) {
  // TODO: emulate support for position === null to match fs.read()
  if (!Buffer.isBuffer(handle))
    throw new Error('handle is not a Buffer');

  if (!Buffer.isBuffer(buffer))
    throw new Error('buffer is not a Buffer');
  else if (offset >= buffer.length)
    throw new Error('offset is out of bounds');
  else if (offset + length > buffer.length)
    throw new Error('length extends beyond buffer');

  if (position === null)
    throw new Error('null position currently unsupported');
  /*
    uint32     id
    string     handle
    uint64     offset
    uint32     len
  */
  var handlelen = handle.length,
      p = 9,
      pos = position,
      buf = new Buffer(4 + 1 + 4 + 4 + handlelen + 8 + 4);
  buf[4] = REQUEST.READ;
  buf.writeUInt32BE(handlelen, p, true);
  handle.copy(buf, p += 4);
  p += handlelen;
  for (var i = 7; i >= 0; --i) {
    buf[p + i] = pos & 0xFF;
    pos /= 256;
  }
  buf.writeUInt32BE(length, p += 8, true);

  return this._send(buf, function(err, bytesRead, data) {
    if (err)
      return cb(err);
    cb(undefined, bytesRead || 0, data, position);
  }, buffer.slice(offset, offset + length));
};

SFTP.prototype.write = function(handle, buffer, offset, length, position, cb) {
  var self = this;
  // TODO: emulate support for position === null to match fs.write()
  if (!Buffer.isBuffer(handle))
    throw new Error('handle is not a Buffer');
  else if (!Buffer.isBuffer(buffer))
    throw new Error('buffer is not a Buffer');
  else if (offset > buffer.length)
    throw new Error('offset is out of bounds');
  else if (offset + length > buffer.length)
    throw new Error('length extends beyond buffer');
  else if (position === null)
    throw new Error('null position currently unsupported');

  if (!length) {
    cb && process.nextTick(function() { cb(undefined, 0); });
    return;
  }

  var overflow = (length > this._max_data_len
                  ? length - this._max_data_len
                  : 0),
      origPosition = position;

  if (overflow)
    length = this._max_data_len;

  /*
    uint32     id
    string     handle
    uint64     offset
    string     data
  */
  var handlelen = handle.length,
      p = 9,
      buf = new Buffer(4 + 1 + 4 + 4 + handlelen + 8 + 4 + length);
  buf[4] = REQUEST.WRITE;
  buf.writeUInt32BE(handlelen, p, true);
  handle.copy(buf, p += 4);
  p += handlelen;
  for (var i = 7; i >= 0; --i) {
    buf[p + i] = position & 0xFF;
    position /= 256;
  }
  buf.writeUInt32BE(length, p += 8, true);
  buffer.copy(buf, p += 4, offset, offset + length);

  return this._send(buf, function(err) {
    if (err)
      cb && cb(err);
    else if (overflow) {
      self.write(handle,
                 buffer,
                 offset + length,
                 overflow,
                 origPosition + length,
                 cb);
    } else
      cb && cb(undefined, length);
  });
};

function fastXfer(src, dst, srcPath, dstPath, opts, cb) {
  var concurrency = 25,
      chunkSize = 32768,
      onstep;

  if (typeof opts === 'function')
    cb = opts;
  else if (typeof opts === 'object') {
    if (typeof opts.concurrency === 'number'
        && opts.concurrency > 0
        && !isNaN(opts.concurrency))
      concurrency = opts.concurrency;
    if (typeof opts.chunkSize === 'number'
        && opts.chunkSize > 0
        && !isNaN(opts.chunkSize))
      chunkSize = opts.chunkSize;
    if (typeof opts.step === 'function')
      onstep = opts.step;
  }

  // internal state variables
  var fsize,
      chunk,
      psrc = 0,
      pdst = 0,
      reads = 0,
      total = 0,
      srcHandle,
      dstHandle,
      readbuf = new Buffer(chunkSize * concurrency);

  function onerror(err) {
    var left = 0,
        cbfinal;

    if (srcHandle || dstHandle) {
      cbfinal = function() {
        if (--left === 0)
          cb(err);
      };
      if (srcHandle)
        ++left;
      if (dstHandle)
        ++left;
      if (srcHandle)
        src.close(srcHandle, cbfinal);
      if (dstHandle)
        dst.close(dstHandle, cbfinal);
    } else
      cb(err);
  }

  src.open(srcPath, 'r', function(err, sourceHandle) {
    if (err)
      return onerror(err);
    srcHandle = sourceHandle;

    src.fstat(srcHandle, function(err, attrs) {
      if (err)
        return onerror(err);
      fsize = attrs.size;

      dst.open(dstPath, 'w', function(err, destHandle) {
        if (err)
          return onerror(err);
        dstHandle = destHandle;

        if (fsize <= 0)
          return onerror();

        function onread(err, nb, data, dstpos, datapos) {
          if (err)
            return onerror(err);

          dst.write(dstHandle, data, datapos || 0, nb, dstpos, function(err) {
            if (err)
              return onerror(err);

            onstep && onstep(total, nb, fsize);

            if (--reads === 0) {
              if (total === fsize) {
                dst.close(dstHandle, function(err) {
                  dstHandle = undefined;
                  if (err)
                    return onerror(err);
                  src.close(srcHandle, function(err) {
                    srcHandle = undefined;
                    if (err)
                      return onerror(err);
                    cb();
                  });
                });
              } else
                read();
            }
          });
          total += nb;
        }

        function makeCb(psrc, pdst) {
          return function(err, nb, data) {
            onread(err, nb, data, pdst, psrc);
          };
        }

        function read() {
          while (pdst < fsize && reads < concurrency) {
            chunk = (pdst + chunkSize > fsize ? fsize - pdst : chunkSize);
            if (src === fs)
              src.read(srcHandle, readbuf, psrc, chunk, pdst, makeCb(psrc, pdst));
            else
              src.read(srcHandle, readbuf, psrc, chunk, pdst, onread);
            psrc += chunk;
            pdst += chunk;
            ++reads;
          }
          psrc = 0;
        }
        read();
      });
    });
  });
}

SFTP.prototype.fastGet = function(remotePath, localPath, opts, cb) {
  fastXfer(this, fs, remotePath, localPath, opts, cb);
};

SFTP.prototype.fastPut = function(localPath, remotePath, opts, cb) {
  fastXfer(fs, this, localPath, remotePath, opts, cb);
};

SFTP.prototype.readFile = function(path, options, callback_) {
  var callback = (typeof callback_ === 'function' ? callback_ : undefined);
  var self = this;

  if (typeof options === 'function' || !options)
    options = { encoding: null, flag: 'r' };
  else if (typeof options === 'string')
    options = { encoding: options, flag: 'r' };
  else if (!options)
    options = { encoding: null, flag: 'r' };
  else if (typeof options !== 'object')
    throw new TypeError('Bad arguments');

  var encoding = options.encoding;
  if (encoding && !Buffer.isEncoding(encoding))
    throw new Error('Unknown encoding: ' + encoding);

  // first, stat the file, so we know the size.
  var size;
  var buffer; // single buffer with file data
  var buffers; // list for when size is unknown
  var pos = 0;
  var handle;

  // SFTPv3 does not support using -1 for read position, so we have to track
  // read position manually
  var bytesRead = 0;

  var flag = options.flag || 'r';
  this.open(path, flag, 438 /*=0666*/, function(er, handle_) {
    if (er)
      return callback && callback(er);
    handle = handle_;

    self.fstat(handle, function(er, st) {
      if (er) {
        return self.close(handle, function() {
          callback && callback(er);
        });
      }

      size = st.size;
      if (size === 0) {
        // the kernel lies about many files.
        // Go ahead and try to read some bytes.
        buffers = [];
        return read();
      }

      buffer = new Buffer(size);
      read();
    });
  });

  function read() {
    if (size === 0) {
      buffer = new Buffer(8192);
      self.read(handle, buffer, 0, 8192, bytesRead, afterRead);
    } else
      self.read(handle, buffer, pos, size - pos, bytesRead, afterRead);
  }

  function afterRead(er, nbytes) {
    if (er) {
      return self.close(handle, function() {
        return callback && callback(er);
      });
    }

    if (nbytes === 0)
      return close();

    bytesRead += nbytes;
    pos += nbytes;
    if (size !== 0) {
      if (pos === size)
        close();
      else
        read();
    } else {
      // unknown size, just read until we don't get bytes.
      buffers.push(buffer.slice(0, nbytes));
      read();
    }
  }

  function close() {
    self.close(handle, function(er) {
      if (size === 0) {
        // collected the data into the buffers list.
        buffer = Buffer.concat(buffers, pos);
      } else if (pos < size)
        buffer = buffer.slice(0, pos);

      if (encoding)
        buffer = buffer.toString(encoding);
      return callback && callback(er, buffer);
    });
  }
};

SFTP.prototype.writeFile = function(path, data, options, callback_) {
  var callback = (typeof callback_ === 'function' ? callback_ : undefined);
  var self = this;

  if (typeof options === 'function' || !options) {
    callback = options;
    options = { encoding: 'utf8', mode: 438 /*=0666*/, flag: 'w' };
  } else if (typeof options === 'string')
    options = { encoding: options, mode: 438, flag: 'w' };
  else if (!options)
    options = { encoding: 'utf8', mode: 438 /*=0666*/, flag: 'w' };
  else if (typeof options !== 'object')
    throw new TypeError('Bad arguments');

  if (options.encoding && !Buffer.isEncoding(options.encoding))
    throw new Error('Unknown encoding: ' + options.encoding);

  var flag = options.flag || 'w';
  this.open(path, flag, options.mode, function(openErr, handle) {
    if (openErr)
      callback && callback(openErr);
    else {
      var buffer = (Buffer.isBuffer(data)
                    ? data
                    : new Buffer('' + data, options.encoding || 'utf8'));
      var position = (/a/.test(flag) ? null : 0);

      // SFTPv3 does not support the notion of 'current position'
      // (null position), so we just append to the end of the file instead
      if (position === null) {
        self.fstat(handle, function(er, st) {
          if (er) {
            return self.close(handle, function() {
              callback && callback(er);
            });
          }
          self._writeAll(handle, buffer, 0, buffer.length, st.size, callback);
        });
        return;
      }
      self._writeAll(handle, buffer, 0, buffer.length, position, callback);
    }
  });
};

SFTP.prototype.appendFile = function(path, data, options, callback_) {
  var callback = (typeof callback_ === 'function' ? callback_ : undefined);
  if (typeof options === 'function' || !options) {
    callback = options;
    options = { encoding: 'utf8', mode: 438 /*=0666*/, flag: 'a' };
  } else if (typeof options === 'string')
    options = { encoding: options, mode: 438, flag: 'a' };
  else if (!options)
    options = { encoding: 'utf8', mode: 438 /*=0666*/, flag: 'a' };
  else if (typeof options !== 'object')
    throw new TypeError('Bad arguments');

  if (!options.flag)
    options = util._extend({ flag: 'a' }, options);
  this.writeFile(path, data, options, callback_);
};

SFTP.prototype.exists = function(path, cb) {
  this.stat(path, function(err) {
    cb && cb(err ? false : true);
  });
};

SFTP.prototype.unlink = function(filename, cb) {
  /*
    uint32     id
    string     filename
  */
  var fnamelen = Buffer.byteLength(filename),
      p = 9,
      buf = new Buffer(4 + 1 + 4 + 4 + fnamelen);
  buf[4] = REQUEST.REMOVE;
  buf.writeUInt32BE(fnamelen, p, true);
  buf.write(filename, p += 4, fnamelen, 'utf8');

  return this._send(buf, cb);
};

SFTP.prototype.rename = function(oldPath, newPath, cb) {
  /*
    uint32     id
    string     oldpath
    string     newpath
  */
  var oldlen = Buffer.byteLength(oldPath),
      newlen = Buffer.byteLength(newPath),
      p = 9,
      buf = new Buffer(4 + 1 + 4 + 4 + oldlen + 4 + newlen);
  buf[4] = REQUEST.RENAME;
  buf.writeUInt32BE(oldlen, p, true);
  buf.write(oldPath, p += 4, oldlen, 'utf8');
  buf.writeUInt32BE(newlen, p += oldlen, true);
  buf.write(newPath, p += 4, newlen, 'utf8');

  return this._send(buf, cb);
};

SFTP.prototype.mkdir = function(path, attrs, cb) {
  var flags = 0, attrBytes = 0;
  if (typeof attrs === 'function') {
    cb = attrs;
    attrs = undefined;
  }
  if (typeof attrs === 'object') {
    attrs = attrsToBytes(attrs);
    flags = attrs[0];
    attrBytes = attrs[1];
    attrs = attrs[2];
  }
  /*
    uint32     id
    string     path
    ATTRS      attrs
  */
  var pathlen = Buffer.byteLength(path),
      p = 9,
      buf = new Buffer(4 + 1 + 4 + 4 + pathlen + 4 + attrBytes);
  buf[4] = REQUEST.MKDIR;
  buf.writeUInt32BE(pathlen, p, true);
  buf.write(path, p += 4, pathlen, 'utf8');
  buf.writeUInt32BE(flags, p += pathlen);
  if (flags) {
    p += 4;
    for (var i = 0, len = attrs.length; i < len; ++i)
      for (var j = 0, len2 = attrs[i].length; j < len2; ++j)
        buf[p++] = attrs[i][j];
  }

  return this._send(buf, cb);
};

SFTP.prototype.rmdir = function(path, cb) {
  /*
    uint32     id
    string     path
  */
  var pathlen = Buffer.byteLength(path),
      p = 9,
      buf = new Buffer(4 + 1 + 4 + 4 + pathlen);
  buf[4] = REQUEST.RMDIR;
  buf.writeUInt32BE(pathlen, p, true);
  buf.write(path, p += 4, pathlen, 'utf8');

  return this._send(buf, cb);
};

SFTP.prototype.readdir = function(where, cb) {
  if (!Buffer.isBuffer(where) && typeof where !== 'string')
    throw new Error('missing directory handle or path');

  if (typeof where === 'string') {
    var self = this,
        entries = [];
    return this.opendir(where, function reread(err, handle) {
      if (err)
        return cb(err);
      self.readdir(handle, function(err, list) {
        if (err) {
          return self.close(handle, function() {
            cb(err);
          });
        }
        if (list === false) {
          return self.close(handle, function(err) {
            if (err)
              return cb(err);
            cb(undefined, entries);
          });
        }
        entries = entries.concat(list);
        reread(undefined, handle);
      });
    });
  }

  /*
    uint32     id
    string     handle
  */
  var handlelen = where.length,
      p = 9,
      buf = new Buffer(4 + 1 + 4 + 4 + handlelen);
  buf[4] = REQUEST.READDIR;
  buf.writeUInt32BE(handlelen, p, true);
  where.copy(buf, p += 4);

  return this._send(buf, function(err, list) {
    if (err || list === false)
      return cb(err, list);
    for (var i = list.length - 1; i >= 0; --i) {
      if (list[i].filename === '.' || list[i].filename === '..')
        list.splice(i, 1);
    }
    cb(err, list);
  });
};

SFTP.prototype.fstat = function(handle, cb) {
  if (!Buffer.isBuffer(handle))
    throw new Error('handle is not a Buffer');
  /*
    uint32     id
    string     handle
  */
  var handlelen = handle.length,
      p = 9,
      buf = new Buffer(4 + 1 + 4 + 4 + handlelen);
  buf[4] = REQUEST.FSTAT;
  buf.writeUInt32BE(handlelen, p, true);
  handle.copy(buf, p += 4);

  return this._send(buf, cb);
};

SFTP.prototype.stat = function(path, cb) {
  /*
    uint32     id
    string     path
  */
  var pathlen = Buffer.byteLength(path),
      p = 9,
      buf = new Buffer(4 + 1 + 4 + 4 + pathlen);
  buf[4] = REQUEST.STAT;
  buf.writeUInt32BE(pathlen, p, true);
  buf.write(path, p += 4, pathlen, 'utf8');

  return this._send(buf, cb);
};

SFTP.prototype.lstat = function(path, cb) {
  /*
    uint32     id
    string     path
  */
  var pathlen = Buffer.byteLength(path),
      p = 9,
      buf = new Buffer(4 + 1 + 4 + 4 + pathlen);
  buf[4] = REQUEST.LSTAT;
  buf.writeUInt32BE(pathlen, p, true);
  buf.write(path, p += 4, pathlen, 'utf8');

  return this._send(buf, cb);
};

SFTP.prototype.opendir = function(path, cb) {
  /*
    uint32     id
    string     path
  */
  var pathlen = Buffer.byteLength(path),
      p = 9,
      buf = new Buffer(4 + 1 + 4 + 4 + pathlen);
  buf[4] = REQUEST.OPENDIR;
  buf.writeUInt32BE(pathlen, p, true);
  buf.write(path, p += 4, pathlen, 'utf8');

  return this._send(buf, cb);
};

SFTP.prototype.setstat = function(path, attrs, cb) {
  var flags = 0, attrBytes = 0;
  if (typeof attrs === 'object') {
    attrs = attrsToBytes(attrs);
    flags = attrs[0];
    attrBytes = attrs[1];
    attrs = attrs[2];
  } else if (typeof attrs === 'function')
    cb = attrs;

  /*
    uint32     id
    string     path
    ATTRS      attrs
  */
  var pathlen = Buffer.byteLength(path),
      p = 9,
      buf = new Buffer(4 + 1 + 4 + 4 + pathlen + 4 + attrBytes);
  buf[4] = REQUEST.SETSTAT;
  buf.writeUInt32BE(pathlen, p, true);
  buf.write(path, p += 4, pathlen, 'utf8');
  buf.writeUInt32BE(flags, p += pathlen);
  if (flags) {
    p += 4;
    for (var i = 0, len = attrs.length; i < len; ++i)
      for (var j = 0, len2 = attrs[i].length; j < len2; ++j)
        buf[p++] = attrs[i][j];
  }

  return this._send(buf, cb);
};

SFTP.prototype.fsetstat = function(handle, attrs, cb) {
  var flags = 0, attrBytes = 0;

  if (!Buffer.isBuffer(handle))
    throw new Error('handle is not a Buffer');

  if (typeof attrs === 'object') {
    attrs = attrsToBytes(attrs);
    flags = attrs[0];
    attrBytes = attrs[1];
    attrs = attrs[2];
  } else if (typeof attrs === 'function')
    cb = attrs;

  /*
    uint32     id
    string     handle
    ATTRS      attrs
  */
  var handlelen = handle.length,
      p = 9,
      buf = new Buffer(4 + 1 + 4 + 4 + handlelen + 4 + attrBytes);
  buf[4] = REQUEST.FSETSTAT;
  buf.writeUInt32BE(handlelen, p, true);
  handle.copy(buf, p += 4);
  buf.writeUInt32BE(flags, p += handlelen);
  if (flags) {
    p += 4;
    for (var i = 0, len = attrs.length; i < len; ++i)
      for (var j = 0, len2 = attrs[i].length; j < len2; ++j)
        buf[p++] = attrs[i][j];
  }

  return this._send(buf, cb);
};

SFTP.prototype.futimes = function(handle, atime, mtime, cb) {
  return this.fsetstat(handle, {
    atime: toUnixTimestamp(atime),
    mtime: toUnixTimestamp(mtime)
  }, cb);
};

SFTP.prototype.utimes = function(path, atime, mtime, cb) {
  return this.setstat(path, {
    atime: toUnixTimestamp(atime),
    mtime: toUnixTimestamp(mtime)
  }, cb);
};

SFTP.prototype.fchown = function(handle, uid, gid, cb) {
  return this.fsetstat(handle, {
    uid: uid,
    gid: gid
  }, cb);
};

SFTP.prototype.chown = function(path, uid, gid, cb) {
  return this.setstat(path, {
    uid: uid,
    gid: gid
  }, cb);
};

SFTP.prototype.fchmod = function(handle, mode, cb) {
  return this.fsetstat(handle, {
    mode: mode
  }, cb);
};

SFTP.prototype.chmod = function(path, mode, cb) {
  return this.setstat(path, {
    mode: mode
  }, cb);
};

SFTP.prototype.readlink = function(path, cb) {
  /*
    uint32     id
    string     path
  */
  var pathlen = Buffer.byteLength(path),
      p = 9,
      buf = new Buffer(4 + 1 + 4 + 4 + pathlen);
  buf[4] = REQUEST.READLINK;
  buf.writeUInt32BE(pathlen, p, true);
  buf.write(path, p += 4, pathlen, 'utf8');

  return this._send(buf, function(err, names) {
    if (err)
      return cb(err);
    cb(undefined, names[0].filename);
  });
};

SFTP.prototype.symlink = function(targetPath, linkPath, cb) {
  /*
    uint32     id
    string     linkpath
    string     targetpath
  */
  var linklen = Buffer.byteLength(linkPath),
      targetlen = Buffer.byteLength(targetPath),
      p = 9,
      buf = new Buffer(4 + 1 + 4 + 4 + linklen + 4 + targetlen);
  buf[4] = REQUEST.SYMLINK;
  buf.writeUInt32BE(targetlen, p, true);
  buf.write(targetPath, p += 4, targetlen, 'utf8');
  buf.writeUInt32BE(linklen, p += targetlen, true);
  buf.write(linkPath, p += 4, linklen, 'utf8');

  return this._send(buf, cb);
};

SFTP.prototype.realpath = function(path, cb) {
  /*
    uint32     id
    string     path
  */
  var pathlen = Buffer.byteLength(path),
      p = 9,
      buf = new Buffer(4 + 1 + 4 + 4 + pathlen);
  buf[4] = REQUEST.REALPATH;
  buf.writeUInt32BE(pathlen, p, true);
  buf.write(path, p += 4, pathlen, 'utf8');

  return this._send(buf, function(err, names) {
    if (err)
      return cb(err);
    cb(undefined, names[0].filename);
  });
};

// used by writeFile and appendFile
SFTP.prototype._writeAll = function(handle, buffer, offset, length, position, callback_) {
  var callback = (typeof callback_ === 'function' ? callback_ : undefined);
  var self = this;

  this.write(handle, buffer, offset, length, position, function(writeErr, written) {
    if (writeErr) {
      return self.close(handle, function() {
        callback && callback(writeErr);
      });
    }
    if (written === length)
      self.close(handle, callback);
    else {
      offset += written;
      length -= written;
      position += written;
      self._writeAll(handle, buffer, offset, length, position, callback);
    }
  });
};

SFTP.prototype._send = function(data, cb, buffer) {
  var err;
  if (this._reqid === MAX_REQID && !this._reqidmaxed) {
    this._reqid = 0;
    this._reqidmaxed = true;
  }
  if (this._reqidmaxed) {
    var found = false;
    for (var i = 0; i < MAX_REQID; ++i) {
      if (!this._requests[i]) {
        this._reqid = i;
        found = true;
        break;
      }
    }
    if (!found) {
      err = new Error('Exhausted available SFTP request IDs');
      if (typeof cb === 'function')
        cb(err);
      else
        this.emit('error', err);
      return;
    }
  }

  if (!this._stream.writable) {
    err = new Error('Underlying stream not writable');
    if (typeof cb === 'function')
      cb(err);
    else
      this.emit('error', err);
    return;
  }

  if (typeof cb !== 'function')
    cb = EMPTY_CALLBACK;

  this._requests[this._reqid] = { cb: cb, buffer: buffer };

  /*
    uint32             length
    byte               type
    byte[length - 1]   data payload
  */
  data.writeUInt32BE(data.length - 4, 0, true);
  data.writeUInt32BE(this._reqid++, 5, true);

  return this._stream.write(data);
};

SFTP.prototype._init = function() {
  /*
    uint32 version
    <extension data>
  */
  if (!this._stream.writable) {
    var err = new Error('Underlying stream not writable');
    return this.emit('error', err);
  }

  return this._stream.write(VERSION_BUFFER);
};

SFTP.prototype._parse = function(chunk) {
  var data = this._data, chunklen = chunk.length, cb;
  chunk.i = 0;
  while (chunk.i < chunklen) {
    if (data.type === 'discard')
      --data.len;
    else if (this._field === 'packet_length') {
      if ((data.len = this._readUInt32BE(chunk)) !== false)
        this._field = 'type';
    } else if (this._field === 'type') {
      --data.len;
      data.type = chunk[chunk.i];
      if (!data.type)
        throw new Error('Unsupported packet type: ' + chunk[chunk.i]);
      this._field = 'payload';
    } else if (data.type === RESPONSE.VERSION) {
      /*
        uint32 version
        <extension data>
      */
      if (!data.subtype) {
        if ((data.version = this._readUInt32BE(chunk)) !== false) {
          if (data.version !== 3)
            return this.emit('error', new Error('Incompatible SFTP version'));
          //data.subtype = 'extension';
          data.type = 'discard';
          this.emit('ready');
        }
      } else if (data.subtype === 'extension') {
        // TODO
      }
    } else if (data.type === RESPONSE.STATUS) {
      /*
        uint32     id
        uint32     error/status code
        string     error message (ISO-10646 UTF-8)
        string     language tag
      */
      if (!data.subtype) {
        if ((data.reqid = this._readUInt32BE(chunk)) !== false)
          data.subtype = 'status code';
      } else if (data.subtype === 'status code') {
        if ((data.statusCode = this._readUInt32BE(chunk)) !== false)
          data.subtype = 'error message';
      } else if (data.subtype === 'error message') {
        if ((data.errMsg = this._readString(chunk, 'utf8')) !== false)
          data.subtype = 'language';
      } else if (data.subtype === 'language') {
        if ((data.lang = this._readString(chunk, 'utf8')) !== false) {
          data.type = 'discard';
          cb = this._requests[data.reqid].cb;
          delete this._requests[data.reqid];
          if (data.statusCode === STATUS_CODE.OK)
            cb();
          else if (data.statusCode === STATUS_CODE.EOF)
            cb(undefined, false);
          else {
            var err = new Error(data.errMsg);
            err.type = STATUS_CODE[data.statusCode];
            err.lang = data.lang;
            cb(err);
          }
        }
      }
    } else if (data.type === RESPONSE.HANDLE) {
      /*
        uint32     id
        string     handle
      */
      if (!data.subtype) {
        if ((data.reqid = this._readUInt32BE(chunk)) !== false)
          data.subtype = 'handle blob';
      } else if (data.subtype === 'handle blob') {
        if ((data.handle = this._readString(chunk)) !== false) {
          data.type = 'discard';
          cb = this._requests[data.reqid].cb;
          delete this._requests[data.reqid];
          cb(undefined, data.handle);
        }
      }
    } else if (data.type === RESPONSE.DATA) {
      /*
        uint32     id
        string     data
      */
      if (!data.subtype) {
        if ((data.reqid = this._readUInt32BE(chunk)) !== false)
          data.subtype = 'data';
      } else if (data.subtype === 'data') {
        if ((data.data = this._readString(chunk)) !== false) {
          data.type = 'discard';
          cb = this._requests[data.reqid].cb;
          var nbytes = this._requests[data.reqid].nbytes;
          delete this._requests[data.reqid];
          cb(undefined, nbytes, data.data);
        }
      }
    } else if (data.type === RESPONSE.NAME) {
      /*
        uint32     id
        uint32     count
        repeats count times:
                string     filename
                string     longname
                ATTRS      attrs
      */
      if (!data.subtype) {
        if ((data.reqid = this._readUInt32BE(chunk)) !== false)
          data.subtype = 'count';
      } else if (data.subtype === 'count') {
        if ((data.count = this._readUInt32BE(chunk)) !== false) {
          data.names = new Array(data.count);
          if (data.count > 0) {
            data.c = 0;
            data.subtype = 'filename';
          } else {
            data.type = 'discard';
            cb = this._requests[data.reqid].cb;
            delete this._requests[data.reqid];
            cb(undefined, data.names);
          }
        }
      } else if (data.subtype === 'filename') {
        if (!data.names[data.c]) {
          data.names[data.c] = {
            filename: undefined,
            longname: undefined,
            attrs: undefined
          };
        }
        if ((data.names[data.c].filename = this._readString(chunk, 'utf8')) !== false)
          data.subtype = 'longname';
      } else if (data.subtype === 'longname') {
        if ((data.names[data.c].longname = this._readString(chunk, 'utf8')) !== false)
          data.subtype = 'attrs';
      } else if (data.subtype === 'attrs') {
        if ((data.names[data.c].attrs = this._readAttrs(chunk)) !== false) {
          if (++data.c < data.count)
            data.subtype = 'filename';
          else {
            data.type = 'discard';
            cb = this._requests[data.reqid].cb;
            delete this._requests[data.reqid];
            cb(undefined, data.names);
          }
        }
      }
    } else if (data.type === RESPONSE.ATTRS) {
      /*
        uint32     id
        ATTRS      attrs
      */
      if (!data.subtype) {
        if ((data.reqid = this._readUInt32BE(chunk)) !== false)
          data.subtype = 'attrs';
      } else if (data.subtype === 'attrs') {
        if ((data.attrs = this._readAttrs(chunk)) !== false) {
          data.type = 'discard';
          cb = this._requests[data.reqid].cb;
          delete this._requests[data.reqid];
          cb(undefined, data.attrs);
        }
      }
    } else if (data.type === RESPONSE.EXTENDED) {
      /*
        uint32     id
        string     extended-request
        ... any request-specific data ...
      */
      // TODO
      --data.len;
      data.type = 'discard';
    }

    if (data.len === 0 && this._field !== 'packet_length')
      this._reset();
    ++chunk.i;
  }
};

SFTP.prototype._readUInt32BE = function(chunk) {
  this._value <<= 8;
  this._value += chunk[chunk.i];
  --this._data.len;
  if (++this._count === 4) {
    var val = this._value;
    this._count = 0;
    this._value = 0;
    return val;
  }
  return false;
};

SFTP.prototype._readUInt64BE = function(chunk) {
  this._value *= 256;
  this._value += chunk[chunk.i];
  --this._data.len;
  if (++this._count === 8) {
    var val = this._value;
    this._count = 0;
    this._value = 0;
    return val;
  }
  return false;
};

SFTP.prototype._readString = function(chunk, encoding) {
  if (this._count < 4 && this._string === undefined) {
    this._value <<= 8;
    this._value += chunk[chunk.i];
    if (++this._count === 4) {
      this._data.len -= 4;
      this._count = 0;
      if (this._value === 0) {
        if (!encoding) {
          if (Buffer.isBuffer(this._requests[this._data.reqid].buffer))
            this._requests[this._data.reqid].nbytes = 0;
          return new Buffer(0);
        } else
          return '';
      }
      if (!encoding) {
        if (Buffer.isBuffer(this._requests[this._data.reqid].buffer)) {
          this._string = this._requests[this._data.reqid].buffer;
          this._requests[this._data.reqid].nbytes = this._value;
        } else
          this._string = new Buffer(this._value);
      } else
        this._string = '';
    }
  } else if (this._string !== undefined) {
    if (this._value <= chunk.length - chunk.i) {
      // rest of string is in the chunk
      var str;
      if (!encoding) {
        chunk.copy(this._string, this._count, chunk.i, chunk.i + this._value);
        str = this._string;
      } else {
        str = this._string + chunk.toString(encoding || 'ascii', chunk.i,
                                            chunk.i + this._value);
      }
      chunk.i += this._value - 1;
      this._data.len -= this._value;
      this._string = undefined;
      this._value = 0;
      this._count = 0;
      return str;
    } else {
      // only part or none of string in rest of chunk
      var diff = chunk.length - chunk.i;
      if (diff > 0) {
        if (!encoding) {
          chunk.copy(this._string, this._count, chunk.i);
          this._count += diff;
        } else
          this._string += chunk.toString(encoding || 'ascii', chunk.i);
        chunk.i = chunk.length;
        this._data.len -= diff;
        this._value -= diff;
      }
    }
  }

  return false;
};

SFTP.prototype._readAttrs = function(chunk) {
  /*
    uint32   flags
    uint64   size           present only if flag SSH_FILEXFER_ATTR_SIZE
    uint32   uid            present only if flag SSH_FILEXFER_ATTR_UIDGID
    uint32   gid            present only if flag SSH_FILEXFER_ATTR_UIDGID
    uint32   permissions    present only if flag SSH_FILEXFER_ATTR_PERMISSIONS
    uint32   atime          present only if flag SSH_FILEXFER_ACMODTIME
    uint32   mtime          present only if flag SSH_FILEXFER_ACMODTIME
    uint32   extended_count present only if flag SSH_FILEXFER_ATTR_EXTENDED
    string   extended_type
    string   extended_data
    ...      more extended data (extended_type - extended_data pairs),
               so that number of pairs equals extended_count
  */
  var data = this._data;
  if (!data._attrs)
    data._attrs = new Stats();

  if (typeof data._flags !== 'number')
    data._flags = this._readUInt32BE(chunk);
  else if (data._flags & ATTR.SIZE) {
    if ((data._attrs.size = this._readUInt64BE(chunk)) !== false)
      data._flags &= ~ATTR.SIZE;
  } else if (data._flags & ATTR.UIDGID) {
    if (typeof data._attrs.uid !== 'number')
      data._attrs.uid = this._readUInt32BE(chunk);
    else if ((data._attrs.gid = this._readUInt32BE(chunk)) !== false)
      data._flags &= ~ATTR.UIDGID;
  } else if (data._flags & ATTR.PERMISSIONS) {
    if ((data._attrs.mode = this._readUInt32BE(chunk)) !== false) {
      data._flags &= ~ATTR.PERMISSIONS;
      // backwards compatibility
      data._attrs.permissions = data._attrs.mode;
    }
  } else if (data._flags & ATTR.ACMODTIME) {
    if (typeof data._attrs.atime !== 'number')
      data._attrs.atime = this._readUInt32BE(chunk);
    else if ((data._attrs.mtime = this._readUInt32BE(chunk)) !== false)
      data._flags &= ~ATTR.ACMODTIME;
  } else if (data._flags & ATTR.EXTENDED) {
    //data._flags &= ~ATTR.EXTENDED;
    data._flags = 0;
    /*if (typeof data._attrsnExt !== 'number')
      data._attrsnExt = this._readUInt32BE(chunk);*/
  }

  if (data._flags === 0) {
    var ret = data._attrs;
    data._flags = undefined;
    data._attrs = undefined;
    return ret;
  }

  return false;
};

SFTP.prototype._reset = function() {
  this._count = 0;
  this._value = 0;
  this._string = undefined;
  this._field = 'packet_length';

  this._data.len = 0;
  this._data.type = undefined;
  this._data.subtype = undefined;
  this._data.reqid = undefined;
  this._data.version = undefined;
  this._data.statusCode = undefined;
  this._data.errMsg = undefined;
  this._data.lang = undefined;
  this._data.handle = undefined;
  this._data.data = undefined;
  this._data.count = undefined;
  this._data.names = undefined;
  this._data.c = undefined;
  this._data.attrs = undefined;
  this._data._attrs = undefined;
  this._data._flags = undefined;
};

var ATTR = {
  SIZE: 0x00000001,
  UIDGID: 0x00000002,
  PERMISSIONS: 0x00000004,
  ACMODTIME: 0x00000008,
  EXTENDED: 0x80000000
};

var STATUS_CODE = {
  OK: 0,
  EOF: 1,
  NO_SUCH_FILE: 2,
  PERMISSION_DENIED: 3,
  FAILURE: 4,
  BAD_MESSAGE: 5,
  NO_CONNECTION: 6,
  CONNECTION_LOST: 7,
  OP_UNSUPPORTED: 8
};
for (var i=0,keys=Object.keys(STATUS_CODE),len=keys.length; i<len; ++i)
  STATUS_CODE[STATUS_CODE[keys[i]]] = keys[i];

var REQUEST = {
  INIT: 1,
  OPEN: 3,
  CLOSE: 4,
  READ: 5,
  WRITE: 6,
  LSTAT: 7,
  FSTAT: 8,
  SETSTAT: 9,
  FSETSTAT: 10,
  OPENDIR: 11,
  READDIR: 12,
  REMOVE: 13,
  MKDIR: 14,
  RMDIR: 15,
  REALPATH: 16,
  STAT: 17,
  RENAME: 18,
  READLINK: 19,
  SYMLINK: 20
};
for (var i=0,keys=Object.keys(REQUEST),len=keys.length; i<len; ++i)
  REQUEST[REQUEST[keys[i]]] = keys[i];

var RESPONSE = {
  VERSION: 2,
  STATUS: 101,
  HANDLE: 102,
  DATA: 103,
  NAME: 104,
  ATTRS: 105,
  EXTENDED: 201
};
for (var i=0,keys=Object.keys(RESPONSE),len=keys.length; i<len; ++i)
  RESPONSE[RESPONSE[keys[i]]] = keys[i];

var OPEN_MODE = {
  READ: 0x00000001,
  WRITE: 0x00000002,
  APPEND: 0x00000004,
  CREAT: 0x00000008,
  TRUNC: 0x00000010,
  EXCL: 0x00000020
};

function attrsToBytes(attrs) {
  var flags = 0, attrBytes = 0, ret = [], i = 0;

  if (typeof attrs.size === 'number') {
    flags |= ATTR.SIZE;
    attrBytes += 8;
    var sizeBytes = new Array(8), val = attrs.size;
    for (i = 7; i >= 0; --i) {
      sizeBytes[i] = val & 0xFF;
      val /= 256;
    }
    ret.push(sizeBytes);
  }
  if (typeof attrs.uid === 'number' && typeof attrs.gid === 'number') {
    flags |= ATTR.UIDGID;
    attrBytes += 8;
    ret.push([(attrs.uid >> 24) & 0xFF, (attrs.uid >> 16) & 0xFF,
              (attrs.uid >> 8) & 0xFF, attrs.uid & 0xFF]);
    ret.push([(attrs.gid >> 24) & 0xFF, (attrs.gid >> 16) & 0xFF,
              (attrs.gid >> 8) & 0xFF, attrs.gid & 0xFF]);
  }
  if (typeof attrs.permissions === 'number'
      || typeof attrs.permissions === 'string'
      || typeof attrs.mode === 'number'
      || typeof attrs.mode === 'string') {
    var mode = modeNum(attrs.mode || attrs.permissions);
    flags |= ATTR.PERMISSIONS;
    attrBytes += 4;
    ret.push([(mode >> 24) & 0xFF,
              (mode >> 16) & 0xFF,
              (mode >> 8) & 0xFF,
              mode & 0xFF]);
  }
  if ((typeof attrs.atime === 'number' || isDate(attrs.atime))
      && (typeof attrs.mtime === 'number' || isDate(attrs.mtime))) {
    var atime = toUnixTimestamp(attrs.atime),
        mtime = toUnixTimestamp(attrs.mtime);
    flags |= ATTR.ACMODTIME;
    attrBytes += 8;
    ret.push([(atime >> 24) & 0xFF, (atime >> 16) & 0xFF,
              (atime >> 8) & 0xFF, atime & 0xFF]);
    ret.push([(mtime >> 24) & 0xFF, (mtime >> 16) & 0xFF,
              (mtime >> 8) & 0xFF, mtime & 0xFF]);
  }
  // TODO: extended attributes

  return [flags, attrBytes, ret];
}

function toUnixTimestamp(time) {
  if (typeof time === 'number' && !isNaN(time))
    return time;
  else if (isDate(time))
    return parseInt(time.getTime() / 1000, 10);
  throw new Error('Cannot parse time: ' + time);
}

function modeNum(mode) {
  if (typeof mode === 'number' && !isNaN(mode))
    return mode;
  else if (typeof mode === 'string')
    return modeNum(parseInt(mode, 8));
  throw new Error('Cannot parse mode: ' + mode);
}


// ReadStream-related
var kMinPoolSpace = 128,
    pool;
function allocNewPool(poolSize) {
  pool = new Buffer(poolSize);
  pool.used = 0;
}

function ReadStream(sftp, path, options) {
  if (!(this instanceof ReadStream))
    return new ReadStream(sftp, path, options);

  var self = this,
      socket = sftp._stream._channel._conn._sock;

  // a little bit bigger buffer and water marks by default
  options = util._extend({
    highWaterMark: 64 * 1024
  }, options || {});

  ReadableStream.call(this, options);

  this.path = path;
  this.handle = options.hasOwnProperty('handle') ? options.handle : null;
  this.flags = options.hasOwnProperty('flags') ? options.flags : 'r';
  this.mode = options.hasOwnProperty('mode') ? options.mode : 438; /*=0666*/

  this.start = options.hasOwnProperty('start') ? options.start : undefined;
  this.end = options.hasOwnProperty('end') ? options.end : undefined;
  this.autoClose = (options.hasOwnProperty('autoClose')
                    ? options.autoClose
                    : true);
  this.pos = 0;
  this.sftp = sftp;

  if (this.start !== undefined) {
    if ('number' !== typeof this.start)
      throw new TypeError('start must be a Number');
    if (this.end === undefined)
      this.end = Infinity;
    else if ('number' !== typeof this.end)
      throw new TypeError('end must be a Number');

    if (this.start > this.end)
      throw new Error('start must be <= end');
    else if (this.start < 0)
      throw new Error('start must be >= zero');

    this.pos = this.start;
  }

  this.on('end', function() {
    socket.removeListener('close', onclose);
    if (self.autoClose) {
      self.destroy();
    }
  });

  function onclose() {
    self.destroy();
  }
  socket.once('close', onclose);

  if (!Buffer.isBuffer(this.handle))
    this.open();
}
inherits(ReadStream, ReadableStream);

ReadStream.prototype.open = function() {
  var self = this;
  this.sftp.open(this.path, this.flags, this.mode, function(er, handle) {
    if (er) {
      if (self.autoClose)
        self.destroy();
      return self.emit('error', er);
    }

    self.handle = handle;
    self.emit('open', handle);
    // start the flow of data.
    self.read();
  });
};

ReadStream.prototype._read = function(n) {
  if (!Buffer.isBuffer(this.handle)) {
    return this.once('open', function() {
      this._read(n);
    });
  }

  if (this.destroyed)
    return;

  if (!pool || pool.length - pool.used < kMinPoolSpace) {
    // discard the old pool.
    pool = null;
    allocNewPool(this._readableState.highWaterMark);
  }

  // Grab another reference to the pool in the case that while we're
  // in the thread pool another read() finishes up the pool, and
  // allocates a new one.
  var thisPool = pool;
  var toRead = Math.min(pool.length - pool.used, n);
  var start = pool.used;

  if (this.end !== undefined)
    toRead = Math.min(this.end - this.pos + 1, toRead);

  // already read everything we were supposed to read!
  // treat as EOF.
  if (toRead <= 0)
    return this.push(null);

  // the actual read.
  var self = this;
  this.sftp.read(this.handle, pool, pool.used, toRead, this.pos, onread);

  // move the pool positions, and internal position for reading.
  this.pos += toRead;
  pool.used += toRead;

  function onread(er, bytesRead) {
    if (er) {
      if (self.autoClose)
        self.destroy();
      return self.emit('error', er);
    }
    var b = null;
    if (bytesRead > 0)
      b = thisPool.slice(start, start + bytesRead);

    self.push(b);
  }
};

ReadStream.prototype.destroy = function() {
  if (this.destroyed)
    return;
  this.destroyed = true;

  if (Buffer.isBuffer(this.handle))
    this.close();
};


ReadStream.prototype.close = function(cb) {
  var self = this;
  if (cb)
    this.once('close', cb);
  if (this.closed || !Buffer.isBuffer(this.handle)) {
    if (!Buffer.isBuffer(this.handle)) {
      this.once('open', close);
      return;
    }
    return process.nextTick(this.emit.bind(this, 'close'));
  }
  this.closed = true;
  close();

  function close(handle) {
    self.sftp.close(handle || self.handle, function(er) {
      if (er)
        self.emit('error', er);
      else
        self.emit('close');
    });
    self.handle = null;
  }
};


function WriteStream(sftp, path, options) {
  if (!(this instanceof WriteStream))
    return new WriteStream(sftp, path, options);

  options = options || {};

  WritableStream.call(this, options);

  this.path = path;
  this.handle = options.hasOwnProperty('handle') ? options.handle : null;
  this.flags = options.hasOwnProperty('flags') ? options.flags : 'w';
  this.mode = options.hasOwnProperty('mode') ? options.mode : 438; /*=0666*/

  this.start = options.hasOwnProperty('start') ? options.start : undefined;
  this.pos = 0;
  this.bytesWritten = 0;
  this.sftp = sftp;

  if (this.start !== undefined) {
    if ('number' !== typeof this.start)
      throw new TypeError('start must be a Number');
    if (this.start < 0)
      throw new Error('start must be >= zero');
    else if (this.start < 0)
      throw new Error('start must be >= zero');

    this.pos = this.start;
  }

  if (!Buffer.isBuffer(this.handle))
    this.open();

  var self = this,
      socket = sftp._stream._channel._conn._sock;

  // dispose on finish.
  this.once('finish', onclose);

  function onclose() {
    socket.removeListener('close', onclose);
    self.close();
  }
  socket.once('close', onclose);
}
inherits(WriteStream, WritableStream);

WriteStream.prototype.open = function() {
  var self = this;
  this.sftp.open(this.path, this.flags, this.mode, function(er, handle) {
    if (er) {
      self.destroy();
      self.emit('error', er);
      return;
    }

    self.handle = handle;
    // SFTPv3 requires absolute offsets, no matter the open flag used
    if (self.flags[0] === 'a') {
      self.sftp.fstat(handle, function(err, st) {
        if (err) {
          self.destroy();
          self.emit('error', err);
          return;
        }

        self.pos = st.size;
        self.emit('open', handle);
      });
      return;
    }
    self.emit('open', handle);
  });
};

WriteStream.prototype._write = function(data, encoding, cb) {
  if (!Buffer.isBuffer(data))
    return this.emit('error', new Error('Invalid data'));

  if (!Buffer.isBuffer(this.handle)) {
    return this.once('open', function() {
      this._write(data, encoding, cb);
    });
  }

  var self = this;
  this.sftp.write(this.handle, data, 0, data.length, this.pos, function(er, bytes) {
    if (er) {
      self.destroy();
      return cb(er);
    }
    self.bytesWritten += bytes;
    cb();
  });

  this.pos += data.length;
};

WriteStream.prototype.destroy = ReadStream.prototype.destroy;
WriteStream.prototype.close = ReadStream.prototype.close;

// There is no shutdown() for files.
WriteStream.prototype.destroySoon = WriteStream.prototype.end;
