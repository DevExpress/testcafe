import testCafeCore from '../../deps/testcafe-core';
import * as automationSettings from '../settings';
import movePlaybackAutomation from '../playback/move';

var SETTINGS      = testCafeCore.SETTINGS;
var positionUtils = testCafeCore.positionUtils;


export default function (element, options, callback) {
    if (SETTINGS.get().RECORDING && !SETTINGS.get().PLAYBACK && !positionUtils.isElementVisible(element)) {
        window.setTimeout(callback, automationSettings.ACTION_STEP_DELAY);
        return;
    }

    if (options.offsetX)
        options.offsetX = Math.round(options.offsetX);
    if (options.offsetY)
        options.offsetY = Math.round(options.offsetY);

    movePlaybackAutomation(element, false, options, callback);
};
