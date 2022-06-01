import { Debugger } from 'debug';

function createSafeListener (ctx: unknown, listener: Function, debugLogger: Debugger): Function {
    return async (...args: []) => {
        try {
            return await listener.apply(ctx, args);
        }
        catch (error) {
            if (error instanceof Error)
                debugLogger(listener && listener.name, error);

            return void 0;
        }
    };
}

export default createSafeListener;
