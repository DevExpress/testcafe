import { proxyUrlTest } from '../common/tests.js';

fixture `Fixture`
    .disableNativeAutomation
    .page('http://localhost:3000/fixtures/native-automation/pages/index.html');

proxyUrlTest();
