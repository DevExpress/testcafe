import Configuration from './index';

export default async function initConfiguration (options) {
    const configuration = new Configuration();

    await configuration.load();

    configuration.mergeOptions(options);

    return configuration;
}
