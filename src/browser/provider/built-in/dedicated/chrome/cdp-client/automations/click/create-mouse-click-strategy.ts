import { MouseEventArgs } from '../../../../../../../../shared/actions/automations/visible-element-automation';
import { MouseClickStrategyBase } from '../../../../../../../../shared/actions/automations/click/mouse-click-strategy-base';
import * as clientsManager from '../../clients-manager';

const BUTTON = 'left';
const CLICK_COUNT = 1;

class CDPMouseClickStategy<E> extends MouseClickStrategyBase<E> {
    public constructor () {
        super();
    }

    public async mousedown (options: MouseEventArgs<E>): Promise<void> {
        const { Input } = clientsManager.getClient();

        await Input.dispatchMouseEvent({
            type:       'mousePressed',
            x:          options.point?.x || -1,
            y:          options.point?.y || -1,
            button:     BUTTON,
            clickCount: CLICK_COUNT,
        });
    }

    public async mouseup (element: E, options: MouseEventArgs<E>): Promise<MouseEventArgs<E>> {
        const { Input } = clientsManager.getClient();

        await Input.dispatchMouseEvent({
            type:       'mouseReleased',
            x:          options.point?.x || -1,
            y:          options.point?.y || -1,
            button:     BUTTON,
            clickCount: CLICK_COUNT,
        });

        return options;
    }
}

export default function createMouseClickStrategy<E> (): MouseClickStrategyBase<E> {
    return new CDPMouseClickStategy<E>();
}
