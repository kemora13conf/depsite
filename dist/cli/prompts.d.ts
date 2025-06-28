import { DeploymentConfig, PromptConfig } from '../types';
export declare class PromptService {
    /**
     * Gets deployment configuration from user input
     */
    getDeploymentConfig(): Promise<DeploymentConfig>;
    /**
     * Prompts for project name with validation
     */
    private promptProjectName;
    /**
     * Prompts for domain name with validation
     */
    private promptDomainName;
    /**
     * Prompts for port number with validation
     */
    private promptPortNumber;
    /**
     * Prompts for confirmation with custom message
     */
    confirm(message: string, defaultValue?: boolean): Promise<boolean>;
    /**
     * Prompts for SSL setup confirmation
     */
    confirmSSLSetup(): Promise<boolean>;
    /**
     * Prompts for configuration confirmation
     */
    confirmDeployment(): Promise<boolean>;
    /**
     * Prompts for overwrite confirmation
     */
    confirmOverwrite(): Promise<boolean>;
    /**
     * Generic prompt method for custom prompts
     */
    prompt<T = any>(config: PromptConfig): Promise<T>;
    /**
     * Validates project name
     */
    private validateProjectName;
    /**
     * Validates domain name
     */
    private validateDomainName;
    /**
     * Validates port number
     */
    private validatePortNumber;
}
//# sourceMappingURL=prompts.d.ts.map