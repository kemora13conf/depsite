export interface DeploymentConfig {
    projectName: string;
    domainName: string;
    portNumber: number;
}
export interface ProcessedConfig extends DeploymentConfig {
    cleanProjectName: string;
    upstreamName: string;
}
export interface SystemDependencies {
    nginx: boolean;
    certbot: boolean;
}
export interface DeploymentSummary {
    config: ProcessedConfig;
    siteConfigPath: string;
    siteEnabledPath: string;
    sslEnabled: boolean;
}
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
export interface NginxOperationResult {
    success: boolean;
    message?: string;
    error?: string;
}
export interface SSLSetupOptions {
    domainName: string;
    nonInteractive?: boolean;
    agreeToS?: boolean;
    redirect?: boolean;
}
export interface CommandResult {
    stdout: string;
    stderr: string;
    exitCode?: number;
}
export interface PromptConfig {
    type: 'input' | 'confirm' | 'list' | 'checkbox';
    name: string;
    message: string;
    default?: any;
    validate?: (input: any) => boolean | string;
    choices?: string[];
}
export declare enum LogLevel {
    INFO = "info",
    SUCCESS = "success",
    WARNING = "warning",
    ERROR = "error"
}
export declare class DeploymentError extends Error {
    readonly code: string;
    readonly rollback: boolean;
    constructor(message: string, code: string, rollback?: boolean);
}
export declare class ValidationError extends Error {
    readonly field?: string | undefined;
    constructor(message: string, field?: string | undefined);
}
export declare class SystemError extends Error {
    readonly command?: string | undefined;
    constructor(message: string, command?: string | undefined);
}
//# sourceMappingURL=index.d.ts.map