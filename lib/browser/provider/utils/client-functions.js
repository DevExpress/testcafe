"use strict";

exports.__esModule = true;
/*eslint-disable no-undef*/
function getTitle() {
    return document.title;
}

function getWindowDimensionsInfo() {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
        availableWidth: screen.availWidth,
        availableHeight: screen.availHeight
    };
}
/*eslint-disable no-undef*/

var GET_TITLE_SCRIPT = exports.GET_TITLE_SCRIPT = getTitle.toString();
var GET_WINDOW_DIMENSIONS_INFO_SCRIPT = exports.GET_WINDOW_DIMENSIONS_INFO_SCRIPT = getWindowDimensionsInfo.toString();