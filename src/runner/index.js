import Bootstrapper from './bootstrapper';
import concatFlattened from '../utils/array-concat-flattened';

export default class Runner {
    constructor (proxy, browserConnectionGateway) {
        this.proxy        = proxy;
        this.bootstrapper = new Bootstrapper(browserConnectionGateway);

        this.opts = {
            screenshotPath:        null,
            takeScreenshotOnFails: false,
            failOnJsErrors:        true,
            quarantineMode:        false
        };
    }

    // API
    src (...src) {
        this.bootstrapper.src = concatFlattened(this.bootstrapper.src, src);

        return this;
    }

    browsers (...browsers) {
        this.bootstrapper.browsers = concatFlattened(this.bootstrapper.browsers, browsers);

        return this;
    }

    reporter (reporter, outStream = null) {
        this.bootstrapper.reporter        = reporter;
        this.bootstrapper.reportOutStream = outStream;

        return this;
    }

    filter (filter) {
        this.bootstrapper.filter = filter;

        return this;
    }

    screenshots (path, takeOnFails = false) {
        this.opts.takeScreenshotOnFails  = takeOnFails;
        this.bootstrapper.screenshotPath = path;

        return this;
    }

    async run ({ failOnJsErrors = true, quarantineMode = false }) {
        this.opts.failOnJsErrors = failOnJsErrors;
        this.opts.quarantineMode = quarantineMode;

        // TODO
        // var config = await this.bootstrapper.createRunnableConfiguration();
    }
}
