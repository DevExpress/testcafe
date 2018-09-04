import momentDurationFormatSetup from 'moment-duration-format-commonjs';


const MOMENT_MODULE_NAME = 'moment';

function loadMomentModule () {
    const momentModulePath  = require.resolve(MOMENT_MODULE_NAME);
    const savedMomentModule = require.cache[momentModulePath];

    delete require.cache[savedMomentModule];

    const moment = require(momentModulePath);

    momentDurationFormatSetup(moment);

    if (savedMomentModule)
        require.cache[momentModulePath] = savedMomentModule;
    else
        delete require.cache[momentModulePath];

    return moment;
}

export default loadMomentModule();
