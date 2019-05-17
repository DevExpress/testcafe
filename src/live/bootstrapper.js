import path from 'path';
import Module from 'module';
import Bootstrapper from '../runner/bootstrapper';
import Compiler from '../compiler';

const originalRequire = Module.prototype.require;

class LiveModeBootstrapper extends Bootstrapper {
    constructor (runner, browserConnectionGateway) {
        super(browserConnectionGateway);

        this.runner = runner;
    }

    async _getTests () {
        this._mockRequire();

        try {
            return await super._getTests();
        }
        catch (err) {
            await Compiler.cleanUp();

            this.runner.setBootstrappingError(err);
        }
        finally {
            this._restoreRequire();
        }
    }

    _mockRequire () {
        const runner = this.runner;

        // NODE: we replace the `require` method to add required files to watcher
        Module.prototype.require = function (filePath) {
            const filename = Module._resolveFilename(filePath, this, false);

            if (path.isAbsolute(filename) || /^\.\.?[/\\]/.test(filename))
                runner.emit(runner.REQUIRED_MODULE_FOUND_EVENT, { filename });


            return originalRequire.apply(this, arguments);
        };
    }

    _restoreRequire () {
        Module.prototype.require = originalRequire;
    }
}

export default LiveModeBootstrapper;
