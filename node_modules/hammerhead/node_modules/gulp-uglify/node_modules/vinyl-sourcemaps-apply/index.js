'use strict';
var SourceMapGenerator = require('source-map').SourceMapGenerator;
var SourceMapConsumer = require('source-map').SourceMapConsumer;

module.exports = function applySourceMap(file, sourceMap) {
  if (typeof sourceMap === 'string' || sourceMap instanceof String) {
    sourceMap = JSON.parse(sourceMap);
  }
  if (file.sourceMap) {
    var generator = SourceMapGenerator.fromSourceMap(new SourceMapConsumer(sourceMap));
    generator.applySourceMap(new SourceMapConsumer(file.sourceMap));
    file.sourceMap = JSON.parse(generator.toString());
  } else {
    file.sourceMap = sourceMap;
  }
};