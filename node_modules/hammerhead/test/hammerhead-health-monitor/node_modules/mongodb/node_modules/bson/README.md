Javascript + C++ BSON parser
============================

This BSON parser is primarily meant to be used with the `mongodb` node.js driver.
However, wonderful tools such as `onejs` can package up a BSON parser that will work in the browser.
The current build is located in the `browser_build/bson.js` file.

A simple example of how to use BSON in the browser:

```html
<html>
<head>
  <script src="https://raw.github.com/mongodb/js-bson/master/browser_build/bson.js">
  </script>
</head>
<body onload="start();">
<script>
  function start() {
    var BSON = bson().BSON;
    var Long = bson().Long;

    var doc = {long: Long.fromNumber(100)}

    // Serialize a document
    var data = BSON.serialize(doc, false, true, false);
    // De serialize it again
    var doc_2 = BSON.deserialize(data);
  }
</script>
</body>
</html>
```

A simple example of how to use BSON in `node.js`:

```javascript
var bson = require("bson");
var BSON = bson.BSONPure.BSON;
var Long = bson.BSONPure.Long;

var doc = {long: Long.fromNumber(100)}

// Serialize a document
var data = BSON.serialize(doc, false, true, false);
console.log("data:", data);

// Deserialize the resulting Buffer
var doc_2 = BSON.deserialize(data);
console.log("doc_2:", doc_2);
```

The API consists of two simple methods to serialize/deserialize objects to/from BSON format:

  * BSON.serialize(object, checkKeys, asBuffer, serializeFunctions)
     * @param {Object} object the Javascript object to serialize.
     * @param {Boolean} checkKeys the serializer will check if keys are valid.
     * @param {Boolean} asBuffer return the serialized object as a Buffer object **(ignore)**.
     * @param {Boolean} serializeFunctions serialize the javascript functions **(default:false)**
     * @return {TypedArray/Array} returns a TypedArray or Array depending on what your browser supports
 
  * BSON.deserialize(buffer, options, isArray)
     * Options
       * **evalFunctions** {Boolean, default:false}, evaluate functions in the BSON document scoped to the object deserialized.
       * **cacheFunctions** {Boolean, default:false}, cache evaluated functions for reuse.
       * **cacheFunctionsCrc32** {Boolean, default:false}, use a crc32 code for caching, otherwise use the string of the function.
     * @param {TypedArray/Array} a TypedArray/Array containing the BSON data
     * @param {Object} [options] additional options used for the deserialization.
     * @param {Boolean} [isArray] ignore used for recursive parsing.
     * @return {Object} returns the deserialized Javascript Object.
