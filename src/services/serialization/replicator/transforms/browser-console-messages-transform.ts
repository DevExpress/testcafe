import BrowserConsoleMessages from '../../../../test-run/browser-console-messages';

export default class BrowserConsoleMessagesTransform {
    public readonly type: string;

    public constructor () {
        this.type = 'BrowserConsoleMessages';
    }

    public shouldTransform (_: unknown, val: unknown): boolean {
        return val instanceof BrowserConsoleMessages;
    }

    public toSerializable (value: BrowserConsoleMessages): unknown {
        return value.getCopy();
    }

    public fromSerializable (value: unknown): BrowserConsoleMessages {
        return new BrowserConsoleMessages(value);
    }
}
