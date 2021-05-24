import { FormattedCommand } from './interfaces';
import { CommandFormatter } from './command-formatter';
import CommandBase from '../../test-run/commands/base';

export default function formatCommand (command: CommandBase, result: unknown): FormattedCommand {
    const commandFormatter = new CommandFormatter(command, result);

    return commandFormatter.format();
}
