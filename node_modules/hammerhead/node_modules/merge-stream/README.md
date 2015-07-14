# merge-stream

Merge (interleave) a bunch of streams.

[![build status](https://secure.travis-ci.org/grncdr/merge-stream.svg?branch=master)](http://travis-ci.org/grncdr/merge-stream)

## Synopsis

```javascript
var stream1 = new Stream();
var stream2 = new Stream();

var merged = mergeStream(stream1, stream2);

var stream3 = new Stream();
merged.add(stream3);
```

## Description

This is the merge function from [event-stream](https://github.com/dominictarr/event-stream) separated into a new module and given an `add` method so you can dynamically add more sources to the stream.

## License

MIT
