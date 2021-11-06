export interface ScrollCoreAdapter {
    PromiseCtor: typeof Promise;
    controller: {
        waitForScroll (scrollElement: any): Promise<any>;
    };
}
