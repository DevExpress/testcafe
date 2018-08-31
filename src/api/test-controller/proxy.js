import TestController from './';
import { delegateAPI } from '../../utils/delegated-api';
import testRunTracker from '../test-run-tracker';
import { APIError } from '../../errors/runtime';
import MESSAGE from '../../errors/runtime/message';

const testControllerProxy = Object.create(null);

delegateAPI(testControllerProxy, TestController.API_LIST, {
    getHandler (propName, accessor) {
        const testRun = testRunTracker.resolveContextTestRun();

        if (!testRun) {
            let callsiteName = null;

            if (accessor === 'getter')
                callsiteName = 'get';
            else if (accessor === 'setter')
                callsiteName = 'set';
            else
                callsiteName = propName;

            throw new APIError(callsiteName, MESSAGE.testControllerProxyCantResolveTestRun);
        }

        return testRun.controller;
    }
});

export default testControllerProxy;
