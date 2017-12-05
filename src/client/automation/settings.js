const ACTION_STEP_DELAY_DEFAULT   = 10;
const MAX_MOUSE_ACTION_STEP_DELAY = 400;
const MAX_KEY_ACTION_STEP_DELAY   = 200;

// We use an exponential function to calculate the cursor
// speed according to general test speed
// cursorSpeed = (maxSpeed * k) ^ speed / k
const MAX_CURSOR_SPEED   = 100; // pixels/ms
const MAX_DRAGGING_SPEED = 4; // pixels/ms
const CURSOR_FACTOR      = 4;


export default class AutomationSettings {
    constructor (speed) {
        this.speedFactor = speed || 1;
    }

    get mouseActionStepDelay () {
        return this.speedFactor === 1 ? ACTION_STEP_DELAY_DEFAULT : (1 - this.speedFactor) * MAX_MOUSE_ACTION_STEP_DELAY;
    }

    get keyActionStepDelay () {
        return this.speedFactor === 1 ? ACTION_STEP_DELAY_DEFAULT : (1 - this.speedFactor) * MAX_KEY_ACTION_STEP_DELAY;
    }

    get cursorSpeed () {
        return Math.pow(MAX_CURSOR_SPEED * CURSOR_FACTOR, this.speedFactor) / CURSOR_FACTOR;
    }

    get draggingSpeed () {
        return Math.pow(MAX_DRAGGING_SPEED * CURSOR_FACTOR, this.speedFactor) / CURSOR_FACTOR;
    }
}
