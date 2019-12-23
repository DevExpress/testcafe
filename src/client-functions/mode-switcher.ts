import isREPL from '../utils/is-repl';


export default {
    forcedSyncMode: false as boolean | undefined,

    get syncMode (): boolean {
        if (this.forcedSyncMode !== void 0)
            return this.forcedSyncMode;

        return isREPL();
    }
};
