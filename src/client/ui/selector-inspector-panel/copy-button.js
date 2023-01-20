import hammerhead from './../deps/hammerhead';
import testCafeCore from './../deps/testcafe-core';

import { createElementFromDescriptor } from './utils/create-element-from-descriptor';
import { setStyles } from './utils/set-styles';
import { copy } from './utils/copy';

import * as descriptors from './descriptors';

const nativeMethods = hammerhead.nativeMethods;

const eventUtils = testCafeCore.eventUtils;

const ANIMATION_TIMEOUT = 1200;

const VALUES = {
    copy:   'Copy',
    copied: 'Copied!',
};

export class CopyButton {
    element;
    sourceElement;

    constructor (sourceElement) {
        this.element       = createElementFromDescriptor(descriptors.copyButton);
        this.sourceElement = sourceElement;

        eventUtils.bind(this.element, 'click', () => this._copySelector());
    }

    _copySelector () {
        // eslint-disable-next-line no-restricted-properties
        copy(this.sourceElement.value);

        this._animate();
    }

    _animate () {
        this._changeAppearance(VALUES.copied, 'bold');

        nativeMethods.setTimeout.call(window, () => this._resetAppearance(), ANIMATION_TIMEOUT);
    }

    _resetAppearance () {
        this._changeAppearance(VALUES.copy, '');
    }

    _changeAppearance (value, fontWeight) {
        nativeMethods.inputValueSetter.call(this.element, value);

        setStyles(this.element, { fontWeight });
    }
}
