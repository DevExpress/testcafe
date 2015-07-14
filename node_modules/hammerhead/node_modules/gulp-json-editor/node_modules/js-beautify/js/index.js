/**
The following batches are equivalent:

var beautify_js = require('js-beautify');
var beautify_js = require('js-beautify').js;
var beautify_js = require('js-beautify').js_beautify;

var beautify_css = require('js-beautify').css;
var beautify_css = require('js-beautify').css_beautify;

var beautify_html = require('js-beautify').html;
var beautify_html = require('js-beautify').html_beautify;

All methods returned accept two arguments, the source string and an options object.
**/
var js_beautify = require('./lib/beautify').js_beautify;
var css_beautify = require('./lib/beautify-css').css_beautify;
var html_beautify = require('./lib/beautify-html').html_beautify;

// the default is js
var beautify = function (src, config) {
    return js_beautify(src, config);
};

// short aliases
beautify.js   = js_beautify;
beautify.css  = css_beautify;
beautify.html = html_beautify;

// legacy aliases
beautify.js_beautify   = js_beautify;
beautify.css_beautify  = css_beautify;
beautify.html_beautify = html_beautify;

module.exports = beautify;
