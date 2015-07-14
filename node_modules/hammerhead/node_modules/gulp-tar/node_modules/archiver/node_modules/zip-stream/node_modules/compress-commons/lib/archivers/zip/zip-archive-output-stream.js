/**
 * node-compress-commons
 *
 * Copyright (c) 2014 Chris Talkington, contributors.
 * Licensed under the MIT license.
 * https://github.com/ctalkington/node-compress-commons/blob/master/LICENSE-MIT
 */
var inherits = require('util').inherits;
var crc32 = require('buffer-crc32');
var CRC32Stream = require('crc32-stream');
var DeflateCRC32Stream = CRC32Stream.DeflateCRC32Stream;

var ArchiveOutputStream = require('../archive-output-stream');
var ZipArchiveEntry = require('./zip-archive-entry');
var GeneralPurposeBit = require('./general-purpose-bit');

var constants = require('./constants');
var util = require('../../util');
var zipUtil = require('./util');

var ZipArchiveOutputStream = module.exports = function(options) {
  if (!(this instanceof ZipArchiveOutputStream)) {
    return new ZipArchiveOutputStream(options);
  }

  options = this.options = options || {};
  options.zlib = this._zlibDefaults(options.zlib);

  ArchiveOutputStream.call(this, options);

  this._entry = null;
  this._entries = [];
  this._archive = {
    centralLength: 0,
    centralOffset: 0,
    comment: '',
    finish: false,
    finished: false,
    processing: false
  };
};

inherits(ZipArchiveOutputStream, ArchiveOutputStream);

ZipArchiveOutputStream.prototype._afterAppend = function(zae) {
  this._entries.push(zae);
  this._writeDataDescriptor(zae);

  this._archive.processing = false;
  this._entry = null;

  if (this._archive.finish && !this._archive.finished) {
    this._finish();
  }
};

ZipArchiveOutputStream.prototype._appendBuffer = function(ae, source, callback) {
  if (source.length === 0) {
    ae.setMethod(constants.METHOD_STORED);
  }

  var method = ae.getMethod();

  if (method === constants.METHOD_STORED) {
    ae.setSize(source.length);
    ae.setCompressedSize(source.length);
    ae.setCrc(crc32.unsigned(source));
  }

  this._writeLocalFileHeader(ae);

  if (method === constants.METHOD_STORED) {
    this.write(source);
    this._afterAppend(ae);
    callback(null, ae);
    return;
  } else if (method === constants.METHOD_DEFLATED) {
    this._smartStream(ae, callback).end(source);
    return;
  } else {
    callback(new Error('compression method ' + method + ' not implemented'));
    return;
  }
};

ZipArchiveOutputStream.prototype._appendStream = function(ae, source, callback) {
  ae.getGeneralPurposeBit().useDataDescriptor(true);

  this._writeLocalFileHeader(ae);

  var smart = this._smartStream(ae, callback);
  source.pipe(smart);
};

ZipArchiveOutputStream.prototype._finish = function() {
  this._archive.centralOffset = this.offset;

  this._entries.forEach(function(ae) {
    this._writeCentralFileHeader(ae);
  }.bind(this));

  this._archive.centralLength = this.offset - this._archive.centralOffset;

  this._writeCentralDirectoryEnd();

  this._archive.processing = false;
  this._archive.finish = true;
  this._archive.finished = true;
  this.end();
};

ZipArchiveOutputStream.prototype._setDefaults = function(ae) {
  if (ae.getMethod() === -1) {
    ae.setMethod(constants.METHOD_DEFLATED);
  }

  if (ae.getMethod() === constants.METHOD_DEFLATED) {
    ae.getGeneralPurposeBit().useDataDescriptor(true);
    ae.setVersionNeededToExtract(constants.DATA_DESCRIPTOR_MIN_VERSION);
  }

  if (ae.getTime() === -1) {
    ae.setTime(new Date());
  }

  ae._offsets = {
    file: 0,
    data: 0,
    contents: 0,
  };
};

ZipArchiveOutputStream.prototype._smartStream = function(ae, callback) {
  var deflate = ae.getMethod() === constants.METHOD_DEFLATED;
  var process = deflate ? new DeflateCRC32Stream(this.options.zlib) : new CRC32Stream();

  function handleStuff(err) {
    ae.setCrc(process.digest());
    ae.setSize(process.size());
    ae.setCompressedSize(process.size(true));
    this._afterAppend(ae);
    callback(null, ae);
  }

  process.once('error', callback);
  process.once('end', handleStuff.bind(this));

  process.pipe(this, { end: false });

  return process;
};

ZipArchiveOutputStream.prototype._writeCentralDirectoryEnd = function() {
  // signature
  this.write(zipUtil.getLongBytes(constants.SIG_EOCD));

  // disk numbers
  this.write(constants.SHORT_ZERO);
  this.write(constants.SHORT_ZERO);

  // number of entries
  this.write(zipUtil.getShortBytes(this._entries.length));
  this.write(zipUtil.getShortBytes(this._entries.length));

  // length and location of CD
  this.write(zipUtil.getLongBytes(this._archive.centralLength));
  this.write(zipUtil.getLongBytes(this._archive.centralOffset));

  // archive comment
  var comment = this.getComment();
  var commentLength = Buffer.byteLength(comment);
  this.write(zipUtil.getShortBytes(commentLength));
  this.write(comment);
};

ZipArchiveOutputStream.prototype._writeCentralFileHeader = function(ae) {
  var gpb = ae.getGeneralPurposeBit();
  var method = ae.getMethod();
  var offsets = ae._offsets;

  // signature
  this.write(zipUtil.getLongBytes(constants.SIG_CFH));

  // version made by
  this.write(zipUtil.getShortBytes(
    (ae.getPlatform() << 8) | constants.DATA_DESCRIPTOR_MIN_VERSION
  ));

  // version to extract and general bit flag
  this._writeVersionGeneral(ae);

  // compression method
  this.write(zipUtil.getShortBytes(method));

  // datetime
  this.write(zipUtil.getLongBytes(ae.getTimeDos()));

  // crc32 checksum
  this.write(zipUtil.getLongBytes(ae.getCrc()));

  // sizes
  this.write(zipUtil.getLongBytes(ae.getCompressedSize()));
  this.write(zipUtil.getLongBytes(ae.getSize()));

  var name = ae.getName();
  var comment = ae.getComment();
  var extra = ae.getCentralDirectoryExtra();

  if (gpb.usesUTF8ForNames()) {
    name = new Buffer(name);
    comment = new Buffer(comment);
  }

  // name length
  this.write(zipUtil.getShortBytes(name.length));

  // extra length
  this.write(zipUtil.getShortBytes(extra.length));

  // comments length
  this.write(zipUtil.getShortBytes(comment.length));

  // disk number start
  this.write(constants.SHORT_ZERO);

  // internal attributes
  this.write(zipUtil.getShortBytes(ae.getInternalAttributes()));

  // external attributes
  this.write(zipUtil.getLongBytes(ae.getExternalAttributes()));

  // relative offset of LFH
  this.write(zipUtil.getLongBytes(offsets.file));

  // name
  this.write(name);

  // extra
  this.write(extra);

  // comment
  this.write(comment);
};

ZipArchiveOutputStream.prototype._writeDataDescriptor = function(ae) {
  if (!ae.getGeneralPurposeBit().usesDataDescriptor()) {
    return;
  }

  // signature
  this.write(zipUtil.getLongBytes(constants.SIG_DD));

  // crc32 checksum
  this.write(zipUtil.getLongBytes(ae.getCrc()));

  // sizes
  this.write(zipUtil.getLongBytes(ae.getCompressedSize()));
  this.write(zipUtil.getLongBytes(ae.getSize()));
};

ZipArchiveOutputStream.prototype._writeLocalFileHeader = function(ae) {
  var gpb = ae.getGeneralPurposeBit();
  var method = ae.getMethod();
  var name = ae.getName();
  var extra = ae.getLocalFileDataExtra();

  if (gpb.usesUTF8ForNames()) {
    name = new Buffer(name);
  }

  ae._offsets.file = this.offset;

  // signature
  this.write(zipUtil.getLongBytes(constants.SIG_LFH));

  // version to extract and general bit flag
  this._writeVersionGeneral(ae);

  // compression method
  this.write(zipUtil.getShortBytes(method));

  // datetime
  this.write(zipUtil.getLongBytes(ae.getTimeDos()));

  ae._offsets.data = this.offset;

  if (ae.getGeneralPurposeBit().usesDataDescriptor()) {
    // zero fill and set later
    this.write(constants.LONG_ZERO);
    this.write(constants.LONG_ZERO);
    this.write(constants.LONG_ZERO);
  } else {
    // crc32 checksum and sizes
    this.write(zipUtil.getLongBytes(ae.getCrc()));
    this.write(zipUtil.getLongBytes(ae.getCompressedSize()));
    this.write(zipUtil.getLongBytes(ae.getSize()));
  }

  // name length
  this.write(zipUtil.getShortBytes(name.length));

  // extra length
  this.write(zipUtil.getShortBytes(extra.length));

  // name
  this.write(name);

  // extra
  this.write(extra);

  ae._offsets.contents = this.offset;
};

ZipArchiveOutputStream.prototype._writeVersionGeneral = function(ae) {
  this.write(zipUtil.getShortBytes(ae.getVersionNeededToExtract()));
  this.write(ae.getGeneralPurposeBit().encode());
};

ZipArchiveOutputStream.prototype._zlibDefaults = function(o) {
  if (typeof o !== 'object') {
    o = {};
  }

  if (typeof o.level !== 'number') {
    o.level = constants.ZLIB_BEST_SPEED;
  }

  return o;
};

ZipArchiveOutputStream.prototype.getComment = function(comment) {
  return this._archive.comment !== null ? this._archive.comment : '';
};

ZipArchiveOutputStream.prototype.setComment = function(comment) {
  this._archive.comment = comment;
};