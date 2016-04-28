import hammerhead from '../deps/hammerhead';
import DriverStatus from '../status';

var Promise = hammerhead.Promise;

const BABEL_PROMISE_RE = /_promise(\d+)\.default/;

function polyfillBabelArtifacts (fnCode) {
    var polyfill     = '';
    var promiseMatch = fnCode.match(BABEL_PROMISE_RE);

    if (promiseMatch)
        polyfill += `var _promise${promiseMatch[1]} = { default: Promise };`;

    return polyfill + fnCode;
}

export default function executeHybridFnCommand (command) {
    return Promise
        .resolve()
        .then(() => {
            return polyfillBabelArtifacts(command.fnCode);
        })
        .then(fnCode => {
            /* eslint-disable no-eval */
            return eval(fnCode);
            /* eslint-enable no-eval */
        })
        .then(fn => {
            return fn.apply(window, command.args);
        })
        .then(result => {
            return new DriverStatus({ isCommandResult: true, result });
        })
        .catch(err => {
            return new DriverStatus({ isCommandResult: true, result: err.message });
        });
}
