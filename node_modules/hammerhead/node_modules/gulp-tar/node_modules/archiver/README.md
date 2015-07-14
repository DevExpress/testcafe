# Archiver v0.11.0 [![Build Status](https://travis-ci.org/ctalkington/node-archiver.svg?branch=master)](https://travis-ci.org/ctalkington/node-archiver)

a streaming interface for archive generation

[![NPM](https://nodei.co/npm/archiver.png)](https://nodei.co/npm/archiver/)

## Install

```bash
npm install archiver --save
```

You can also use `npm install https://github.com/ctalkington/node-archiver/archive/master.tar.gz` to test upcoming versions.

## Archiver

#### create(format, options)

Creates an Archiver instance based on the format (zip, tar, etc) passed. Parameters can be passed directly to `Archiver` constructor for convenience.

#### registerFormat(format, module)

Registers an archive format. Format modules are essentially transform streams with a few required methods. They will be further documented once a formal spec is in place.

### Instance Methods

Inherits [Transform Stream](http://nodejs.org/api/stream.html#stream_class_stream_transform) methods.

#### append(input, data)

Appends an input source (text string, buffer, or stream) to the instance. When the instance has received, processed, and emitted the input, the `entry` event is fired.

Replaced `#addFile` in v0.5.

```js
archive.append('string', { name:'string.txt' });
archive.append(new Buffer('string'), { name:'buffer.txt' });
archive.append(fs.createReadStream('mydir/file.txt'), { name:'stream.txt' });
archive.append(null, { name:'dir/' });
```

#### bulk(mappings)

Appends multiple entries from passed array of src-dest mappings. A lazystream wrapper is used to prevent issues with open file limits.

Globbing patterns are supported through use of the [file-utils](https://github.com/SBoudrias/file-utils) package. Please note that multiple src files to single dest file (ie concat) is not supported.

The `data` property can be set (per src-dest mapping) to define data for matched entries.

```js
archive.bulk([
  { src: ['mydir/**'], data: { date: new Date() } },
  { expand: true, cwd: 'mydir', src: ['**'], dest: 'newdir' }
]);
```

For more detail on this feature, please see [BULK.md](https://github.com/ctalkington/node-archiver/blob/master/BULK.md).

#### file(filepath, data)

Appends a file given its filepath using a lazystream wrapper to prevent issues with open file limits. When the instance has received, processed, and emitted the file, the `entry` event is fired.

```js
archive.file('mydir/file.txt', { name:'file.txt' });
```

#### finalize()

Finalizes the instance and prevents further appending to the archive structure (queue will continue til drained). The `end`, `close` or `finish` events on the destination stream may fire right after calling this method so you should set listeners beforehand to properly detect stream completion.

*You must call this method to get a valid archive and end the instance stream.*

#### pointer()

Returns the current byte length emitted by archiver. Use this in your end callback to log generated size.

## Events

Inherits [Transform Stream](http://nodejs.org/api/stream.html#stream_class_stream_transform) events.

#### entry

Fired when the input has been received, processed, and emitted. Passes entry data as first argument.

## Zip

### Options

#### comment `string`

Sets the zip comment.

#### forceUTC `boolean`

If true, forces the entry date to UTC. Helps with testing across timezones.

#### store `boolean`

If true, all entry contents will be archived without compression by default.

#### zlib `object`

Passed to node's [zlib](http://nodejs.org/api/zlib.html#zlib_options) module to control compression. Options may vary by node version.

### Entry Data

#### name `string` `required`

Sets the entry name including internal path.

#### date `string|Date`

Sets the entry date. This can be any valid date string or instance. Defaults to current time in locale.

#### store `boolean`

If true, entry contents will be archived without compression.

#### comment `string`

Sets the entry comment.

#### mode `number`

Sets the entry permissions. Defaults to octal 0755 (directory) or 0644 (file).

## Tar

### Options

#### gzip `boolean`

Compresses the tar archive using gzip, default is false.

#### gzipOptions `object`

Passed to node's [zlib](http://nodejs.org/api/zlib.html#zlib_options) module to control compression. Options may vary by node version.

### Entry Data

#### name `string` `required`

Sets the entry name including internal path.

#### date `string|Date`

Sets the entry date. This can be any valid date string or instance. Defaults to current time in locale.

#### mode `number`

Sets the entry permissions. Defaults to octal 0755 (directory) or 0644 (file).

## Libraries

Archiver makes use of several libraries/modules to avoid duplication of efforts.

- [zip-stream](https://npmjs.org/package/zip-stream)
- [tar-stream](https://npmjs.org/package/tar-stream)

## Things of Interest

- [Source Docs (coming soon)](https://docsrc.com/archiver/)
- [Examples](https://github.com/ctalkington/node-archiver/blob/master/examples)
- [Changelog](https://github.com/ctalkington/node-archiver/releases)
- [Contributing](https://github.com/ctalkington/node-archiver/blob/master/CONTRIBUTING.md)
- [MIT License](https://github.com/ctalkington/node-archiver/blob/master/LICENSE-MIT)