import Promise from 'pinkie';


export default class BrowserProviderCacheItem {
    constructor (provider) {
        this.provider    = provider;
        this.initPromise = Promise.resolve(false);
    }

    init () {
        this.initPromise = this.initPromise
            .then(initialized => initialized ? Promise.resolve() : this.provider.init())
            .then(() => true)
            .catch(() => false);

        return this.initPromise;
    }

    dispose () {
        this.initPromise = this.initPromise
            .then(initialized => initialized ? this.provider.dispose() : Promise.resolve())
            .then(() => false)
            .catch(() => false);

        return this.initPromise;
    }
}
