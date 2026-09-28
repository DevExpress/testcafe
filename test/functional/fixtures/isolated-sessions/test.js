describe('Isolated Sessions', () => {
    let origRunTests = null;

    before(() => {
        origRunTests = global.runTests;

        global.runTests = (fixture, testName, opts = {}) => {
            opts.experimentalMultipleWindows = true;

            return origRunTests.call(this, fixture, testName, opts);
        };
    });

    after(() => {
        global.runTests = origRunTests;
    });

    describe('Basic Isolation', () => {
        it('Cookie isolation between sessions', () => {
            return runTests('testcafe-fixtures/basic-isolation-test.js', 'Cookie isolation between sessions', { only: 'chrome' });
        });

        it('localStorage isolation between sessions', () => {
            return runTests('testcafe-fixtures/basic-isolation-test.js', 'localStorage isolation between sessions', { only: 'chrome' });
        });

        it('sessionStorage isolation between sessions', () => {
            return runTests('testcafe-fixtures/basic-isolation-test.js', 'sessionStorage isolation between sessions', { only: 'chrome' });
        });

        it('DOM isolation between sessions', () => {
            return runTests('testcafe-fixtures/basic-isolation-test.js', 'DOM isolation between sessions', { only: 'chrome' });
        });

        it('Multiple isolated sessions', () => {
            return runTests('testcafe-fixtures/basic-isolation-test.js', 'Multiple isolated sessions', { only: 'chrome' });
        });

        it('Automatic cleanup on test end', () => {
            return runTests('testcafe-fixtures/basic-isolation-test.js', 'Automatic cleanup on test end', { only: 'chrome' });
        });

        it('Isolated pages are not instrumented by the main window', () => {
            return runTests('testcafe-fixtures/basic-isolation-test.js', 'Isolated pages are not instrumented by the main window', { only: 'chrome' });
        });
    });

    describe('Commands', () => {
        it('click', () => {
            return runTests('testcafe-fixtures/commands-test.js', 'click', { only: 'chrome' });
        });

        it('typeText', () => {
            return runTests('testcafe-fixtures/commands-test.js', 'typeText', { only: 'chrome' });
        });

        it('typeText with replace', () => {
            return runTests('testcafe-fixtures/commands-test.js', 'typeText with replace', { only: 'chrome' });
        });

        it('hover', () => {
            return runTests('testcafe-fixtures/commands-test.js', 'hover', { only: 'chrome' });
        });

        it('doubleClick', () => {
            return runTests('testcafe-fixtures/commands-test.js', 'doubleClick', { only: 'chrome' });
        });

        it('pressKey', () => {
            return runTests('testcafe-fixtures/commands-test.js', 'pressKey', { only: 'chrome' });
        });

        it('navigateTo', () => {
            return runTests('testcafe-fixtures/commands-test.js', 'navigateTo', { only: 'chrome' });
        });

        it('scroll and scrollBy', () => {
            return runTests('testcafe-fixtures/commands-test.js', 'scroll and scrollBy', { only: 'chrome' });
        });

        it('scrollIntoView', () => {
            return runTests('testcafe-fixtures/commands-test.js', 'scrollIntoView', { only: 'chrome' });
        });

        it('eval', () => {
            return runTests('testcafe-fixtures/commands-test.js', 'eval', { only: 'chrome' });
        });

        it('eval with return value', () => {
            return runTests('testcafe-fixtures/commands-test.js', 'eval with return value', { only: 'chrome' });
        });

        it('wait', () => {
            return runTests('testcafe-fixtures/commands-test.js', 'wait', { only: 'chrome' });
        });

        it('expect assertion', () => {
            return runTests('testcafe-fixtures/commands-test.js', 'expect assertion', { only: 'chrome' });
        });

        it('dispatchEvent', () => {
            return runTests('testcafe-fixtures/commands-test.js', 'dispatchEvent', { only: 'chrome' });
        });

        it('click waits for element to appear', () => {
            // The element appears after 800ms — needs more than the default 200ms functional-test selector timeout
            return runTests('testcafe-fixtures/commands-test.js', 'click waits for element to appear', { only: 'chrome', selectorTimeout: 3000 });
        });

        it('pressKey dispatches canonical key values', () => {
            return runTests('testcafe-fixtures/commands-test.js', 'pressKey dispatches canonical key values', { only: 'chrome' });
        });

        it('click honors modifiers and offsets', () => {
            return runTests('testcafe-fixtures/commands-test.js', 'click honors modifiers and offsets', { only: 'chrome' });
        });

        it('A caught error on a direct method does not block later commands', () => {
            return runTests('testcafe-fixtures/commands-test.js', 'A caught error on a direct method does not block later commands', { only: 'chrome' });
        });

        it('Chained assertions and actions outside t2.run()', () => {
            return runTests('testcafe-fixtures/commands-test.js', 'Chained assertions and actions outside t2.run()', { only: 'chrome' });
        });
    });

    describe('Selector Chaining', () => {
        it('click with Selector object', () => {
            return runTests('testcafe-fixtures/selector-chaining-test.js', 'click with Selector object', { only: 'chrome' });
        });

        it('Selector.withText', () => {
            return runTests('testcafe-fixtures/selector-chaining-test.js', 'Selector.withText', { only: 'chrome' });
        });

        it('Selector.withExactText', () => {
            return runTests('testcafe-fixtures/selector-chaining-test.js', 'Selector.withExactText', { only: 'chrome' });
        });

        it('Selector.nth', () => {
            return runTests('testcafe-fixtures/selector-chaining-test.js', 'Selector.nth', { only: 'chrome' });
        });

        it('Selector.filterVisible', () => {
            return runTests('testcafe-fixtures/selector-chaining-test.js', 'Selector.filterVisible', { only: 'chrome' });
        });

        it('Selector.find', () => {
            return runTests('testcafe-fixtures/selector-chaining-test.js', 'Selector.find', { only: 'chrome' });
        });

        it('Selector.withAttribute', () => {
            return runTests('testcafe-fixtures/selector-chaining-test.js', 'Selector.withAttribute', { only: 'chrome' });
        });

        it('Selector assertion outside t2.run() targets isolated session', () => {
            return runTests('testcafe-fixtures/selector-chaining-test.js', 'Selector assertion outside t2.run() targets isolated session', { only: 'chrome' });
        });

        it('Selector objects passed to direct methods', () => {
            return runTests('testcafe-fixtures/selector-chaining-test.js', 'Selector objects passed to direct methods', { only: 'chrome' });
        });

        it('Direct method with a missing element throws instead of using the focused element', () => {
            return runTests('testcafe-fixtures/selector-chaining-test.js', 'Direct method with a missing element throws instead of using the focused element', { only: 'chrome' });
        });
    });

    describe('t2.run()', () => {
        it('Selector.exists evaluates in isolated session inside t2.run()', () => {
            return runTests('testcafe-fixtures/t2-run-test.js', 'Selector.exists evaluates in isolated session inside t2.run()', { only: 'chrome' });
        });

        it('Selector.visible evaluates in isolated session inside t2.run()', () => {
            return runTests('testcafe-fixtures/t2-run-test.js', 'Selector.visible evaluates in isolated session inside t2.run()', { only: 'chrome' });
        });

        it('Selector.innerText evaluates in isolated session inside t2.run()', () => {
            return runTests('testcafe-fixtures/t2-run-test.js', 'Selector.innerText evaluates in isolated session inside t2.run()', { only: 'chrome' });
        });

        it('ClientFunction evaluates in isolated session inside t2.run()', () => {
            return runTests('testcafe-fixtures/t2-run-test.js', 'ClientFunction evaluates in isolated session inside t2.run()', { only: 'chrome' });
        });

        it('Actions inside t2.run() use t2 directly', () => {
            return runTests('testcafe-fixtures/t2-run-test.js', 'Actions inside t2.run() use t2 directly', { only: 'chrome' });
        });

        it('t2.run() restores main session after callback', () => {
            return runTests('testcafe-fixtures/t2-run-test.js', 't2.run() restores main session after callback', { only: 'chrome' });
        });

        it('Multiple t2.run() blocks in sequence', () => {
            return runTests('testcafe-fixtures/t2-run-test.js', 'Multiple t2.run() blocks in sequence', { only: 'chrome' });
        });

        it('t2 assertions after t2.run() still target the isolated session', () => {
            return runTests('testcafe-fixtures/t2-run-test.js', 't2 assertions after t2.run() still target the isolated session', { only: 'chrome' });
        });

        it('Chained calls inside t2.run()', () => {
            return runTests('testcafe-fixtures/t2-run-test.js', 'Chained calls inside t2.run()', { only: 'chrome' });
        });

        it('t2.run() waits for commands the callback did not await', () => {
            return runTests('testcafe-fixtures/t2-run-test.js', 't2.run() waits for commands the callback did not await', { only: 'chrome' });
        });

        it('Selector property read inside t2.run() waits for a late element', () => {
            return runTests('testcafe-fixtures/t2-run-test.js', 'Selector property read inside t2.run() waits for a late element', { only: 'chrome' });
        });
    });

    describe('Actions', () => {
        it('rightClick with modifiers', () => {
            return runTests('testcafe-fixtures/actions-test.js', 'rightClick with modifiers', { only: 'chrome' });
        });

        it('drag by offset', () => {
            return runTests('testcafe-fixtures/actions-test.js', 'drag by offset', { only: 'chrome' });
        });

        it('dragToElement', () => {
            return runTests('testcafe-fixtures/actions-test.js', 'dragToElement', { only: 'chrome' });
        });

        it('selectText in an input', () => {
            return runTests('testcafe-fixtures/actions-test.js', 'selectText in an input', { only: 'chrome' });
        });

        it('selectText in a contenteditable honors start and end', () => {
            return runTests('testcafe-fixtures/actions-test.js', 'selectText in a contenteditable honors start and end', { only: 'chrome' });
        });

        it('setWindowBounds', () => {
            return runTests('testcafe-fixtures/actions-test.js', 'setWindowBounds', { only: 'chrome' });
        });

        it('scroll positions and element scrolling', () => {
            return runTests('testcafe-fixtures/actions-test.js', 'scroll positions and element scrolling', { only: 'chrome' });
        });

        it('navigateTo a failing URL throws', () => {
            return runTests('testcafe-fixtures/actions-test.js', 'navigateTo a failing URL throws', { only: 'chrome' });
        });

        it('element-taking commands wait for late elements', () => {
            return runTests('testcafe-fixtures/actions-test.js', 'element-taking commands wait for late elements', { only: 'chrome', selectorTimeout: 3000 });
        });

        it('typeText types at the end of the existing value', () => {
            return runTests('testcafe-fixtures/actions-test.js', 'typeText types at the end of the existing value', { only: 'chrome' });
        });

        it('dispatchEvent builds the matching event type', () => {
            return runTests('testcafe-fixtures/actions-test.js', 'dispatchEvent builds the matching event type', { only: 'chrome' });
        });

        it('takeScreenshot with fullPage captures the whole page', () => {
            return runTests('testcafe-fixtures/actions-test.js', 'takeScreenshot with fullPage captures the whole page', { only: 'chrome' });
        });

        it('takeElementScreenshot of an element taller than the viewport', () => {
            return runTests('testcafe-fixtures/actions-test.js', 'takeElementScreenshot of an element taller than the viewport', { only: 'chrome' });
        });

        it('native alert and confirm are dismissed and fail the command', () => {
            return runTests('testcafe-fixtures/actions-test.js', 'native alert and confirm are dismissed and fail the command', { only: 'chrome' });
        });

        it('ClientFunction arguments inside t2.run()', () => {
            return runTests('testcafe-fixtures/actions-test.js', 'ClientFunction arguments inside t2.run()', { only: 'chrome' });
        });

        it('ClientFunction bound to t2', () => {
            return runTests('testcafe-fixtures/actions-test.js', 'ClientFunction bound to t2', { only: 'chrome' });
        });

        it('ClientFunction and t2.eval dependencies', () => {
            return runTests('testcafe-fixtures/actions-test.js', 'ClientFunction and t2.eval dependencies', { only: 'chrome' });
        });
    });

    describe('Cookies API', () => {
        it('Cookies set via document.cookie are isolated', () => {
            return runTests('testcafe-fixtures/cookies-test.js', 'Cookies set via document.cookie are isolated', { only: 'chrome' });
        });

        it('getCookies returns cookies from isolated session', () => {
            return runTests('testcafe-fixtures/cookies-test.js', 'getCookies returns cookies from isolated session', { only: 'chrome' });
        });

        it('deleteCookies clears isolated session cookies', () => {
            return runTests('testcafe-fixtures/cookies-test.js', 'deleteCookies clears isolated session cookies', { only: 'chrome' });
        });

        it('cookies API set, get, delete', () => {
            return runTests('testcafe-fixtures/cookies-test.js', 'cookies API set, get, delete', { only: 'chrome' });
        });

        it('cookie expires is respected', () => {
            return runTests('testcafe-fixtures/cookies-test.js', 'cookie expires is respected', { only: 'chrome' });
        });
    });

    describe('Iframe Support', () => {
        it('switchToIframe and eval inside iframe', () => {
            return runTests('testcafe-fixtures/iframe-test.js', 'switchToIframe and eval inside iframe', { only: 'chrome' });
        });

        it('switchToIframe and interact via eval', () => {
            return runTests('testcafe-fixtures/iframe-test.js', 'switchToIframe and interact via eval', { only: 'chrome' });
        });

        it('switchToMainWindow after iframe', () => {
            return runTests('testcafe-fixtures/iframe-test.js', 'switchToMainWindow after iframe', { only: 'chrome' });
        });

        it('navigateTo after switchToIframe resets the eval context', () => {
            return runTests('testcafe-fixtures/iframe-test.js', 'navigateTo after switchToIframe resets the eval context', { only: 'chrome' });
        });

        it('switchToIframe with a Selector object', () => {
            return runTests('testcafe-fixtures/iframe-test.js', 'switchToIframe with a Selector object', { only: 'chrome' });
        });

        it('switchToIframe with Selector nth picks that iframe', () => {
            return runTests('testcafe-fixtures/iframe-test.js', 'switchToIframe with Selector nth picks that iframe', { only: 'chrome' });
        });

        it('switchToIframe with an attribute selector and a nested iframe', () => {
            return runTests('testcafe-fixtures/iframe-test.js', 'switchToIframe with an attribute selector and a nested iframe', { only: 'chrome' });
        });

        it('eval inside an iframe sees the page globals', () => {
            return runTests('testcafe-fixtures/iframe-test.js', 'eval inside an iframe sees the page globals', { only: 'chrome' });
        });

        it('click and typeText inside an iframe', () => {
            return runTests('testcafe-fixtures/iframe-test.js', 'click and typeText inside an iframe', { only: 'chrome' });
        });
    });

    describe('Screenshots', () => {
        it('takeScreenshot', () => {
            return runTests('testcafe-fixtures/screenshot-test.js', 'takeScreenshot', { only: 'chrome' });
        });

        it('takeElementScreenshot', () => {
            return runTests('testcafe-fixtures/screenshot-test.js', 'takeElementScreenshot', { only: 'chrome' });
        });
    });

    describe('File Upload', () => {
        it('setFilesToUpload', () => {
            return runTests('testcafe-fixtures/file-upload-test.js', 'setFilesToUpload', { only: 'chrome' });
        });
    });

    describe('Roles', () => {
        it('useRole applies cookies and storage to isolated session', () => {
            return runTests('testcafe-fixtures/role-test.js', 'useRole applies cookies and storage to isolated session', { only: 'chrome' });
        });
    });

    describe('HTTP Auth', () => {
        it('setHttpAuth attaches basic auth credentials', () => {
            return runTests('testcafe-fixtures/http-auth-test.js', 'setHttpAuth attaches basic auth credentials', { only: 'chrome' });
        });
    });

    describe('Window Management', () => {
        it('maximizeWindow', () => {
            return runTests('testcafe-fixtures/window-management-test.js', 'maximizeWindow', { only: 'chrome' });
        });

        it('resizeWindow', () => {
            return runTests('testcafe-fixtures/window-management-test.js', 'resizeWindow', { only: 'chrome' });
        });

        it('setPageLoadTimeout', () => {
            return runTests('testcafe-fixtures/window-management-test.js', 'setPageLoadTimeout', { only: 'chrome' });
        });
    });
});
