const SPINNER_WIDTH                  = 8;
const RELATED_SPINNER_SIZE           = 0.8;
const MAXIMUM_SPINNER_SIZE           = 400;
const ROTATION_ANGLE                 = 7;
const FONT_SIZE_EQUATION_SLOPE       = 0.03;
const FONT_SIZE_EQUATION_Y_INTERCEPT = 3.5;
const START_GRADIENT_POINT_OFFSET    = { x: 0.75, y: 0.7 };
const END_GRADIENT_POINT_OFFSET      = { x: 1.025, y: 0.575 };

const LINE_HEIGHT_INDENT = 6;

const CONNECTED_SPINNER_COLOR    = '#28687F';
const DISCONNECTED_SPINNER_COLOR = '#882E24';
const SPINNER_GRADIENT_COLOR     = '#181818';

const CONNECTED_TEXT    = 'CONNECTED';
const DISCONNECTED_TEXT = 'DISCONNECTED';

const PAGE_BACKGROUND_CLASS_NAME    = 'page-background';
const CONTAINER_CLASS_NAME          = 'container';
const USER_AGENT_ELEMENT_CLASS_NAME = 'user-agent';
const STATUS_ELEMENT_CLASS_NAME     = 'status';
const CANVAS_CLASS_NAME             = 'spinner';

const CONNECTED_CLASS_NAME    = 'connected';
const DISCONNECTED_CLASS_NAME = 'disconnected';

const ANIMATION_DELAY = 30;


//Utils
function convertToRadian (angle) {
    return angle * Math.PI / 180;
}

function convertToString (value) {
    return value + 'px';
}

function rotateAxes (point, rotationAngle) {
    var angle = convertToRadian(rotationAngle);

    return {
        x: Math.round(point.x * Math.cos(angle) - point.y * Math.sin(angle)),
        y: Math.round(point.x * Math.sin(angle) + point.y * Math.cos(angle))
    };
}

function moveAxes (point, distance) {
    return {
        x: Math.round(point.x - distance),
        y: Math.round(point.y - distance)
    };
}

export default class StatusIndicator {
    constructor () {
        this.connected     = true;
        this.canvas        = document.getElementsByClassName(CANVAS_CLASS_NAME)[0];
        this.canvasContext = this.canvas.getContext('2d');

        this.spinnerAnimationInterval = null;
        this.rotationAngle            = 0;
        this.size                     = null;
        this.spinnerCenter            = null;
        this.gradient                 = null;

        this._setSize();
        this._setFontSize();
        this._setSpinnerGradient();

        StatusIndicator._createStatusMessage(this.connected);
        StatusIndicator._alignContainerVertically();

        this._drawSpinner(this.connected, 0);
        this._watchWindowResize();
    }


    //Markup
    static _getContainer () {
        return document.getElementsByClassName(CONTAINER_CLASS_NAME)[0];
    }

    static _getStatusElementSpan () {
        return document.getElementsByClassName(STATUS_ELEMENT_CLASS_NAME)[0].children[0];
    }

    static _createStatusMessage (connected) {
        var statusSpan = StatusIndicator._getStatusElementSpan();

        statusSpan.className   = connected ? CONNECTED_CLASS_NAME : DISCONNECTED_CLASS_NAME;
        statusSpan.textContent = connected ? CONNECTED_TEXT : DISCONNECTED_TEXT;
    }

    static _alignContainerVertically () {
        var background = document.getElementsByClassName(PAGE_BACKGROUND_CLASS_NAME)[0];
        var container  = StatusIndicator._getContainer();

        var topMargin = Math.ceil((background.offsetHeight - container.offsetHeight) / 2);

        if (topMargin > 0)
            container.style.marginTop = convertToString(topMargin);
    }


    _setSize () {
        var documentElement = window.document.documentElement;
        var minResolution   = Math.min(documentElement.clientWidth, documentElement.clientHeight);
        var container       = StatusIndicator._getContainer();
        var newSize         = Math.round(Math.min(MAXIMUM_SPINNER_SIZE, minResolution * RELATED_SPINNER_SIZE));

        if (newSize === this.size)
            return;

        this.size          = Math.round(Math.min(MAXIMUM_SPINNER_SIZE, minResolution * RELATED_SPINNER_SIZE));
        this.spinnerCenter = this.size / 2;

        container.style.width  = convertToString(this.size);
        container.style.height = convertToString(this.size);

        this.canvas.width = this.canvas.height = this.size;
    }

    _setFontSize () {
        var userAgentSpan = document.getElementsByClassName(USER_AGENT_ELEMENT_CLASS_NAME)[0].children[0];
        var statusSpan    = StatusIndicator._getStatusElementSpan();

        // NOTE: We have established proportions for two edge cases:
        // the maximum spinner size of 400px corresponds to the 16px font,
        // the minimum spinner size of 240px corresponds to the 11px font.
        // Actual sizes are calculated from these proportions.
        var fontSize   = Math.round(FONT_SIZE_EQUATION_SLOPE * this.size + FONT_SIZE_EQUATION_Y_INTERCEPT);
        var lineHeight = fontSize + LINE_HEIGHT_INDENT;

        userAgentSpan.style.fontSize   = convertToString(fontSize);
        userAgentSpan.style.lineHeight = convertToString(lineHeight);
        userAgentSpan.style.maxHeight  = convertToString(2 * lineHeight);

        statusSpan.style.fontSize   = convertToString(fontSize);
        statusSpan.style.lineHeight = convertToString(lineHeight - 1);
    }

    _watchWindowResize () {
        window.onresize = () => {
            var oldSize = this.size;

            this._setSize();
            this._setFontSize();

            StatusIndicator._alignContainerVertically();

            if (oldSize !== this.size) {
                if (this.connected)
                    this._setSpinnerGradient();

                this._drawSpinner(this.connected, this.rotationAngle);
            }
        };
    }


    //Spinner
    _drawSpinner (connected, startAngle) {
        this._clearCanvas();
        clearInterval(this.spinnerAnimationInterval);

        if (connected) {
            this.spinnerAnimationInterval = window.setInterval(() => {
                this._clearCanvas();
                this._rotateSpinner();
                this._drawCircle(this.gradient, 240, startAngle);
            }, ANIMATION_DELAY);

            this._drawCircle(this.gradient, 240, startAngle);
        }
        else
            this._drawCircle(DISCONNECTED_SPINNER_COLOR, 360, 0);
    }

    _drawCircle (strokeStyle, centralAngle, startAngle) {
        var radius = this.spinnerCenter - SPINNER_WIDTH / 2;

        this.canvasContext.beginPath();

        this.canvasContext.lineWidth   = SPINNER_WIDTH;
        this.canvasContext.strokeStyle = strokeStyle;

        this.canvasContext.arc(this.spinnerCenter, this.spinnerCenter, radius,
            convertToRadian(startAngle), convertToRadian(startAngle + centralAngle), false);

        this.canvasContext.stroke();
    }

    _rotateSpinner () {
        this.rotationAngle += ROTATION_ANGLE;

        this.rotationAngle = this.rotationAngle > 360 ? this.rotationAngle % 360 : this.rotationAngle;

        this.canvasContext.translate(this.spinnerCenter, this.spinnerCenter);
        this.canvasContext.rotate(convertToRadian(ROTATION_ANGLE));
        this.canvasContext.translate(-this.spinnerCenter, -this.spinnerCenter);
    }

    _getRotatedGradientPoints (point) {
        var changedPoint = moveAxes(point, this.spinnerCenter);

        changedPoint = rotateAxes(changedPoint, this.rotationAngle);
        changedPoint = moveAxes(changedPoint, -this.spinnerCenter);

        return changedPoint;
    }

    _setSpinnerGradient () {
        var startGradientPoint = {
            x: Math.round(this.size * START_GRADIENT_POINT_OFFSET.x),
            y: Math.round(this.size * START_GRADIENT_POINT_OFFSET.y)
        };

        var endGradientPoint = {
            x: Math.round(this.size * END_GRADIENT_POINT_OFFSET.x),
            y: Math.round(this.size * END_GRADIENT_POINT_OFFSET.y)
        };

        if (this.rotationAngle !== 0) {
            startGradientPoint = this._getRotatedGradientPoints(startGradientPoint);
            endGradientPoint   = this._getRotatedGradientPoints(endGradientPoint);
        }

        var gradient = this.canvasContext.createLinearGradient(startGradientPoint.x, startGradientPoint.y,
            endGradientPoint.x, endGradientPoint.y);

        gradient.addColorStop(0, CONNECTED_SPINNER_COLOR);
        gradient.addColorStop(1, SPINNER_GRADIENT_COLOR);

        this.gradient = gradient;
    }


    _clearCanvas () {
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    //API
    showDisconnection () {
        this.connected = false;
        StatusIndicator._createStatusMessage(this.connected);
        this._drawSpinner(this.connected, 0);
    }
}
