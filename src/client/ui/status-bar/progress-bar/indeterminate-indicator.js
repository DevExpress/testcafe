import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';

const shadowUI      = hammerhead.shadowUI;
const nativeMethods = hammerhead.nativeMethods;

const styleUtils    = testCafeCore.styleUtils;
const positionUtils = testCafeCore.positionUtils;


const FIRST_VALUE_ANIMATION_OPTIONS = {
    time:                      2800,
    points:                    [0.815, 0.395],
    positionByCompletePercent: {
        0:   { left: -35, right: 100 },
        0.6: { left: 100, right: -90 },
        1:   { left: 100, right: -90 }
    }
};

const SECOND_VALUE_ANIMATION_OPTIONS = {
    time:                      3000,
    points:                    [0.84, 1],
    positionByCompletePercent: {
        0:   { left: -200, right: 100 },
        0.6: { left: 107, right: -8 },
        1:   { left: 107, right: -8 }
    }
};

const SECOND_VALUE_ELEMENT_ANIMATION_DELAY = 1000;
const ANIMATION_UPDATE_INTERVAL            = 10;
const ANIMATION_RESTART_INTERVAL           = 1950;
const ANIMATION_PERCENTS                   = {
    start:  0,
    middle: 0.6,
    end:    1
};

const INDETERMINATE_STYLE_CLASS = 'indeterminate';


//Utils
// NOTE: we use Bezier curves to establish a correspondence between
// time and the animation percent. The curve we build by two point.
function getCompletePercent (time, y1, y2) {
    return 3 * Math.pow(1 - time, 2) * time * y1 + 3 * (1 - time) * time * time * y2 + time * time * time;
}

function getNewPosition (completePercent, positions) {
    const isFirstAnimationPart = completePercent < ANIMATION_PERCENTS.middle;
    const startPercent         = isFirstAnimationPart ? ANIMATION_PERCENTS.start : ANIMATION_PERCENTS.middle;
    const endPercent           = isFirstAnimationPart ? ANIMATION_PERCENTS.middle : ANIMATION_PERCENTS.end;
    const startPosition        = positions[startPercent];
    const endPosition          = positions[endPercent];
    let startPoint           = { x: startPercent, y: startPosition.left };
    let endPoint             = { x: endPercent, y: endPosition.left };

    const left = positionUtils.getLineYByXCoord(startPoint, endPoint, completePercent);

    startPoint = { x: startPercent, y: startPosition.right };
    endPoint   = { x: endPercent, y: endPosition.right };

    const right = positionUtils.getLineYByXCoord(startPoint, endPoint, completePercent);

    return { left, right };
}

export default class IndeterminateIndicator {
    constructor (progressBar, firstValue, secondValue) {
        this.progressBar = progressBar;
        this.firstValue  = firstValue;
        this.secondValue = secondValue;

        this.animationInterval            = null;
        this.secondValueAnimationInterval = null;
        this.secondValueAnimationTimeout  = null;
        this.restartAnimationTimeout      = null;
    }

    static _updateValueAnimation (startTime, valueElement, animationOptions) {
        const animationTime   = animationOptions.time;
        const animationPoints = animationOptions.points;
        const positions       = animationOptions.positionByCompletePercent;
        const currentTime     = nativeMethods.dateNow() - startTime;
        const timePercent     = currentTime / animationTime;

        const completePercent = getCompletePercent(timePercent, animationPoints[0], animationPoints[1]);
        const { left, right } = getNewPosition(completePercent, positions);

        styleUtils.set(valueElement, 'left', Math.round(left) + '%');
        styleUtils.set(valueElement, 'right', Math.round(right) + '%');
    }

    _clearFirstValueAnimation () {
        if (this.animationInterval) {
            nativeMethods.clearInterval.call(window, this.animationInterval);
            this.animationInterval = null;
        }

        styleUtils.set(this.firstValue, 'left', '-35%');
        styleUtils.set(this.firstValue, 'right', '100%');
    }

    _clearSecondValueAnimation () {
        if (this.secondValueAnimationInterval) {
            nativeMethods.clearInterval.call(window, this.secondValueAnimationInterval);
            this.secondValueAnimationInterval = null;
        }

        styleUtils.set(this.secondValue, 'left', '-200%');
        styleUtils.set(this.secondValue, 'right', '100%');
    }

    _startFirstValueAnimation () {
        this._clearFirstValueAnimation();

        const startTime = nativeMethods.dateNow();

        this.animationInterval = nativeMethods.setInterval.call(window, () => {
            IndeterminateIndicator._updateValueAnimation(startTime, this.firstValue, FIRST_VALUE_ANIMATION_OPTIONS);
        }, ANIMATION_UPDATE_INTERVAL);
    }

    _startSecondValueAnimation () {
        this._clearSecondValueAnimation();

        const startTime = nativeMethods.dateNow();

        this.secondValueAnimationInterval = nativeMethods.setInterval.call(window, () => {
            IndeterminateIndicator._updateValueAnimation(startTime, this.secondValue, SECOND_VALUE_ANIMATION_OPTIONS);
        }, ANIMATION_UPDATE_INTERVAL);
    }

    _startAnimation () {
        this._startFirstValueAnimation();

        this.secondValueAnimationTimeout = nativeMethods.setTimeout.call(window, () => this._startSecondValueAnimation(), SECOND_VALUE_ELEMENT_ANIMATION_DELAY);
        this.restartAnimationTimeout     = nativeMethods.setTimeout.call(window, () => this._startAnimation(), ANIMATION_RESTART_INTERVAL);
    }

    _stopAnimation () {
        this._clearFirstValueAnimation();
        this._clearSecondValueAnimation();

        if (this.secondValueAnimationTimeout) {
            nativeMethods.clearInterval.call(window, this.secondValueAnimationTimeout);
            this.secondValueAnimationTimeout = null;
        }

        if (this.restartAnimationTimeout) {
            nativeMethods.clearInterval.call(window, this.restartAnimationTimeout);
            this.restartAnimationTimeout = null;
        }
    }

    start () {
        shadowUI.addClass(this.progressBar, INDETERMINATE_STYLE_CLASS);

        this._startAnimation();
    }

    stop () {
        shadowUI.removeClass(this.progressBar, INDETERMINATE_STYLE_CLASS);

        this._stopAnimation();
    }
}
