export const IN_DOCKER_FLAGS = ['--no-sandbox', '--disable-dev-shm-usage'];

export function buildChromeArgs ({ config, cdpPort, platformArgs, tempProfileDir, inDocker: inContainer }) {
    let chromeArgs = []
        .concat(
            cdpPort ? [`--remote-debugging-port=${cdpPort}`] : [],
            !config.userProfile ? [`--user-data-dir=${tempProfileDir.path}`] : [],
            config.headless ? ['--headless'] : [],
            config.userArgs ? [config.userArgs] : [],
            platformArgs ? [platformArgs] : []
        )
        .join(' ');

    if (inContainer) {
        IN_DOCKER_FLAGS.forEach(inDockerFlag => {
            if (!chromeArgs.includes(inDockerFlag))
                chromeArgs = chromeArgs.concat(' ', inDockerFlag);
        });
    }

    return chromeArgs;
}
