export interface DashboardAuthenticationToken {
    projectId: string;
    tokenId?: string;
}

export type SendReportState = undefined | 'on' | 'off';

export interface DasboardReporterOptions {
    url?: string;
    token?: string;
    buildId?: string;
    noScreenshotUpload?: boolean;
    noVideoUpload?: boolean;
    isLogEnabled?: boolean;
    requestRetryCount?: number;
    responseTimeout?: number;
}
