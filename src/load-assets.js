import { readSync as read } from 'read-file-relative';
import { getAssetPath } from 'testcafe-hammerhead';


const ASSETS_CACHE = {};

function loadAsset (filename, asBuffer) {
    if (!ASSETS_CACHE[filename])
        ASSETS_CACHE[filename] = read(filename, asBuffer);

    return ASSETS_CACHE[filename];
}

export default function (developmentMode) {
    return {
        favIcon:      loadAsset('./client/ui/favicon.ico', true),
        coreScript:   loadAsset(getAssetPath('./client/core/index.js', developmentMode)),
        driverScript: loadAsset(getAssetPath('./client/driver/index.js', developmentMode)),
        uiScript:     loadAsset(getAssetPath('./client/ui/index.js', developmentMode)),
        uiStyle:      loadAsset('./client/ui/styles.css'),
        uiSprite:     loadAsset('./client/ui/sprite.png', true),
        uiSpriteSvg:  loadAsset('./client/ui/sprite.svg', true),

        idlePageScript: loadAsset('./client/browser/idle-page/index.js'),
        idlePageStyle:  loadAsset('./client/browser/idle-page/styles.css'),
        idlePageLogo:   loadAsset('./client/browser/idle-page/logo.svg', true),

        serviceWorkerScript: loadAsset('./client/browser/service-worker.js'),

        automationScript: loadAsset(getAssetPath('./client/automation/index.js', developmentMode)),

        // NOTE: Load the legacy client script lazily to reduce startup time
        legacyRunnerScript: require('testcafe-legacy-api').CLIENT_RUNNER_SCRIPT,
    };
}
