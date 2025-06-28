import { NginxOperationResult, ProcessedConfig } from '../types';
import { ProcessService } from './process.service';
import { SystemService } from './system.service';
export declare class NginxService {
    private processService;
    private systemService;
    constructor(processService: ProcessService, systemService: SystemService);
    /**
     * Generates nginx configuration content
     */
    generateConfiguration(config: ProcessedConfig): string;
    /**
     * Creates nginx configuration file
     */
    createConfiguration(config: ProcessedConfig): Promise<NginxOperationResult>;
    /**
     * Enables the site by creating a symbolic link
     */
    enableSite(cleanProjectName: string): Promise<NginxOperationResult>;
    /**
     * Disables the site by removing the symbolic link
     */
    disableSite(cleanProjectName: string): Promise<NginxOperationResult>;
    /**
     * Tests nginx configuration
     */
    testConfiguration(): Promise<NginxOperationResult>;
    /**
     * Reloads nginx service
     */
    reloadNginx(): Promise<NginxOperationResult>;
    /**
     * Restarts nginx service
     */
    restartNginx(): Promise<NginxOperationResult>;
    /**
     * Checks if site configuration exists
     */
    siteExists(cleanProjectName: string): Promise<boolean>;
    /**
     * Checks if site is enabled
     */
    isSiteEnabled(cleanProjectName: string): Promise<boolean>;
    /**
     * Removes site configuration completely
     */
    removeSite(cleanProjectName: string): Promise<NginxOperationResult>;
    /**
     * Validates nginx configuration before applying changes
     */
    validateAndApply(operation: () => Promise<void>): Promise<NginxOperationResult>;
    /**
     * Gets the full path to the site configuration file
     */
    private getConfigPath;
    /**
     * Gets the full path to the enabled site symbolic link
     */
    private getEnabledPath;
    /**
     * Gets nginx configuration paths for a site
     */
    getSitePaths(cleanProjectName: string): {
        configPath: string;
        enabledPath: string;
    };
}
//# sourceMappingURL=nginx.service.d.ts.map