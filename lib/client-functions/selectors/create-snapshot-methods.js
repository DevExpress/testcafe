"use strict";

exports.__esModule = true;
exports.default = createSnapshotMethods;
function createSnapshotMethods(snapshot) {
    var isElementSnapshot = !!snapshot.tagName;

    if (isElementSnapshot) {
        snapshot.hasClass = function (name) {
            return snapshot.classNames.indexOf(name) > -1;
        };
        snapshot.getStyleProperty = function (prop) {
            return snapshot.style[prop];
        };
        snapshot.getAttribute = function (attrName) {
            return snapshot.attributes[attrName];
        };
        snapshot.hasAttribute = function (attrName) {
            return snapshot.attributes.hasOwnProperty(attrName);
        };
        snapshot.getBoundingClientRectProperty = function (prop) {
            return snapshot.boundingClientRect[prop];
        };
    }
}
module.exports = exports["default"];