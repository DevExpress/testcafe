"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _state = require("./state");

var _location = require("./location");

// Start an AST node, attaching a start offset.

var pp = _state.Parser.prototype;

var Node = function Node() {
  _classCallCheck(this, Node);
};

exports.Node = Node;

pp.startNode = function () {
  var node = new Node();
  node.start = this.start;
  if (this.options.locations) node.loc = new _location.SourceLocation(this, this.startLoc);
  if (this.options.directSourceFile) node.sourceFile = this.options.directSourceFile;
  if (this.options.ranges) node.range = [this.start, 0];
  return node;
};

pp.startNodeAt = function (pos) {
  var node = new Node(),
      start = pos;
  if (this.options.locations) {
    node.loc = new _location.SourceLocation(this, start[1]);
    start = pos[0];
  }
  node.start = start;
  if (this.options.directSourceFile) node.sourceFile = this.options.directSourceFile;
  if (this.options.ranges) node.range = [start, 0];
  return node;
};

// Finish an AST node, adding `type` and `end` properties.

pp.finishNode = function (node, type) {
  node.type = type;
  node.end = this.lastTokEnd;
  if (this.options.locations) node.loc.end = this.lastTokEndLoc;
  if (this.options.ranges) node.range[1] = this.lastTokEnd;
  return node;
};

// Finish node at given position

pp.finishNodeAt = function (node, type, pos) {
  if (this.options.locations) {
    node.loc.end = pos[1];pos = pos[0];
  }
  node.type = type;
  node.end = pos;
  if (this.options.ranges) node.range[1] = pos;
  return node;
};