import AssertionCommand from '../../test-run/commands/assertion';
import { Dictionary } from '../../configuration/interfaces';

export default function getAssertionTimeout (command: AssertionCommand, options: Dictionary<OptionValue>): number {
    const commandTimeout = command.options?.timeout;

    return commandTimeout === void 0
        ? options.assertionTimeout as number
        : commandTimeout;
}
