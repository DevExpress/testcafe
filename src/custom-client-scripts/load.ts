import ClientScript from './client-script';
import ClientScriptInit from './client-script-init';

export default async function (scriptInits: (string | ClientScriptInit)[], basePath: string): Promise<ClientScript[]> {
    basePath = basePath || process.cwd();

    const scripts = scriptInits.map(scriptInit => new ClientScript(scriptInit, basePath));

    await Promise.all(scripts.map(script => script.load()));

    return scripts;
}
