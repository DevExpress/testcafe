import path from 'path';
import TempDirectory from '../../../../../utils/temp-directory';
import { writeFile } from '../../../../../utils/promisified-functions';
import db from 'mime-db';

function getMimeTypes (): string {
    const mimeTypes = Object.keys(db);

    return mimeTypes.filter(mimeType => {
        // @ts-ignore: Export of the 'mime-db' module has no index signature.
        const { extensions } = db[mimeType];

        return extensions && extensions.length;
    }).join(',');
}

async function generatePreferences (profileDir: string, { marionettePort, config }: { marionettePort: number; config: any }): Promise<void> {
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
        `user_pref("browser.helperApps.neverAsk.saveToDisk", "${getMimeTypes()}");`,
        `user_pref("pdfjs.disabled", true);`,
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
        'user_pref("signon.rememberSignons", false);',
        // NOTE: dom.min_background_timeout_value should be equal to dom.min_timeout_value
        'user_pref("dom.min_background_timeout_value", 4);',
        'user_pref("dom.timeout.throttling_delay", 0);',
        'user_pref("dom.timeout.budget_throttling_max_delay", 0);',
        // NOTE: We set the foreground configuration for the background budget throttling parameters
        'user_pref("dom.timeout.background_throttling_max_budget", -1);',
        'user_pref("dom.timeout.background_budget_regeneration_rate", 1);',
        'user_pref("security.enterprise_roots.enabled", true);'
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

export default async function (runtimeInfo: any): Promise<TempDirectory> {
    const tmpDir = await TempDirectory.createDirectory('firefox-profile');

    await generatePreferences(tmpDir.path, runtimeInfo);

    return tmpDir;
}
