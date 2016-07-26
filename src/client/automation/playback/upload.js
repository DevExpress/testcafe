import { doUpload } from '../deps/hammerhead';
import { arrayUtils } from '../deps/testcafe-core';


export default class UploadAutomation {
    constructor (element, paths, createError) {
        this.element     = element;
        this.paths       = paths;
        this.createError = createError;
    }

    run () {
        return doUpload(this.element, this.paths)
            .then(errs => {
                if (errs.length)
                    throw this.createError(arrayUtils.map(errs, err => err.path));
            });
    }
}
