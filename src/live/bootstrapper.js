import Bootstrapper from '../runner/bootstrapper';

class LiveModeBootstrapper extends Bootstrapper {
    constructor ({ runner, ...services }) {
        super(services);

        this.runner = runner;
    }

    async _getTests () {
        try {
            return await super._getTests();
        }
        catch (err) {
            await this.compilerHost.cleanUp();

            this.runner.setBootstrappingError(err);

            return void 0;
        }
    }
}

export default LiveModeBootstrapper;
