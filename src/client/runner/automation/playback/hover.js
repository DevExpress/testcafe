import testCafeCore from '../../deps/testcafe-core';
import * as automationSettings from '../settings';
import * as automationUtil from '../util';
import MoveAutomation from '../playback/move';
import MoveOptions from '../options/move';

var SETTINGS      = testCafeCore.SETTINGS;
var positionUtils = testCafeCore.positionUtils;


export default function (element, options, callback) {
    if (SETTINGS.get().RECORDING && !SETTINGS.get().PLAYBACK && !positionUtils.isElementVisible(element)) {
        window.setTimeout(callback, automationSettings.ACTION_STEP_DELAY);
        return;
    }

    var offsets = automationUtil.getDefaultAutomationOffsets(element);

    var modifiers = {
        ctrl:  options.ctrl,
        shift: options.shift,
        alt:   options.alt,
        meta:  options.meta
    };

    if (typeof options.offsetX === 'number')
        offsets.offsetX = Math.round(options.offsetX);
    if (typeof options.offsetY === 'number')
        offsets.offsetY = Math.round(options.offsetY);

    var moveOptions = new MoveOptions();

    moveOptions.offsetX   = offsets.offsetX;
    moveOptions.offsetY   = offsets.offsetY;
    moveOptions.modifiers = modifiers;

    var moveAutomation = new MoveAutomation(element, moveOptions);

    moveAutomation
        .run()
        .then(callback);
};
