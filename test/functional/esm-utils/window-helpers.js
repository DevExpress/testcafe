import { ClientFunction } from 'testcafe';


const getWindowState = ClientFunction(() => ({
    isMaximized: window.outerWidth >= window.screen.availWidth && window.outerHeight >= window.screen.availHeight,
    width:       window.innerWidth,
    height:      window.innerHeight,
}));

async function saveWindowState (t) {
    const boundGetWindowState =  getWindowState.with({ boundTestRun: t });

    t.ctx._savedWindowState = await boundGetWindowState();
}

async function restoreWindowState (t) {
    if (!t.ctx._savedWindowState)
        return;

    if (t.ctx._savedWindowState.isMaximized)
        await t.maximizeWindow();
    else
        await t.resizeWindow(t.ctx._savedWindowState.width, t.ctx._savedWindowState.height);
}

const getWindowWidth  = ClientFunction(() => window.innerWidth);
const getWindowHeight = ClientFunction(() => window.innerHeight);

export {
    saveWindowState,
    restoreWindowState,
    getWindowWidth,
    getWindowHeight,
};
