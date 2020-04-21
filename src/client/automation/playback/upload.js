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
                if (!errs.length)
                    return;

                const filePaths        = arrayUtils.map(errs, err => err.path);
                const scannedFilePaths = arrayUtils.reduce(errs, (prev, current) => {
                    return prev.concat(current.resolvedPaths);
                }, []);

                throw this.createError(filePaths, scannedFilePaths);
            });
    }
}
