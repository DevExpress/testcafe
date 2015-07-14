/**
 * node-compress-commons
 *
 * Copyright (c) 2014 Chris Talkington, contributors.
 * Licensed under the MIT license.
 * https://github.com/ctalkington/node-compress-commons/blob/master/LICENSE-MIT
 */
module.exports = {
  WORD: 4,
  DWORD: 8,
  EMPTY: new Buffer(0),

  SHORT: 2,
  SHORT_MASK: 0xffff,
  SHORT_SHIFT: 16,
  SHORT_ZERO: new Buffer(Array(2)),
  LONG_ZERO: new Buffer(Array(4)),

  DATA_DESCRIPTOR_MIN_VERSION: 20,
  INITIAL_VERSION: 10,

  METHOD_STORED: 0,
  METHOD_DEFLATED: 8,

  PLATFORM_UNIX: 3,
  PLATFORM_FAT: 0,

  SIG_LFH: 0x04034b50,
  SIG_DD: 0x08074b50,
  SIG_CFH: 0x02014b50,
  SIG_EOCD: 0x06054b50,
  SIG_ZIP64_EOCD: 0x06064B50,
  SIG_ZIP64_EOCD_LOC: 0x07064B50,

  ZIP64_MIN_VERSION: 45,
  ZIP64_MAGIC_SHORT: 0xffff,
  ZIP64_MAGIC: 0xffffffff,

  ZLIB_NO_COMPRESSION: 0,
  ZLIB_BEST_SPEED: 1,
  ZLIB_BEST_COMPRESSION: 9,
  ZLIB_DEFAULT_COMPRESSION: -1
};