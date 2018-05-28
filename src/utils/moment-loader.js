import resolveFrom from 'resolve-from';

function restoreInitialCacheState (module, path) {
    if (module)
        require.cache[path] = module;
    else
        delete require.cache[path];
}

function getSideMomentModulePath (sidePath) {
    try {
        return resolveFrom(sidePath, 'moment');
    }
    catch (err) {
        return '';
    }
}

function getModulesPaths () {
    const durationFormatModulePath = require.resolve('moment-duration-format');

    return {
        durationFormatModulePath,

        mainMomentModulePath: require.resolve('moment'),
        sideMomentModulePath: getSideMomentModulePath(durationFormatModulePath)
    };
}

function getCachedAndCleanModules (modulePath) {
    const cachedModule = require.cache[modulePath];

    delete require.cache[modulePath];

    require(modulePath);

    return { cachedModule, cleanModule: require.cache[modulePath] };
}

function getMomentModules ({ mainMomentModulePath, sideMomentModulePath }) {
    return {
        sideModule: require.cache[sideMomentModulePath],

        ...getCachedAndCleanModules(mainMomentModulePath)
    };
}

function getMomentModuleWithDurationFormatPatch () {
    const modulesPaths  = getModulesPaths();
    const momentModules = getMomentModules(modulesPaths);

    if (modulesPaths.sideMomentModulePath && modulesPaths.sideMomentModulePath !== modulesPaths.mainMomentModulePath) {
        require.cache[modulesPaths.sideMomentModulePath] = momentModules.mainModule;

        require(modulesPaths.durationFormatModulePath);

        restoreInitialCacheState(momentModules.sideModule, modulesPaths.sideMomentModulePath);
    }
    else {
        const durationFormatSetup = require(modulesPaths.durationFormatModulePath);

        if (!modulesPaths.sideMomentModulePath)
            durationFormatSetup(momentModules.mainModule.exports);
    }

    restoreInitialCacheState(momentModules.cachedModule, modulesPaths.mainMomentModulePath);

    return momentModules.mainModule.exports;
}

export default getMomentModuleWithDurationFormatPatch();
