import OS from 'os-family';

const symbols = OS.win ?
    { ok: '√', err: '×' } :
    { ok: '✓', err: '✖' };

export default symbols;

