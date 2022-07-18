import delay from './delay';

export default function nextTick (): Promise<void> {
    return delay(0);
}
