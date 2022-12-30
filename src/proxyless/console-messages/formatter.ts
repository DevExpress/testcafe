import Protocol from 'devtools-protocol';

export default class ConsoleMessageFormatter {
    private static formatObject (arg: Protocol.Runtime.RemoteObject): string {
        if (arg.hasOwnProperty('value')) {
            if (arg.value === null)
                return 'null';

            return arg.value;
        }

        if (arg.subtype === 'array' && arg.preview?.properties)
            return arg.preview.properties.map((prop: Protocol.Runtime.PropertyPreview) => prop.value).join(',');

        if (arg.type === 'object')
            return {}.toString();

        return 'undefined';
    }

    public static format (args: Protocol.Runtime.RemoteObject[]): string {
        return args.map(ConsoleMessageFormatter.formatObject).join(' ');
    }
}

