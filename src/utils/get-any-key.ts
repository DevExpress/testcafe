export default async function getAnyKey (): Promise<void> {
    return new Promise(resolve => {
        process.stdin.once('data', resolve);
    });
}
