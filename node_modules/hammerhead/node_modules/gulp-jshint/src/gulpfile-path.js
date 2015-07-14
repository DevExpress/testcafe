var gulpfileRE = /gulpfile\.[a-z]+$/i;
var current = module.parent;
var path = require('path');
var moduleDir = path.resolve(__dirname, '../');
var relative = path.relative;

var outsideModule = function (path) {
  return relative(moduleDir, path).substr(0, 2) === '..';
};

while (current) {
  if (gulpfileRE.test(current.filename) && outsideModule(current.filename)) {
    module.exports = current.filename;
    break;
  }
  current = current.parent;
}