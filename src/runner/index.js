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
    src (...sources) {
        this.bootstrapper.src = concatFlattened(this.bootstrapper.src, sources);
    }

    browsers (...browserList) {
        this.bootstrapper.browsers = concatFlattened(this.bootstrapper.browsers, browserList);
    }

    reporter (reporter, outStream = null) {
        this.bootstrapper.reporter        = reporter;
        this.bootstrapper.reportOutStream = outStream;
    }

    filter (fn) {
        this.bootstrapper.filter = fn;
    }

    screenshots (path, takeOnFails = false) {
        this.opts.takeScreenshotOnFails  = takeOnFails;
        this.bootstrapper.screenshotPath = path;
    }

    async run ({ failOnJsErrors = true, quarantineMode = false }) {
        this.opts.failOnJsErrors = failOnJsErrors;
        this.opts.quarantineMode = quarantineMode;

        // TODO
        // var config = await this.bootstrapper.createRunnableConfiguration();
    }
}
