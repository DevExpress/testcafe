const ScriptExecutionBarrier = window.getTestCafeModule('ScriptExecutionBarrier');

QUnit.testStart(function () {
    window.scriptExecuted     = false;
    window.stopAppending      = false;
    window.appendCustomScript = null;
});

$(document).ready(function () {
    module('script execution barrier', function () {
        asyncTest('should wait while added script is loaded and executed', function () {
            const barrier       = new ScriptExecutionBarrier();
            const script        = document.createElement('script');
            const scriptContent = encodeURIComponent('window.scriptExecuted=true;');

            script.src = '/xhr-test/500?expectedResponse=' + scriptContent;
            document.body.appendChild(script);

            barrier.SCRIPT_LOADING_TIMEOUT = 2000;
            barrier.BARRIER_TIMEOUT        = 2000;

            barrier
                .wait()
                .then(function () {
                    ok(window.scriptExecuted);
                    start();
                });
        });

        asyncTest('should not wait if the script is loading too much time', function () {
            const barrier       = new ScriptExecutionBarrier();
            const script        = document.createElement('script');
            const scriptContent = encodeURIComponent('window.scriptExecuted=true');

            script.src           = '/xhr-test/500?expectedResponse=' + scriptContent;
            script.style.display = 'none';

            barrier.SCRIPT_LOADING_TIMEOUT = 50;
            barrier.BARRIER_TIMEOUT        = 2000;

            document.body.appendChild(script);

            barrier
                .wait()
                .then(function () {
                    ok(!window.scriptExecuted);
                    start();
                });
        });

        asyncTest("should not wait if the script can't be loaded or it's without src", function () {
            const barrier              = new ScriptExecutionBarrier();
            const scriptWithInvalidSrc = document.createElement('script');
            const scriptWithoutSrc     = document.createElement('script');
            const scriptWithEmptySrc   = document.createElement('script');

            scriptWithInvalidSrc.id = 'scriptWithInvalidSrc';
            scriptWithoutSrc.id     = 'scriptWithoutSrc';
            scriptWithEmptySrc.id   = 'scriptWithEmptySrc';

            scriptWithInvalidSrc.src             = 'failure';
            scriptWithEmptySrc.attributes['src'] = '';

            document.body.appendChild(scriptWithInvalidSrc);
            document.body.appendChild(scriptWithoutSrc);
            document.body.appendChild(scriptWithEmptySrc);

            const startTime = Date.now();

            barrier.SCRIPT_LOADING_TIMEOUT = 2000;
            barrier.BARRIER_TIMEOUT        = 2000;

            barrier
                .wait()
                .then(function () {
                    const waitingTime = Date.now() - startTime;

                    ok(waitingTime < 500, 'waiting time is ' + waitingTime);
                    start();
                });
        });

        asyncTest('should not wait if scripts are added recursively', function () {
            const barrier = new ScriptExecutionBarrier();

            let scriptCounter = 0;

            window.stopAppending      = false;
            window.appendCustomScript = function () {
                const script        = document.createElement('script');
                const scriptContent = encodeURIComponent('if(!window.stopAppending)window.appendCustomScript()');

                // HACK: we should request different URLs to avoid caching of response in IE 10
                script.src = '/xhr-test/' + scriptCounter + '?expectedResponse=' + scriptContent;
                scriptCounter++;

                document.body.appendChild(script);
            };

            barrier.SCRIPT_LOADING_TIMEOUT = 500;
            barrier.BARRIER_TIMEOUT        = 500;

            window.appendCustomScript();

            barrier
                .wait()
                .then(function () {
                    window.stopAppending = true;

                    // NOTE: if barrier timeout doesn't work test fails with timeout
                    expect(0);
                    start();
                });
        });
    });

});
