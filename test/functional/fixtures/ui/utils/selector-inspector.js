Object.assign(window, {
    isVisible (element) {
        return element.style.visibility !== 'hidden' && element.style.display !== 'none';
    },

    canBeShownInPicking (element) {
        return [
            'element-frame-hammerhead-shadow-ui',
            'tooltip-hammerhead-shadow-ui',
            'arrow-hammerhead-shadow-ui',
        ].includes(element.className);
    },

    isElementsRectsEql (firstElement, secondElement) {
        const firstRect  = firstElement.getBoundingClientRect();
        const secondRect = secondElement.getBoundingClientRect();

        for (const key in firstElement) {
            if (firstRect[key] !== secondRect[key])
                return false;
        }

        return true;
    },

    getSelectedValue () {
        const { nativeMethods } = window['%hammerhead%'];

        const activeElement = nativeMethods.documentActiveElementGetter.call(document);

        return activeElement.value.substring(activeElement.selectionStart, activeElement.selectionend);
    },

    simulateEvent (element, eventName, options) {
        const { eventSandbox } = window['%hammerhead%'];

        eventSandbox.eventSimulator[eventName](element, options);
    },

    click (element) {
        this.simulateEvent(element, 'click');
    },

    mousedown (element) {
        this.simulateEvent(element, 'mousedown');
    },

    mousemove (element) {
        const { x, y } = element.getBoundingClientRect();

        this.simulateEvent(element, 'mousemove', { clientX: x + 1, clientY: y + 1 });
    },

    input (element, value) {
        this.simulateEvent(element, 'input', value);
    },

    focus (element) {
        this.simulateEvent(element, 'focus');
    },

    getShadowUIElements () {
        return window['%hammerhead%'].shadowUI.root.firstChild.children;
    },

    pickElement (element) {
        this.mousemove(element);
        this.click(element);
    },

    getGeneratedSelectors () {
        const { elementPicker } = window['%testCafeDriverInstance%'].selectorInspectorPanel;

        return elementPicker.actualSelectors.map(selector => selector.value);
    },

    querySelector (cssSelector, element = document) {
        const { nativeMethods } = window['%hammerhead%'];

        return nativeMethods.querySelector.call(element, cssSelector);
    },

    querySelectorAll (cssSelector, element = document) {
        const { nativeMethods } = window['%hammerhead%'];

        return nativeMethods.querySelectorAll.call(element, cssSelector);
    },

    async retryExecute (fn, retryTimeout = 80) {
        return new Promise(resolve => {
            const intervalId = setInterval(() => fn(result => {
                clearInterval(intervalId);
                resolve(result);
            }), retryTimeout);
        });
    },

    async getElement (cssSelector) {
        return this.retryExecute(resolve => {
            const element = this.querySelector(cssSelector);

            if (element)
                resolve(element);
        });
    },

    async getElements (cssSelector) {
        return this.retryExecute(resolve => {
            const elements = this.querySelectorAll(cssSelector);

            if (elements && elements.length)
                resolve(elements);
        });
    },

    async resumeTest () {
        const resumeButton = await this.getElement('.resume-hammerhead-shadow-ui');

        this.mousedown(resumeButton);
    },

    async startPicking () {
        const pickButton = await this.getElement('.pick-button-hammerhead-shadow-ui');

        this.click(pickButton);
    },

    async getSelectorInput () {
        return this.getElement('.selector-input-hammerhead-shadow-ui');
    },

    async getSelectorInputValue () {
        return this.getSelectorInput().then(input => input.value);
    },

    async typeSelector (value) {
        const selectorInput = await this.getSelectorInput();

        selectorInput.value = value;

        selectorInput.focus();
    },

    async getMatchIndicator () {
        return this.getElement('.match-indicator-hammerhead-shadow-ui');
    },

    async getMatchIndicatorInnerText () {
        return this.getMatchIndicator().then(indicator => indicator.innerText);
    },

    async expandSelectorsList () {
        const expandButton = await this.getElement('.expand-selector-list-hammerhead-shadow-ui');

        this.click(expandButton);
    },

    async getSelectorsList () {
        return this.getElement('.selectors-list-hammerhead-shadow-ui');
    },

    async getSelectorsListValues () {
        const selectorsList = await this.getSelectorsList();
        const values        = [];

        for (const selectorValueElement of selectorsList.children)
            values.push(selectorValueElement.innerText);

        return values;
    },

    async selectSelectorFromList (index) {
        await this.expandSelectorsList();

        const selectorsList        = await this.getSelectorsList();
        const selectorValueElement = selectorsList.children[index];

        this.click(selectorValueElement);
    },

    async getElementFrames () {
        const RENDERING_DELAY = 200;
        const CSS_SELECTOR    = '.element-frame-hammerhead-shadow-ui';

        await this.getElement(CSS_SELECTOR);

        await new Promise(resolve => setTimeout(resolve, RENDERING_DELAY));

        return this.querySelectorAll(CSS_SELECTOR);
    },

    async mockOnceCopyCommand () {
        const originExecCommand = document.execCommand;

        return new Promise(resolve => {
            document.execCommand = cmd => {
                if (cmd !== 'copy')
                    return originExecCommand.call(document, cmd);

                document.execCommand = originExecCommand;

                resolve(this.getSelectedValue());

                return document.execCommand(cmd);
            };
        });
    },

    async copySelector () {
        const copyButton = await this.getElement('input[value="Copy"]');

        const promise = this.mockOnceCopyCommand();

        this.click(copyButton);

        return promise;
    },
});
