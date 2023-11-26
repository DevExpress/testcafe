import {
    doUpload, eventSandbox, nativeMethods,
} from '../deps/hammerhead';
import { arrayUtils } from '../deps/testcafe-core';


export default class UploadAutomation {
    constructor (element, paths, createError, isNativeAutomation) {
        this.element     = element;
        this.paths       = paths;
        this.createError = createError;

        if (isNativeAutomation)
            this._handleRequiredInput();
    }

    _handleRequiredInput () {
        const isRequired = nativeMethods.hasAttribute.call(this.element, 'required');

        if (isRequired)
            nativeMethods.removeAttribute.call(this.element, 'required');

        const ensureUploadInputHasRequiredAttribute = () => {
            if (isRequired)
                nativeMethods.setAttribute.call(this.element, 'required', 'true');
        };

        if (this.element.form) {
            eventSandbox.listeners.initElementListening(this.element.form, ['submit']);
            eventSandbox.listeners.addInternalEventAfterListener(this.element.form, ['submit'], ensureUploadInputHasRequiredAttribute);
        }
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
