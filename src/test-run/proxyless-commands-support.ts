import COMMAND_TYPE from './commands/type';

const PROXYLESS_COMMANDS = new Map<string, string>();

PROXYLESS_COMMANDS.set(COMMAND_TYPE.executeClientFunction, 'hasExecuteClientFunction');
PROXYLESS_COMMANDS.set(COMMAND_TYPE.switchToIframe, 'hasSwitchToIframe');
PROXYLESS_COMMANDS.set(COMMAND_TYPE.switchToMainWindow, 'hasSwitchToMainWindow');
PROXYLESS_COMMANDS.set(COMMAND_TYPE.executeSelector, 'hasExecuteSelector');

export default PROXYLESS_COMMANDS;
