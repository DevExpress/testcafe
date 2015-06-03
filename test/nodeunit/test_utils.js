var http = require('http'),
    fs = require('fs'),
    express = require('express'),
    child_process = require('child_process'),
    path = require('path');

//Flags
var DEBUG = typeof v8debug !== 'undefined'; //Disables watchdog for debugging purposes.

//Constants
var TEST_TIMEOUT = 5000,
    PACKAGE_JSON_PATH = path.join(__dirname, '../../package.json');

//Constants export
exports.ORIGIN_SERVER_PORT = 1335;
exports.ORIGIN_SERVER_HOST = '127.0.0.1:' + exports.ORIGIN_SERVER_PORT;
exports.TEST_CAFE_PROXY_PORT = 1836;
exports.TEST_CAFE_CROSS_DOMAIN_PROXY_PORT = 1838;
exports.TEST_CAFE_PROXY_HOST = '127.0.0.1:' + exports.TEST_CAFE_PROXY_PORT;
exports.TEST_CAFE_CONTROL_PANEL_PORT = 1837;

//Utils
exports.removeLineBreaks = function (str) {
    return str.replace(/(\r\n|\n|\r)/gm, '');
};

exports.compareCode = function (code1, code2) {
    var sanitize = function (code) {
        return exports.removeLineBreaks(code)
            .replace(/'/gm, '"')
            .replace(/\s+/gm, '');
    };

    return sanitize(code1) === sanitize(code2);
};

exports.normalizePath = function (path) {
    return path.replace(/\\/gm, '/');
};

exports.isNumber = function (obj) {
    return typeof obj === 'number' && isFinite(obj);
};

var rmdirRecursive = exports.rmdirRecursive = function (dirPath) {
    fs.readdirSync(dirPath).forEach(function (fileName) {
        var filePath = path.join(dirPath, fileName),
            stats = fs.statSync(filePath);

        if (stats.isDirectory())
            rmdirRecursive(filePath);
        else
            fs.unlinkSync(filePath);
    });

    fs.rmdirSync(dirPath);
};

var copyDirRecursiveSync = exports.copyDirRecursiveSync = function(from, to) {
    fs.readdirSync(from).forEach(function (fileName) {
        var filePath = path.join(from, fileName),
            stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            fs.mkdirSync(path.join(to, fileName));
            copyDirRecursiveSync(filePath, path.join(to, fileName));
        }
        else {
            fs.writeFileSync(path.join(to, fileName), fs.readFileSync(filePath));
        }
    });
};

//Watchdog
var Watchdog = exports.Watchdog = function (browser) {
    if (!DEBUG) {
        this.timeout = setTimeout(function () {
            throw 'Watchdog caught test timeout. Good puppy!';
        }, TEST_TIMEOUT);
    }
};

Watchdog.prototype.shrink = function () {
    if (!DEBUG)
        clearTimeout(this.timeout);
};

exports.getCurVersionRegKeySync = function () {
    var versionStr = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8')).version,
        versionArr = versionStr.split('.');

    return [versionArr[0], versionArr[1]].join('');
};