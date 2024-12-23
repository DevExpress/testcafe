export const CONTAINERIZED_CHROME_FLAGS = ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'];

export function buildChromeArgs ({ config, cdpPort, platformArgs, tempProfileDir, isContainerized, isNativeAutomation, browserName }) {
    const headlessMode = ['chrome', 'chromium'].includes(browserName) ? '--headless=new' : '--headless';
    const defaultArgs  = [
        '--disable-search-engine-choice-screen',
        '--disable-component-extensions-with-background-pages',
        '--allow-pre-commit-input',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-client-side-phishing-detection',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-hang-monitor',
        '--disable-infobars',
        '--disable-ipc-flooding-protection',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--disable-renderer-backgrounding',
        '--disable-sync',
        '--enable-automation',
        '--export-tagged-pdf',
        '--generate-pdf-document-outline',
        '--force-color-profile=srgb',
        '--metrics-recording-only',
        '--no-first-run',
        '--password-store=basic',
        '--use-mock-keychain',
    ];

    let chromeArgs = []
        .concat(
            cdpPort ? [`--remote-debugging-port=${cdpPort}`] : [],
            !config.userProfile ? [`--user-data-dir=${tempProfileDir.path}`] : [],
            config.headless ? [headlessMode] : [],
            config.userArgs ? [config.userArgs] : [],
            // NOTE: we need to prevent new window blocking for multiple windows in Native Automation
            isNativeAutomation ? ['--disable-popup-blocking'] : [],
            platformArgs ? [platformArgs] : [],
            defaultArgs
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
