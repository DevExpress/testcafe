import path from 'path';
import TempDirectory from '../../../../../utils/temp-directory';
import { writeFile } from '../../../../../utils/promisified-functions';


async function generatePreferences (profileDir, { marionettePort, config }) {
    const prefsFileName = path.join(profileDir, 'user.js');

    let prefs = [
        'user_pref("browser.link.open_newwindow.override.external", 2);',
        'user_pref("app.update.enabled", false);',
        'user_pref("app.update.auto", false);',
        'user_pref("app.update.mode", 0);',
        'user_pref("app.update.service.enabled", false);',
        'user_pref("browser.shell.checkDefaultBrowser", false);',
        'user_pref("browser.usedOnWindows10", true);',
        'user_pref("browser.rights.3.shown", true);',
        'user_pref("browser.startup.homepage_override.mstone","ignore");',
        'user_pref("browser.tabs.warnOnCloseOtherTabs", false);',
        'user_pref("browser.tabs.warnOnClose", false);',
        'user_pref("browser.sessionstore.resume_from_crash", false);',
        'user_pref("toolkit.telemetry.reportingpolicy.firstRun", false);',
        'user_pref("toolkit.telemetry.enabled", false);',
        'user_pref("toolkit.telemetry.rejected", true);',
        'user_pref("datareporting.healthreport.uploadEnabled", false);',
        'user_pref("datareporting.healthreport.service.enabled", false);',
        'user_pref("datareporting.healthreport.service.firstRun", false);',
        'user_pref("datareporting.policy.dataSubmissionEnabled", false);',
        'user_pref("datareporting.policy.dataSubmissionPolicyBypassNotification", true);',
        'user_pref("app.shield.optoutstudies.enabled", false);',
        'user_pref("extensions.shield-recipe-client.enabled", false);',
        'user_pref("extensions.shield-recipe-client.first_run", false);',
        'user_pref("extensions.shield-recipe-client.startupExperimentPrefs.browser.newtabpage.activity-stream.enabled", false);',
        'user_pref("devtools.toolbox.host", "window");',
        'user_pref("devtools.toolbox.previousHost", "bottom");',
        'user_pref("signon.rememberSignons", false);'
    ];

    if (marionettePort) {
        prefs = prefs.concat([
            `user_pref("marionette.port", ${marionettePort});`,
            'user_pref("marionette.enabled", true);'
        ]);
    }

    if (config.disableMultiprocessing) {
        prefs = prefs.concat([
            'user_pref("browser.tabs.remote.autostart", false);',
            'user_pref("browser.tabs.remote.autostart.2", false);',
        ]);
    }

    await writeFile(prefsFileName, prefs.join('\n'));
}

export default async function (runtimeInfo) {
    const tmpDir = await TempDirectory.createDirectory('firefox-profile');

    await generatePreferences(tmpDir.path, runtimeInfo);

    return tmpDir;
}
