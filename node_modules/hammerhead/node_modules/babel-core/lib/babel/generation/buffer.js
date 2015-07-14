"use strict";

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _repeating = require("repeating");

var _repeating2 = _interopRequireDefault(_repeating);

var _trimRight = require("trim-right");

var _trimRight2 = _interopRequireDefault(_trimRight);

var _lodashLangIsBoolean = require("lodash/lang/isBoolean");

var _lodashLangIsBoolean2 = _interopRequireDefault(_lodashLangIsBoolean);

var _lodashCollectionIncludes = require("lodash/collection/includes");

var _lodashCollectionIncludes2 = _interopRequireDefault(_lodashCollectionIncludes);

var _lodashLangIsNumber = require("lodash/lang/isNumber");

var _lodashLangIsNumber2 = _interopRequireDefault(_lodashLangIsNumber);

var Buffer = (function () {
  function Buffer(position, format) {
    _classCallCheck(this, Buffer);

    this.position = position;
    this._indent = format.indent.base;
    this.format = format;
    this.buf = "";
  }

  Buffer.prototype.get = function get() {
    return (0, _trimRight2["default"])(this.buf);
  };

  Buffer.prototype.getIndent = function getIndent() {
    if (this.format.compact || this.format.concise) {
      return "";
    } else {
      return (0, _repeating2["default"])(this.format.indent.style, this._indent);
    }
  };

  Buffer.prototype.indentSize = function indentSize() {
    return this.getIndent().length;
  };

  Buffer.prototype.indent = function indent() {
    this._indent++;
  };

  Buffer.prototype.dedent = function dedent() {
    this._indent--;
  };

  Buffer.prototype.semicolon = function semicolon() {
    this.push(";");
  };

  Buffer.prototype.ensureSemicolon = function ensureSemicolon() {
    if (!this.isLast(";")) this.semicolon();
  };

  Buffer.prototype.rightBrace = function rightBrace() {
    this.newline(true);
    this.push("}");
  };

  Buffer.prototype.keyword = function keyword(name) {
    this.push(name);
    this.space();
  };

  Buffer.prototype.space = function space() {
    if (this.format.compact) return;
    if (this.buf && !this.isLast(" ") && !this.isLast("\n")) {
      this.push(" ");
    }
  };

  Buffer.prototype.removeLast = function removeLast(cha) {
    if (this.format.compact) return;
    if (!this.isLast(cha)) return;

    this.buf = this.buf.substr(0, this.buf.length - 1);
    this.position.unshift(cha);
  };

  Buffer.prototype.newline = function newline(i, removeLast) {
    if (this.format.compact || this.format.retainLines) return;

    if (this.format.concise) {
      this.space();
      return;
    }

    removeLast = removeLast || false;

    if ((0, _lodashLangIsNumber2["default"])(i)) {
      i = Math.min(2, i);

      if (this.endsWith("{\n") || this.endsWith(":\n")) i--;
      if (i <= 0) return;

      while (i > 0) {
        this._newline(removeLast);
        i--;
      }
      return;
    }

    if ((0, _lodashLangIsBoolean2["default"])(i)) {
      removeLast = i;
    }

    this._newline(removeLast);
  };

  Buffer.prototype._newline = function _newline(removeLast) {
    // never allow more than two lines
    if (this.endsWith("\n\n")) return;

    // remove the last newline
    if (removeLast && this.isLast("\n")) this.removeLast("\n");

    this.removeLast(" ");
    this._removeSpacesAfterLastNewline();
    this._push("\n");
  };

  /**
   * If buffer ends with a newline and some spaces after it, trim those spaces.
   */

  Buffer.prototype._removeSpacesAfterLastNewline = function _removeSpacesAfterLastNewline() {
    var lastNewlineIndex = this.buf.lastIndexOf("\n");
    if (lastNewlineIndex === -1) {
      return;
    }

    var index = this.buf.length - 1;
    while (index > lastNewlineIndex) {
      if (this.buf[index] !== " ") {
        break;
      }

      index--;
    }

    if (index === lastNewlineIndex) {
      this.buf = this.buf.substring(0, index + 1);
    }
  };

  Buffer.prototype.push = function push(str, noIndent) {
    if (!this.format.compact && this._indent && !noIndent && str !== "\n") {
      // we have an indent level and we aren't pushing a newline
      var indent = this.getIndent();

      // replace all newlines with newlines with the indentation
      str = str.replace(/\n/g, "\n" + indent);

      // we've got a newline before us so prepend on the indentation
      if (this.isLast("\n")) this._push(indent);
    }

    this._push(str);
  };

  Buffer.prototype._push = function _push(str) {
    this.position.push(str);
    this.buf += str;
  };

  Buffer.prototype.endsWith = function endsWith(str) {
    return this.buf.slice(-str.length) === str;
  };

  Buffer.prototype.isLast = function isLast(cha) {
    if (this.format.compact) return false;

    var buf = this.buf;
    var last = buf[buf.length - 1];

    if (Array.isArray(cha)) {
      return (0, _lodashCollectionIncludes2["default"])(cha, last);
    } else {
      return cha === last;
    }
  };

  return Buffer;
})();

exports["default"] = Buffer;
module.exports = exports["default"];