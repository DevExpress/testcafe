import testCafeCore from '../../deps/testcafe-core';
import testCafeUI from '../../deps/testcafe-ui';
import * as automationUtil from '../util';
import keyPressSimulator from './key-press-simulator';
import async from '../../deps/async';

var SETTINGS     = testCafeCore.SETTINGS;
var domUtils     = testCafeCore.domUtils;
var keyCharUtils = testCafeCore.keyCharUtils;

var selectElement = testCafeUI.selectElement;


export default function (keys, actionCallback) {
    var parsedKeys = keyCharUtils.parseKeysString(keys),
        commands   = parsedKeys.commands;

    async.forEachSeries(
        commands,
        function (command, callback) {
            //NOTE: in Mozilla prentDefault for 'keydown' and 'keypress' event in select element
            // does not affect on the appointment of the new selectedIndex
            //so we should process switching between options only on playback anf after change action
            if (domUtils.isSelectElement(domUtils.getActiveElement())) {
                if (!/enter|tab/.test(command) ||
                    ((!SETTINGS.get().RECORDING || SETTINGS.get().PLAYBACK) && /enter|tab/.test(command)))
                    selectElement.switchOptionsByKeys(command);
            }

            keyPressSimulator(command, function () {
                window.setTimeout(callback, automationUtil.ACTION_STEP_DELAY);
            });
        },
        function () {
            actionCallback();
        }
    );
};
