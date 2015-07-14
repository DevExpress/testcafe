var RE_STREAM = /^arcfour/i,
    RE_GCM = /^aes\d+-gcm/i;

module.exports = {
  iv_inc: function(iv) {
    var n = 12, c = 0;
    do {
      --n;
      c = iv[n];
      if (c === 255)
        iv[n] = 0;
      else {
        iv[n] = ++c;
        return;
      }
    } while (n > 4);
  },
  isStreamCipher: function(name) {
    return RE_STREAM.test(name);
  },
  isGCM: function(name) {
    return RE_GCM.test(name);
  }
};