import isREPL from '../utils/is-repl';


export default {
    forcedSyncMode: false,

    forceSync (): void {
        this.forcedSyncMode = true;
    },

    resetForcedSync (): void {
        this.forcedSyncMode = false;
    },

    get isSync (): boolean {
        if (this.forcedSyncMode)
            return true;

        return isREPL();
    }
};
