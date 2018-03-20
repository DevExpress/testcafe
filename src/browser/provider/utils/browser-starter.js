import Promise from 'pinkie';
import OS from 'os-family';
import browserTools from 'testcafe-browser-tools';
import delay from '../../../utils/delay';


const POST_OPERATION_DELAY = 500;

class OperationsQueue {
    constructor () {
        this.chainPromise = Promise.resolve();
    }

    executeOperation (operation) {
        const operationPromise = this.chainPromise.then(operation);

        this.chainPromise = operationPromise.then(() => delay(POST_OPERATION_DELAY));

        return operationPromise;
    }
}

export default class BrowserStarter {
    constructor () {
        // NOTE: You can't start multiple instances of the same app at the same time on macOS.
        // That's why a queue of opening requests is needed.
        this.macOSBrowserOpeningQueue = new OperationsQueue();
    }

    async startBrowser (...openArgs) {
        const openBrowserOperation = () => browserTools.open(...openArgs);

        if (OS.mac)
            await this.macOSBrowserOpeningQueue.executeOperation(openBrowserOperation);
        else
            await openBrowserOperation();
    }
}
