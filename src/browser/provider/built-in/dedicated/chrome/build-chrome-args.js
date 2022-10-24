export const CONTAINERIZED_CHROME_FLAGS = ['--no-sandbox', '--disable-dev-shm-usage'];

export function buildChromeArgs ({ config, cdpPort, platformArgs, tempProfileDir, isContainerized }) {
    let chromeArgs = []
        .concat(
            cdpPort ? [`--remote-debugging-port=${cdpPort}`] : [],
            !config.userProfile ? [`--user-data-dir=${tempProfileDir.path}`] : [],
            config.headless ? ['--headless'] : [],
            config.userArgs ? [config.userArgs] : [],
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
