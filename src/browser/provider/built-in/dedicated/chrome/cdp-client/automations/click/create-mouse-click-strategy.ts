import { MouseEventArgs } from '../../../../../../../../shared/actions/automations/visible-element-automation';
import { MouseClickStrategyBase } from '../../../../../../../../shared/actions/automations/click/mouse-click-strategy-base';

class CDPMouseClickStategy<E> extends MouseClickStrategyBase<E> {
    public constructor () {
        super();
    }

    public async mousedown (options: MouseEventArgs<E>): Promise<void> { // eslint-disable-line
    }

    public async mouseup (element: E, options: MouseEventArgs<E>): Promise<MouseEventArgs<E>> { // eslint-disable-line
        return options;
    }
}

export default function createMouseClickStrategy<E> (): MouseClickStrategyBase<E> {
    return new CDPMouseClickStategy<E>();
}
