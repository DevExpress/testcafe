import { createElementFromDescriptor } from './utils/create-element-from-descriptor';
import { getRectInAbsoluteCoordinates } from './utils/get-rect-in-absolute-coordinates';
import { addToUiRoot, removeFromUiRoot } from './utils/ui-root';
import { setStyles } from './utils/set-styles';

import { elementFrame } from './descriptors';

class Higthlighter {
    targets = new Map();

    _remove (target, frame) {
        this.targets.delete(target);

        removeFromUiRoot(frame);
    }

    _setPosition (target, frame) {
        const rect   = getRectInAbsoluteCoordinates(target);
        const styles = {};

        for (const key of ['top', 'left', 'width', 'height'])
            styles[key] = rect[key] + 'px';

        setStyles(frame, styles);
    }

    highlight (target) {
        if (!target || this.targets.has(target))
            return;

        const frame = createElementFromDescriptor(elementFrame);

        this.targets.set(target, frame);

        this._setPosition(target, frame);

        addToUiRoot(frame);
    }

    stopHighlighting () {
        this.targets.forEach((frame, target) => this._remove(target, frame));
    }
}

export const highlighter = new Higthlighter();
