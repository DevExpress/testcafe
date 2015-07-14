var mongodb = require('./').pure(),
  Code = mongodb.Code,
  Binary = mongodb.Binary,
  Timestamp = mongodb.Timestamp,
  Long = mongodb.Long,
  MongoReply = mongodb.MongoReply,
  ObjectID = mongodb.ObjectID,
  ObjectId = mongodb.ObjectId,
  Symbol = mongodb.Symbol,
  DBRef = mongodb.DBRef,
  Double = mongodb.Double,
  MinKey = mongodb.MinKey,
  MaxKey = mongodb.MaxKey;


var BSONSE = mongodb,
  BSONDE = mongodb;

// Create serializer
var bson = new BSONSE.BSON([Long, ObjectID, Binary, Code, DBRef, Symbol, Double, Timestamp, MaxKey, MinKey]);

// Serialize and print
var serializeAndPrint = function(m, object) {
  var buffer = bson.serialize(object, false, true);
  console.log(m)
  process.stdout.write("[]byte{");

  for(var i = 0; i < buffer.length; i++) {
    if(i < buffer.length - 1) {
      process.stdout.write("" + buffer[i] + ",");
    } else {
      process.stdout.write("" + buffer[i]);
    }
  }

  process.stdout.write("}\n")
}

var d = new Date();
d.setTime(100000)

serializeAndPrint('empty document', {});
serializeAndPrint('simple int32', {int:10});
serializeAndPrint('simple string', {string: "hello world"});
serializeAndPrint('simple string and int', {string: "hello world", int: 10});
serializeAndPrint('nested document', {string: "hello world", doc: {int: 10}});
serializeAndPrint('simple array', {array: ["a", "b"]});
serializeAndPrint('simple binary', {bin: new Binary(new Buffer("hello world"))});
serializeAndPrint('mixed document', {array: [new Binary(new Buffer("hello world")), {a:1}]});
serializeAndPrint('object id', {id: new ObjectID("123456781234")});
serializeAndPrint('javascript with no scope', {js: new Code("var a = function(){}")});
serializeAndPrint('javascript with scope', {js: new Code("var a = function(){}", {a:1})});
serializeAndPrint('min and max', {min: new MinKey(), max: new MaxKey()});
serializeAndPrint('date', {one: d, two: d});
serializeAndPrint('buffer', {b: new Buffer("hello world")});
serializeAndPrint('timestamp', {t: Timestamp.fromNumber(100000)});
serializeAndPrint('long values', {o: Long.fromNumber(-1), t: Long.fromNumber(100000)});
serializeAndPrint('float64 values', {o: 3.14});
serializeAndPrint('float32 values', {o: -1.4});
serializeAndPrint('boolean values', {o: true, t: false});
serializeAndPrint('null values', {o: null});
serializeAndPrint('regexp', {o: /[test]/i});


