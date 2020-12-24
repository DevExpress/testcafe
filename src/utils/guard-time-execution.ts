export default async function guardTimeExecution<T> (
    fn: () => Promise<T>,
    onElapsed: (elapsedTime: [number, number]) => void
): Promise<T> {
    const timeElapsedStart  = process.hrtime();
    const result            = await fn();
    const timeElapsedFinish = process.hrtime(timeElapsedStart);

    onElapsed(timeElapsedFinish);

    return result;
}
