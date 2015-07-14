"use strict";

exports.__esModule = true;
exports.internal = internal;
exports.blacklist = blacklist;
exports.whitelist = whitelist;
exports.stage = stage;
exports.optional = optional;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _lodashCollectionIncludes = require("lodash/collection/includes");

var _lodashCollectionIncludes2 = _interopRequireDefault(_lodashCollectionIncludes);

function internal(transformer, opts) {
  if (transformer.key[0] === "_") return true;
}

function blacklist(transformer, opts) {
  var blacklist = opts.blacklist;
  if (blacklist.length && (0, _lodashCollectionIncludes2["default"])(blacklist, transformer.key)) return false;
}

function whitelist(transformer, opts) {
  var whitelist = opts.whitelist;
  if (whitelist) return (0, _lodashCollectionIncludes2["default"])(whitelist, transformer.key);
}

function stage(transformer, opts) {
  var stage = transformer.metadata.stage;
  if (stage != null && stage >= opts.stage) return true;
}

function optional(transformer, opts) {
  if (transformer.metadata.optional && !(0, _lodashCollectionIncludes2["default"])(opts.optional, transformer.key)) return false;
}