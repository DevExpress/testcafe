import { MouseEventArgs } from '../visible-element-automation';

export abstract class MouseClickStrategyBase<E> {
    public constructor () {
    }

    public abstract mousedown (eventArgs: MouseEventArgs<E>): Promise<void>;

    public abstract mouseup (element: E, eventArgs: MouseEventArgs<E>): Promise<MouseEventArgs<E>>;
}

export class MouseClickStrategyEmpty extends MouseClickStrategyBase<number> {
    public constructor () {
        super();
    }

    public mousedown (): Promise<void> {
        throw new Error('not implemented');
    }

    public mouseup (): Promise<MouseEventArgs<number>> {
        throw new Error('not implemented');
    }
}
