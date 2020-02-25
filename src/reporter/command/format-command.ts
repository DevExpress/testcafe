import { Command, FormattedCommand } from './interfaces';
import { CommandFormatter } from './command-formatter';

export default function formatCommand (command: Command, result: unknown): FormattedCommand {
    const commandFormatter = new CommandFormatter(command, result);

    return commandFormatter.format();
}
