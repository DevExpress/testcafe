import ClientScript from './client-script';

export default function (script: ClientScript): string {
    return `/custom-client-scripts/${script.url}`;
}
