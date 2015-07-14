// TODO:
//    * handle multi-line header values (OpenSSH)?
//    * Putty's PPK format

var RE_HEADER_PPK = /^PuTTY-User-Key-File-2: ssh-(rsa|dss)$/i,
    RE_HEADER_OPENSSH_PRIV = /^-----BEGIN (RSA|DSA) PRIVATE KEY-----$/i,
    RE_FOOTER_OPENSSH_PRIV = /^-----END (?:RSA|DSA) PRIVATE KEY-----$/i,
    RE_HEADER_OPENSSH_PUB = /^(ssh-(rsa|dss)(?:-cert-v0[01]@openssh.com)?) ([A-Z0-9a-z\/+=]+(?:$|\s+([\S].*)?)$)/i,
    RE_HEADER_RFC4716_PUB = /^---- BEGIN SSH2 PUBLIC KEY ----$/i,
    RE_FOOTER_RFC4716_PUB = /^---- END SSH2 PUBLIC KEY ----$/i,
    RE_HEADER_OPENSSH = /^([^:]+):\s*([\S].*)?$/i,
    RE_HEADER_RFC4716 = /^([^:]+): (.*)?$/i;

module.exports = function(data) {
  if (Buffer.isBuffer(data))
    data = data.toString('utf8');
  else if (typeof data !== 'string')
    return new Error('Key data must be a Buffer or string');

  var ret = {
        fulltype: undefined,
        type: undefined,
        extra: undefined,
        comment: undefined,
        encryption: undefined,
        private: undefined,
        privateOrig: undefined,
        public: undefined,
        publicOrig: undefined
      },
      m,
      i,
      len;

  data = data.split(/\r\n|\n/);

  while (!data[0].length)
    data.shift();
  while (!data.slice(-1)[0].length)
    data.pop();

  var orig = data.join('\n');

  if ((m = RE_HEADER_OPENSSH_PRIV.exec(data[0]))
      && RE_FOOTER_OPENSSH_PRIV.test(data.slice(-1))) {
    // OpenSSH private key
    ret.type = (m[1].toLowerCase() === 'dsa' ? 'dss' : 'rsa');
    if (!RE_HEADER_OPENSSH.test(data[1])) {
      // unencrypted, no headers
      ret.private = new Buffer(data.slice(1, -1).join(''), 'base64');
    } else {
      // possibly encrypted, headers
      for (i = 1, len = data.length; i < len; ++i) {
        m = RE_HEADER_OPENSSH.exec(data[i]);
        if (m) {
          m[1] = m[1].toLowerCase();
          if (m[1] === 'dek-info') {
            m[2] = m[2].split(',');
            ret.encryption = m[2][0].toLowerCase();
            if (m[2].length > 1)
              ret.extra = m[2].slice(1);
          }
        } else if (data[i].length)
          break;
      }
      ret.private = new Buffer(data.slice(i, -1).join(''), 'base64');
    }
    ret.privateOrig = new Buffer(orig);
  } else if (m = RE_HEADER_OPENSSH_PUB.exec(data[0])) {
    // OpenSSH public key
    ret.fulltype = m[1];
    ret.type = m[2].toLowerCase();
    ret.public = new Buffer(m[3], 'base64');
    ret.publicOrig = new Buffer(orig);
    ret.comment = m[4];
  } else if (RE_HEADER_RFC4716_PUB.test(data[0])
             && RE_FOOTER_RFC4716_PUB.test(data.slice(-1))) {
    if (data[1].indexOf(': ') === -1) {
      // no headers
      ret.public = new Buffer(data.slice(1, -1).join(''), 'base64');
    } else {
      // headers
      for (i = 1, len = data.length; i < len; ++i) {
        if (data[i].indexOf(': ') === -1) {
          if (data[i].length)
            break; // start of key data
          else
            continue; // empty line
        }
        while (data[i].substr(-1) === '\\') {
          if (i + 1 < len) {
            data[i] = data[i].slice(0, -1) + data[i + 1];
            data.splice(i + 1, 1);
            --len;
          } else
            return new Error('RFC4716 public key missing header continuation line');
        }
        m = RE_HEADER_RFC4716.exec(data[i]);
        if (m) {
          m[1] = m[1].toLowerCase();
          if (m[1] === 'comment') {
            ret.comment = m[2] || '';
            if (ret.comment[0] === '"' && ret.comment.substr(-1) === '"')
              ret.comment = ret.comment.slice(1, -1);
          }
        } else
          return new Error('RFC4716 public key invalid header line');
      }
      ret.public = new Buffer(data.slice(i, -1).join(''), 'base64');
    }
    len = ret.public.readUInt32BE(0, true);
    var fulltype = ret.public.toString('ascii', 4, 4 + len);
    ret.fulltype = fulltype;
    if (fulltype === 'ssh-dss')
      ret.type = 'dss';
    else if (fulltype === 'ssh-rsa')
      ret.type = 'rsa';
    else
      return new Error('Unsupported RFC4716 public key type: ' + fulltype);
    ret.public = ret.public.slice(11);
    ret.publicOrig = new Buffer(orig);
  } else
    return new Error('Unsupported key format');

  return ret;
};
