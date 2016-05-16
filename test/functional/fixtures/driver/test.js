var errorInEachBrowserContains = require('../../assertion-helper').errorInEachBrowserContains;

describe('TestRun - Driver protocol', function () {
    it('TestRun should not process the same driver status twice', function () {
        // NOTE: test scenario is not trivial, so I describe it here:
        // 1) TestRun send the Click command to the driver.
        // 2) Driver executes a click action and send status to the server, but don't get the response at once because
        //    TestRun has no a pending command in the queue.
        // 3) 900 ms after the click page location is changed. But server response with a new page is delayed and the
        //    current page is in unloading state for about 2 seconds.
        // 4) 1 sec after the click TestRun send a new command to driver but driver ignores it because the page is unloading.
        // 5) After the page reloaded driver resend the last status (since it didn't get the response for the last request).
        // 6) TestRun should not process the status but just returns cached response.

        return runTests('./testcafe-fixtures/repeated-driver-status.js', 'Click and wait for page unloading', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Button clicked', 0);
                errorInEachBrowserContains(errs, '> 13 |    await t.click(\'#btn\');', 0);
            });
    });
});
