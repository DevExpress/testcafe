import { Command } from 'commander';

export const FLAGS       = '-m, --allow-multiple-windows';
export const DESCRIPTION = 'run TestCafe in the multiple windows mode';

export function removeOptionDescriptionFromHelp (command: Command): void {
    const originOptionHelp = command.optionHelp;

    command.optionHelp = () => {
        const help = originOptionHelp.call(command);

        // NOTE: the option description ends with '\n';
        const strBefore = help.substring(0, help.indexOf(FLAGS) - 3);
        const strAfter  = help.substring(help.indexOf(DESCRIPTION) + DESCRIPTION.length, help.length - 1);

        return strBefore + strAfter;
    };
}
