// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

const NATIVE_METHODS_PROPERTY_NAME = '_nativeMethods';

export default class BrowserConsoleMessages {
    constructor (data, nativeMethods) {
        const resultNativeMethods = this._ensureNativeMethods(nativeMethods);

        resultNativeMethods.objectDefineProperty(this, NATIVE_METHODS_PROPERTY_NAME, { value: resultNativeMethods });

        this.concat(data);
    }

    _ensureNativeMethods (nativeMethods) {
        return nativeMethods || {
            objectKeys:           Object.keys,
            arrayForEach:         Array.prototype.forEach,
            arrayConcat:          Array.prototype.concat,
            arraySlice:           Array.prototype.slice,
            objectDefineProperty: Object.defineProperty
        };
    }

    _getWindowIds (consoleMessages) {
        return this[NATIVE_METHODS_PROPERTY_NAME].objectKeys(consoleMessages);
    }

    _copyArray (array) {
        return this[NATIVE_METHODS_PROPERTY_NAME].arraySlice.call(array);
    }

    _concatArrays (array, anotherArray) {
        return this[NATIVE_METHODS_PROPERTY_NAME].arrayConcat.call(array, anotherArray);
    }

    ensureMessageContainer (windowId) {
        if (this[windowId])
            return;

        this[windowId] = {
            log:   [],
            info:  [],
            warn:  [],
            error: []
        };
    }

    concat (consoleMessages) {
        if (!consoleMessages)
            return this;

        const windowIds = this._getWindowIds(consoleMessages);

        this[NATIVE_METHODS_PROPERTY_NAME].arrayForEach.call(windowIds, windowId => {
            this.ensureMessageContainer(windowId);

            this[windowId].log   = this._concatArrays(this[windowId].log, consoleMessages[windowId].log);
            this[windowId].info  = this._concatArrays(this[windowId].info, consoleMessages[windowId].info);
            this[windowId].warn  = this._concatArrays(this[windowId].warn, consoleMessages[windowId].warn);
            this[windowId].error = this._concatArrays(this[windowId].error, consoleMessages[windowId].error);
        });

        return this;
    }

    addMessage (type, msg, windowId) {
        this.ensureMessageContainer(windowId);

        this[windowId][type].push(msg);
    }

    getCopy () {
        const copy = {};

        const windowIds = this._getWindowIds(this);

        this[NATIVE_METHODS_PROPERTY_NAME].arrayForEach.call(windowIds, windowId => {
            copy[windowId] = {
                log:   this._copyArray(this[windowId].log),
                info:  this._copyArray(this[windowId].info),
                warn:  this._copyArray(this[windowId].warn),
                error: this._copyArray(this[windowId].error)
            };
        });

        return copy;
    }
}
