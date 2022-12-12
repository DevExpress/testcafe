import APIBasedTestFileCompilerBase from './test-file/api-based';
import urlUtils from 'url';
import Compiler from './index';
import { fileContentsCache } from '../utils/setup-sourcemap-support';

interface Load {
    format: string;
    shortCircuit?: boolean;
    source: string | ArrayBuffer;
}

interface Context {
    conditions: string[];
    format?: string | null;
    importAssertions: Record<string, unknown>;
}

function getFilenameFromURL (url: string): string | null {
    try {
        return urlUtils.fileURLToPath(url);
    }
    catch (_) {
        return null;
    }
}

export async function load (url: string, context: Context, defaultLoad: Function): Promise<Load> {
    const isNodeModulesDep = APIBasedTestFileCompilerBase._isNodeModulesDep(url);
    const isTestcafeLibDep = APIBasedTestFileCompilerBase._isTestCafeLibDep(url);
    const filename = getFilenameFromURL(url);

    if (isNodeModulesDep || isTestcafeLibDep || !filename)
        return defaultLoad(url, context, defaultLoad);

    const testFilesInfo = await Compiler.createTestFileInfo(filename);

    if (testFilesInfo?.compiler) {
        const [compiledCode] = await testFilesInfo.compiler.precompile([testFilesInfo]);

        fileContentsCache[url] = compiledCode;

        return {
            format:       context.format || 'module',
            source:       compiledCode,
            shortCircuit: true,
        };
    }

    return defaultLoad(url, context, defaultLoad);
}
