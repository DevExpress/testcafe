'use strict';

exports.__esModule = true;

var _resolveFrom = require('resolve-from');

var _resolveFrom2 = _interopRequireDefault(_resolveFrom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MOMENT_MODULE_NAME = 'moment';
var DURATION_FORMAT_MODULE_NAME = 'moment-duration-format';

function restoreInitialCacheState(module, path) {
    if (module) require.cache[path] = module;else delete require.cache[path];
}

function getSideMomentModulePath(sidePath) {
    try {
        return (0, _resolveFrom2.default)(sidePath, MOMENT_MODULE_NAME);
    } catch (err) {
        return '';
    }
}

function getModulesPaths() {
    var durationFormatModulePath = require.resolve(DURATION_FORMAT_MODULE_NAME);

    return {
        durationFormatModulePath: durationFormatModulePath,

        mainMomentModulePath: require.resolve(MOMENT_MODULE_NAME),
        sideMomentModulePath: getSideMomentModulePath(durationFormatModulePath)
    };
}

function getCachedAndCleanModules(modulePath) {
    var cachedModule = require.cache[modulePath];

    delete require.cache[modulePath];

    require(modulePath);

    return { cachedModule: cachedModule, cleanModule: require.cache[modulePath] };
}

function getMomentModules(_ref) {
    var mainMomentModulePath = _ref.mainMomentModulePath,
        sideMomentModulePath = _ref.sideMomentModulePath;

    var _getCachedAndCleanMod = getCachedAndCleanModules(mainMomentModulePath),
        cachedModule = _getCachedAndCleanMod.cachedModule,
        cleanModule = _getCachedAndCleanMod.cleanModule;

    return {
        sideModule: require.cache[sideMomentModulePath],
        mainModule: cleanModule,
        cachedModule: cachedModule
    };
}

function getMomentModuleWithDurationFormatPatch() {
    var modulesPaths = getModulesPaths();
    var momentModules = getMomentModules(modulesPaths);

    var sideMomentModulePath = modulesPaths.sideMomentModulePath,
        mainMomentModulePath = modulesPaths.mainMomentModulePath,
        durationFormatModulePath = modulesPaths.durationFormatModulePath;


    if (sideMomentModulePath && sideMomentModulePath !== mainMomentModulePath) {
        require.cache[sideMomentModulePath] = momentModules.mainModule;

        require(durationFormatModulePath);

        restoreInitialCacheState(momentModules.sideModule, sideMomentModulePath);
    } else {
        var durationFormatSetup = require(durationFormatModulePath);

        if (!sideMomentModulePath) durationFormatSetup(momentModules.mainModule.exports);
    }

    restoreInitialCacheState(momentModules.cachedModule, mainMomentModulePath);

    return momentModules.mainModule.exports;
}

exports.default = getMomentModuleWithDurationFormatPatch();
module.exports = exports['default'];