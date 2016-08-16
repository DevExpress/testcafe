import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import DeterminateIndicator from './determinate-indicator';
import IndeterminateIndicator from './indeterminate-indicator';

var shadowUI   = hammerhead.shadowUI;
var styleUtils = testCafeCore.styleUtils;


const PROGRESS_BAR_CLASS = 'progress-bar';
const CONTAINER_CLASS    = 'value-container';
const VALUE_CLASS        = 'value';


export default class ProgressBar {
    constructor (containerElement) {
        this.progressBar        = null;
        this.firstValueElement  = null;
        this.secondValueElement = null;

        this._create(containerElement);

        this.determinateIndicator   = new DeterminateIndicator(this.progressBar, this.firstValueElement);
        this.indeterminateIndicator = new IndeterminateIndicator(this.progressBar, this.firstValueElement, this.secondValueElement);
    }

    _create (containerElement) {
        this.progressBar = document.createElement('div');
        shadowUI.addClass(this.progressBar, PROGRESS_BAR_CLASS);
        containerElement.appendChild(this.progressBar);

        var container = document.createElement('div');

        shadowUI.addClass(container, CONTAINER_CLASS);
        this.progressBar.appendChild(container);

        this.firstValueElement = document.createElement('div');
        shadowUI.addClass(this.firstValueElement, VALUE_CLASS);
        container.appendChild(this.firstValueElement);

        this.secondValueElement = document.createElement('div');
        shadowUI.addClass(this.secondValueElement, VALUE_CLASS);
        container.appendChild(this.secondValueElement);
    }

    show () {
        styleUtils.set(this.progressBar, 'visibility', 'visible');
    }

    hide () {
        styleUtils.set(this.progressBar, 'visibility', 'hidden');
    }
}
