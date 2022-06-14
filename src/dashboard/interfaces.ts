export interface DashboardAuthenticationToken {
    projectId: string;
    tokenId?: string;
}

export type SendReportState = undefined | 'on' | 'off';

export interface DasboardOptions {
    url?: string;
    token?: string;
    buildId?: string;
    noScreenshotUpload?: boolean;
    noVideoUpload?: boolean;
    isLogEnabled?: boolean;
    requestRetryCount?: number;
    responseTimeout?: number;
}
