import { Dictionary } from '../../configuration/interfaces';

export const CONSOLE_MESSAGES_ENTRY_KEYS = ['error', 'warning', 'log', 'info'];

export type ConsoleMessagesEntryKeys = typeof CONSOLE_MESSAGES_ENTRY_KEYS[number];
export type ConsoleMessagesEntry = { [key in ConsoleMessagesEntryKeys]: string[] };
export type ConsoleMessageEntries = Dictionary<ConsoleMessagesEntry>;
