import ProtocolProxyApi from 'devtools-protocol/types/protocol-proxy-api';
import ProtocolApi = ProtocolProxyApi.ProtocolApi;


const EMPTY_CONTEXT = -1;

export default class ExecutionContext {
    public ctxId: number;
    public frameId: string;
    public parent: ExecutionContext | null;
    public children: ExecutionContext[] = [];

    public constructor (parent?: ExecutionContext, frameId = '', ctxId = EMPTY_CONTEXT) {
        this.ctxId  = ctxId;
        this.frameId = frameId;
        this.parent  = parent ?? this;
    }

    private _is (frameOrCtxId: string | number): boolean {
        return (typeof frameOrCtxId === 'string' ? this.frameId : this.ctxId) === frameOrCtxId;
    }

    public find (frameOrCtxId: string | number): ExecutionContext {
        if (this._is(frameOrCtxId))
            return this;

        const children = Array.from(this.children);
        let index      = 0;

        while (children[index]) {
            const child = children[index];

            if (child._is(frameOrCtxId))
                return child;

            if (child.children.length)
                children.push(...child.children);

            ++index;
        }

        return ExecutionContext.top;
    }

    private _add (frameId: string): ExecutionContext {
        const newCtx = new ExecutionContext(this, frameId);

        this.children.push(newCtx);

        return newCtx;
    }

    private _remove (): void {
        if (this === ExecutionContext._current)
            ExecutionContext._current = ExecutionContext.top;

        for (const child of this.children)
            child._remove();

        if (!this.parent || this.parent === this)
            return;

        this.parent.children.splice(this.parent.children.indexOf(this), 1);
        this.parent = null;
    }

    private _setContext (ctx: number): void {
        this.ctxId = ctx;
    }

    private _deleteContext (): void {
        this.ctxId = EMPTY_CONTEXT;
    }

    private _clearAll (): void {
        ExecutionContext._current = ExecutionContext.top;

        this.frameId = '';
        this.ctxId   = EMPTY_CONTEXT;

        this._remove();
    }

    private static _current = new ExecutionContext();
    public static readonly top = ExecutionContext._current;

    public static initialize ({ Runtime, Page }: ProtocolApi): void {
        Page.on('frameAttached', ({ frameId, parentFrameId }) => {
            ExecutionContext.top.find(parentFrameId)._add(frameId);
        });
        Page.on('frameDetached', ({ frameId }) => ExecutionContext.top.find(frameId)._remove());
        Runtime.on('executionContextsCleared', () => ExecutionContext.top._clearAll());
        Runtime.on('executionContextDestroyed', ({ executionContextId }) =>
            ExecutionContext.top.find(executionContextId)._deleteContext());

        Runtime.on('executionContextCreated', ({ context }) => {
            if (!context.auxData || !context.auxData.frameId || !context.auxData.isDefault)
                return;

            if (!ExecutionContext.top.frameId)
                ExecutionContext.top.frameId = context.auxData.frameId;

            ExecutionContext.top.find(context.auxData.frameId)._setContext(context.id);
        });
    }

    public static getCurrentContextId (): number {
        return ExecutionContext._current.ctxId;
    }

    public static switchToIframe (frameId: string): void {
        ExecutionContext._current = ExecutionContext.top.find(frameId);
    }

    public static switchToMainWindow (): void {
        ExecutionContext._current = ExecutionContext.top;
    }
}
