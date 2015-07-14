## Pure JS character encoding conversion

<!-- [![Build Status](https://secure.travis-ci.org/ashtuchkin/iconv-lite.png?branch=master)](http://travis-ci.org/ashtuchkin/iconv-lite) -->

 * Doesn't need native code compilation. Works on Windows and in sandboxed environments like [Cloud9](http://c9.io).
 * Used in popular projects like [Grunt](http://gruntjs.com/), [Nodemailer](http://www.nodemailer.com/), [Yeoman](http://yeoman.io/) and others.
 * Faster than [node-iconv](https://github.com/bnoordhuis/node-iconv) (see below for performance comparison).
 * Intuitive encode/decode API + streaming API in Node v0.10+
 * License: MIT.

[![NPM Stats](https://nodei.co/npm/iconv-lite.png?downloads=true)](https://npmjs.org/packages/iconv-lite/)

## Usage

    var iconv = require('iconv-lite');
    
    // Convert from an encoded buffer to js string.
    str = iconv.decode(buf, 'win1251');
    
    // Convert from js string to an encoded buffer.
    buf = iconv.encode("Sample input string", 'win1251');

    // Check if encoding is supported
    iconv.encodingExists("us-ascii")


    // Decode stream example (from binary stream to js strings)
    // Only available in Node v0.10+
    http.createServer(function(req, res) {
        var converterStream = iconv.decodeStream('win1251');
        req.pipe(converterStream);

        converterStream.on('data', function(str) {
            console.log(str); // Do something with decoded strings, chunk-by-chunk.
        });
    });

    // Convert encoding streaming example
    fs.createReadStream('file-in-win1251.txt')
        .pipe(iconv.decodeStream('win1251'))
        .pipe(iconv.encodeStream('ucs2'))
        .pipe(fs.createWriteStream('file-in-ucs2.txt'));

    // Sugar: all encode/decode streams have .collect(cb) method to accumulate data.
    http.createServer(function(req, res) {
        req.pipe(iconv.decodeStream('win1251')).collect(function(err, body) {
            assert(typeof body == 'string');
            console.log(body); // full request body string
        });
    });

    // For the brave/lazy: make Node basic primitives understand all iconv encodings.
    require('iconv-lite').extendNodeEncodings();

    buf = new Buffer(str, 'win1251');
    buf.write(str, 'gbk');
    str = buf.toString('latin1');
    assert(Buffer.isEncoding('iso-8859-15'));
    Buffer.byteLength(str, 'us-ascii');

    http.createServer(function(req, res) {
        req.setEncoding('big5');
        req.collect(function(err, body) {
            console.log(body);
        });
    });

    fs.createReadStream("file.txt", "shift_jis");

    // External modules are also supported (if they use Node primitives).
    request = require('request');
    request({
        url: "http://github.com/", 
        encoding: "cp932"
    });
    

## Supported encodings

 *  All node.js native encodings: 'utf8', 'ucs2', 'ascii', 'binary', 'base64'
 *  All widespread singlebyte encodings: Windows 125x family, ISO-8859 family, 
    IBM/DOS codepages, Macintosh family, KOI8 family, all others supported by iconv library. 
    Aliases like 'latin1', 'us-ascii' also supported.
 *  Multibyte encodings: CP932, CP936, CP949, CP950, GBK, GB2313, Big5, Shift_JIS.

Most singlebyte encodings are generated automatically from [node-iconv](https://github.com/bnoordhuis/node-iconv). Thank you Ben Noordhuis and iconv authors!

Not supported yet: GB18030, EUC family, ISO2022 family.


## Encoding/decoding speed

Comparison with node-iconv module (1000x256kb, on MacBook Pro, Core i5/2.6 GHz, Node v0.10.26). 
Note: your results may vary, so please always check on your hardware.

    operation             iconv@2.0.7   iconv-lite@0.4.0
    ----------------------------------------------------------
    encode('win1251')     ~115 Mb/s     ~340 Mb/s
    decode('win1251')     ~110 Mb/s     ~180 Mb/s


## Notes

When decoding, a 'binary'-encoded string can be used as a source buffer.  
Untranslatable characters are set to � or ?. No transliteration is currently supported.

## Testing

    git clone git@github.com:ashtuchkin/iconv-lite.git
    cd iconv-lite
    npm install
    npm test
    
    # To view performance:
    node test/performance.js

## Adoption
[![NPM](https://nodei.co/npm-dl/iconv-lite.png)](https://nodei.co/npm/iconv-lite/)

