import os from 'os';

var platform = os.platform();

export default {
    win:   platform.match(/^win/),
    linux: platform === 'linux',
    mac:   platform === 'darwin'
};
