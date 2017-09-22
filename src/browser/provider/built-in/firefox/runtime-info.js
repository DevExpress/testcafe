import path from 'path';
import tmp from 'tmp';
import { getFreePort } from 'endpoint-utils';
import getConfig from './config';
import { writeFile } from '../../../../utils/promisified-functions';


function createTempProfileDir () {
    tmp.setGracefulCleanup();

    return tmp.dirSync({ unsafeCleanup: true });
}

async function generatePrefs (profileDir, port) {
    var prefsFileName = path.join(profileDir, 'user.js');

    var prefs = [
        'user_pref("app.update.enabled", false);',
        'user_pref("app.update.auto", false);',
        'user_pref("app.update.mode", 0);',
        'user_pref("app.update.service.enabled", false);',
        'user_pref("browser.rights.3.shown", true);',
        'user_pref("browser.startup.homepage_override.mstone","ignore");',
        'user_pref("browser.tabs.warnOnCloseOtherTabs", false);',
        'user_pref("browser.tabs.warnOnClose", false);',
        'user_pref("toolkit.telemetry.reportingpolicy.firstRun", false);'
    ];

    if (port) {
        prefs = prefs.concat([
            `user_pref("marionette.port", ${port});`,
            'user_pref("marionette.enabled", true);'
        ]);
    }

    await writeFile(prefsFileName, prefs.join('\n'));
}

export default async function (configString) {
    var config         = getConfig(configString);
    var tempProfileDir = !config.userProfile ? createTempProfileDir() : null;
    var marionettePort = config.headless ? config.marionettePort || await getFreePort() : null;

    if (!config.userProfile)
        await generatePrefs(tempProfileDir.name, marionettePort);

    return { config, tempProfileDir, marionettePort };
}
