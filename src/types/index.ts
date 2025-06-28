// Core types and interfaces

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

// Command execution result
export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode?: number;
}

// User input prompts
export interface PromptConfig {
  type: 'input' | 'confirm' | 'list' | 'checkbox';
  name: string;
  message: string;
  default?: any;
  validate?: (input: any) => boolean | string;
  choices?: string[];
}

// Logger levels
export enum LogLevel {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}

// Application errors
export class DeploymentError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly rollback: boolean = false
  ) {
    super(message);
    this.name = 'DeploymentError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class SystemError extends Error {
  constructor(message: string, public readonly command?: string) {
    super(message);
    this.name = 'SystemError';
  }
}