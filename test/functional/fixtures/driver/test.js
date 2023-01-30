const { errorInEachBrowserContains }       = require('../../assertion-helper');
const { skipInProxyless, onlyInProxyless } = require('../../utils/skip-in');


describe('TestRun - Driver protocol', function () {
    it('TestRun should not process the same driver status twice', function () {
        /*
        This test scenario is not trivial, so here's what it does:
        1) The TestRun sends the Click command to the driver.
        2) The driver executes the click action and sends the status to the server, but doesn't
           get the response immediately because TestRun has no pending command in the queue.
        3) 900 ms after the click the page location is changed. But the server response with the
           new page is delayed and the current page stays in the unloading state for about 2 seconds.
        4) 1 sec after the click the TestRun sends a new command to the driver, but the driver ignores
           it because the page is unloading.
        5) After the page is reloaded, the driver resends the last status (since it didn't get the
           response for the previous request).
        6) The TestRun should not process this status. It should just return the cached response.
        */

        return runTests('./testcafe-fixtures/driver-test.js', 'Click and wait for page unloading', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Button clicked', 0);
                errorInEachBrowserContains(errs, '> 15 |    await t.click(\'#btn\');', 0);
            });
    });

    skipInProxyless('Driver should prevent a real action', function () {
        return runTests('./testcafe-fixtures/prevent-real-action-test.js', 'Perform native click');
    });

    describe('Regression', function () {
        it('Should allow mixed execution order (GH-564)', function () {
            return runTests('./testcafe-fixtures/driver-test.js', 'Mixed execution order');
        });

        skipInProxyless('Should clear out the localStorage and sessionStorage after test (GH-1546)(proxy)', function () {
            return runTests('./testcafe-fixtures/clear-and-lock-storages.js');
        });

        onlyInProxyless('Should clear out the localStorage and sessionStorage after test (GH-1546)(proxyless)', function () {
            return runTests('./testcafe-fixtures/clear-and-lock-storages-proxyless-part-1.js');
        });

        onlyInProxyless('Should clear out the localStorage and sessionStorage for multiple domains(proxyless)', function () {
            return runTests('./testcafe-fixtures/clear-and-lock-storages-proxyless-part-2.js');
        });
    });
});
