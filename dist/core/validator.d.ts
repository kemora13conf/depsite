import { DeploymentConfig, ProcessedConfig, ValidationResult } from '../types';
import { SystemService } from '../services/system.service';
import { NginxService } from '../services/nginx.service';
export declare class ValidationService {
    private systemService;
    private nginxService;
    constructor(systemService: SystemService, nginxService: NginxService);
    /**
     * Validates deployment configuration
     */
    validateDeploymentConfig(config: DeploymentConfig): Promise<ValidationResult>;
    /**
     * Validates system requirements
     */
    validateSystemRequirements(): Promise<ValidationResult>;
    /**
     * Validates project name
     */
    validateProjectName(projectName: string): ValidationResult;
    /**
     * Validates domain name
     */
    validateDomainName(domainName: string): ValidationResult;
    /**
     * Validates port number
     */
    validatePortNumber(portNumber: number): ValidationResult;
    /**
     * Checks for port conflicts with existing services
     */
    checkPortConflicts(portNumber: number): Promise<ValidationResult>;
    /**
     * Validates that site doesn't already exist
     */
    validateSiteDoesNotExist(cleanProjectName: string): Promise<ValidationResult>;
    /**
     * Processes and validates complete deployment configuration
     */
    processAndValidateConfig(config: DeploymentConfig): Promise<ProcessedConfig>;
    /**
     * Validates nginx configuration syntax
     */
    validateNginxConfig(): Promise<ValidationResult>;
    /**
     * Comprehensive pre-deployment validation
     */
    validatePreDeployment(config: DeploymentConfig): Promise<{
        isValid: boolean;
        errors: string[];
        processedConfig?: ProcessedConfig;
    }>;
    /**
     * Validates individual field values with detailed feedback
     */
    validateField(fieldName: string, value: any): ValidationResult;
}
//# sourceMappingURL=validator.d.ts.map