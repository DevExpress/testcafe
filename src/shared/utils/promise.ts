export async function whilst (condition: () => boolean, iterator: () => Promise<unknown>): Promise<void> {
    while (condition())
        await iterator();
}
