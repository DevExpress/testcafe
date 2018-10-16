import { readSync as read } from 'read-file-relative';


const ASSETS_CACHE = {};

function loadAsset (filename, asBuffer) {
    if (!ASSETS_CACHE[filename])
        ASSETS_CACHE[filename] = read(filename, asBuffer);

    return ASSETS_CACHE[filename];
}

export default function (developmentMode) {
    const scriptNameSuffix = developmentMode ? 'js' : 'min.js';

    return {
        favIcon:          loadAsset('./client/ui/favicon.ico', true),
        coreScript:       loadAsset(`./client/core/index.${scriptNameSuffix}`),
        driverScript:     loadAsset(`./client/driver/index.${scriptNameSuffix}`),
        uiScript:         loadAsset(`./client/ui/index.${scriptNameSuffix}`),
        uiStyle:          loadAsset('./client/ui/styles.css'),
        uiSprite:         loadAsset('./client/ui/sprite.png', true),
        automationScript: loadAsset(`./client/automation/index.${scriptNameSuffix}`),

        // NOTE: Load the legacy client script lazily to reduce startup time
        legacyRunnerScript: require('testcafe-legacy-api').CLIENT_RUNNER_SCRIPT
    };
}
