export const CONTAINERIZED_CHROME_FLAGS = ['--no-sandbox', '--disable-dev-shm-usage'];

export function buildChromeArgs ({ config, cdpPort, platformArgs, tempProfileDir, isContainerized, isNativeAutomation, browserName }) {
    const headlessMode = ['chrome', 'chromium'].includes(browserName) ? '--headless=new' : '--headless';

    let chromeArgs = []
        .concat(
            cdpPort ? [`--remote-debugging-port=${cdpPort}`] : [],
            !config.userProfile ? [`--user-data-dir=${tempProfileDir.path}`] : [],
            config.headless ? [headlessMode] : [],
            config.userArgs ? [config.userArgs] : [],
            // NOTE: we need to prevent new window blocking for multiple windows in Native Automation
            isNativeAutomation ? ['--disable-popup-blocking'] : [],
            platformArgs ? [platformArgs] : []
        )
        .join(' ');

    if (isContainerized) {
        CONTAINERIZED_CHROME_FLAGS.forEach(flag => {
            if (!chromeArgs.includes(flag))
                chromeArgs = chromeArgs.concat(' ', flag);
        });
    }

    return chromeArgs;
}
