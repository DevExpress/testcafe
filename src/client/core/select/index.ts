import hammerhead from '../deps/hammerhead';
import * as domUtils from '../utils/dom';
import * as styleUtils from '../utils/style';

const shadowUI      = hammerhead.shadowUI;
const nativeMethods = hammerhead.nativeMethods;

const OPTION_GROUP_CLASS = 'tcOptionGroup';
const OPTION_CLASS       = 'tcOption';
const DISABLED_CLASS     = 'disabled';


class SelectController {
    public currentEl: HTMLSelectElement | null;
    public optionList: HTMLElement | null;
    public groups: HTMLElement[];
    public options: HTMLElement[];

    constructor () {
        this.currentEl  = null;
        this.optionList = null;
        this.groups     = [];
        this.options    = [];
    }

    _createOption (realOption: HTMLOptionElement, parent: HTMLElement): void {
        const option           = document.createElement('div');
        const isOptionDisabled = realOption.disabled || domUtils.getTagName(realOption.parentElement) === 'optgroup' &&
                                                      (realOption.parentElement as HTMLOptGroupElement).disabled;

        // eslint-disable-next-line no-restricted-properties
        const text = domUtils.getTagName(realOption) === 'option' ? (realOption as HTMLOptionElement).text : '';

        nativeMethods.nodeTextContentSetter.call(option, text);

        parent.appendChild(option);
        shadowUI.addClass(option, OPTION_CLASS);

        if (isOptionDisabled) {
            shadowUI.addClass(option, DISABLED_CLASS);
            styleUtils.set(option, 'color', styleUtils.get(realOption, 'color'));
        }

        this.options.push(option);
    }

    _createGroup (realGroup: HTMLOptGroupElement, parent: HTMLElement): void {
        const group = document.createElement('div');

        nativeMethods.nodeTextContentSetter.call(group, realGroup.label || ' ');
        parent.appendChild(group);

        shadowUI.addClass(group, OPTION_GROUP_CLASS);

        if (realGroup.disabled) {
            shadowUI.addClass(group, DISABLED_CLASS);

            styleUtils.set(group, 'color', styleUtils.get(realGroup, 'color'));
        }

        this.createChildren(realGroup.children, group);

        this.groups.push(group);
    }

    clear (): void {
        this.optionList = null;
        this.currentEl  = null;
        this.options    = [];
        this.groups     = [];
    }

    createChildren (children: HTMLCollection, parent: HTMLElement): void {
        const childrenLength = domUtils.getChildrenLength(children);

        for (let i = 0; i < childrenLength; i++) {
            if (domUtils.isOptionElement(children[i]))
                this._createOption(children[i] as HTMLOptionElement, parent);
            else if (domUtils.getTagName(children[i]) === 'optgroup')
                this._createGroup(children[i] as HTMLOptGroupElement, parent);
        }
    }

    getEmulatedChildElement (element: HTMLElement): HTMLElement {
        const isGroup      = domUtils.getTagName(element) === 'optgroup';
        const elementIndex = isGroup ? domUtils.getElementIndexInParent(this.currentEl, element) :
            domUtils.getElementIndexInParent(this.currentEl, element);

        if (!isGroup)
            return this.options[elementIndex];

        return this.groups[elementIndex];
    }

    isOptionListExpanded (select: HTMLSelectElement): boolean {
        return select ? select === this.currentEl : !!this.currentEl;
    }

    isOptionElementVisible (el: HTMLElement): boolean {
        const parentSelect = domUtils.getSelectParent(el);

        if (!parentSelect)
            return true;

        const expanded        = this.isOptionListExpanded(parentSelect);
        const selectSizeValue = styleUtils.getSelectElementSize(parentSelect);

        return expanded || selectSizeValue > 1;
    }
}

export default new SelectController();
