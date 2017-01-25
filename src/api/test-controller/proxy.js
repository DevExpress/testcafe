import TestController from './';
import { delegateAPI } from '../../utils/delegated-api';
import testRunTracker from '../test-run-tracker';
import { APIError } from '../../errors/runtime';
import MESSAGE from '../../errors/runtime/message';

var testControllerProxy = Object.create(null);

delegateAPI(testControllerProxy, TestController.API_LIST, {
    getHandler (propName, accessor) {
        var testRun = testRunTracker.resolveContextTestRun();

        if (!testRun) {
            var callsiteName = null;

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
