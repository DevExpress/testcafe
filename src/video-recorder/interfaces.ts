export interface TestRunVideoInfo {
    testRunId: string;
    videoPath: string;
    singleFile: boolean;
}

export interface TestVideoInfo {
    recordings: TestRunVideoInfo[];
}

export interface TestRunVideoSavedEventArgs {
    testRun: { id: string; test: { id: string } };
    videoPath: string;
    singleFile: boolean;
}

export interface VideoOptions {
    videoPath: string;
    videoOptions: object;
    videoEncodingOptions: object;
}
