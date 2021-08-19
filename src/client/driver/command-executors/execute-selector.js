import SelectorExecutor from './client-functions/selector-executor';
import getExecutorResultDriverStatus from './get-executor-result-driver-status';

export function getResult (command, globalTimeout, startTime, createNotFoundError, createIsInvisibleError, statusBar) {
    const selectorExecutor = new SelectorExecutor(command, globalTimeout, startTime, createNotFoundError, createIsInvisibleError);

    statusBar.showWaitingElementStatus(selectorExecutor.timeout);

    return selectorExecutor.getResult()
        .then(el => {
            return statusBar.hideWaitingElementStatus(!!el)
                .then(() => el);
        })
        .catch(err => {
            return statusBar.hideWaitingElementStatus(false)
                .then(() => {
                    throw err;
                });
        });
}

export function getResultDriverStatus (command, globalTimeout, startTime, createNotFoundError, createIsInvisibleError, statusBar) {
    const selectorExecutor = new SelectorExecutor(command, globalTimeout, startTime, createNotFoundError, createIsInvisibleError);

    statusBar.showWaitingElementStatus(selectorExecutor.timeout);

    return getExecutorResultDriverStatus(selectorExecutor)
        .then(status => {
            return statusBar.hideWaitingElementStatus(!!status.result)
                .then(() => status);
        });
}
