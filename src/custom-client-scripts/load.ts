import ClientScript from './client-script';
import ClientScriptInit from './client-script-init';

function createScripts (scriptInits: (string | ClientScriptInit)[], basePath: string): ClientScript[] {
    return scriptInits.map(scriptInit => new ClientScript(scriptInit, basePath));
}

export default async function (scriptInits: (string | ClientScriptInit)[], basePath?: string): Promise<ClientScript[]> {
    const scripts = createScripts(scriptInits, basePath || process.cwd());

    await Promise.all(scripts.map(script => script.load()));

    return scripts;
}
