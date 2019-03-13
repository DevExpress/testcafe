const IN_DOCKER_FLAGS = ['--no-sandbox', '--disable-dev-shm-usage'];

export default function buildChromeArgs (config, cdpPort, platformArgs, profileDir, inDocker) {
    let chromeArgs = []
        .concat(
            cdpPort ? [`--remote-debugging-port=${cdpPort}`] : [],
            !config.userProfile ? [`--user-data-dir=${profileDir.path}`] : [],
            config.headless ? ['--headless'] : [],
            config.userArgs ? [config.userArgs] : [],
            platformArgs ? [platformArgs] : []
        )
        .join(' ');

    if (inDocker) {
        IN_DOCKER_FLAGS.forEach(inDockerFlag => {
            if (!chromeArgs.includes(inDockerFlag))
                chromeArgs = chromeArgs.concat(' ', inDockerFlag);
        });
    }

    return chromeArgs;
}
