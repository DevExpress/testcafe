const resolveFrom                  = require('resolve-from');
const testcafeMomentModulePath     = require.resolve('moment');
const testcafeOriginalMomentModule = require.cache[testcafeMomentModulePath];

delete require.cache[testcafeMomentModulePath];

const moment                   = require(testcafeMomentModulePath);
const momentDurationFormatPath = require.resolve('moment-duration-format');

function restoreInitialCacheState (module, path) {
    if (module)
        require.cache[path] = module;
    else
        delete require.cache[path];
}

let sideMomentModulePath = '';

try {
    sideMomentModulePath = resolveFrom(momentDurationFormatPath, 'moment');
}
catch (err) {
    //
}

if (sideMomentModulePath && sideMomentModulePath !== testcafeMomentModulePath) {
    const testcafeMomentModule = require.cache[testcafeMomentModulePath];
    const sideMomentModule     = require.cache[sideMomentModulePath];

    require.cache[sideMomentModulePath] = testcafeMomentModule;
    require(momentDurationFormatPath);
    restoreInitialCacheState(sideMomentModule, sideMomentModulePath);
}
else {
    const momentDurationFormatSetup = require(momentDurationFormatPath);

    if (!sideMomentModulePath)
        momentDurationFormatSetup(moment);
}

restoreInitialCacheState(testcafeOriginalMomentModule, testcafeMomentModulePath);

export default moment;
