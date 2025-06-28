import { SystemDependencies } from '../types';
import { ProcessService } from './process.service';
export declare class SystemService {
    private processService;
    constructor(processService: ProcessService);
    /**
     * Checks if running as root user
     */
    checkRootUser(): void;
    /**
     * Checks system dependencies (nginx, certbot)
     */
    checkDependencies(): Promise<SystemDependencies>;
    /**
     * Checks system dependencies synchronously
     */
    checkDependenciesSync(): SystemDependencies;
    /**
     * Checks if a file exists
     */
    fileExists(filePath: string): Promise<boolean>;
    /**
     * Checks if a file is readable
     */
    isFileReadable(filePath: string): Promise<boolean>;
    /**
     * Checks if a file is writable
     */
    isFileWritable(filePath: string): Promise<boolean>;
    /**
     * Validates system requirements before deployment
     */
    validateSystemRequirements(): Promise<SystemDependencies>;
    /**
     * Gets system information
     */
    getSystemInfo(): Promise<{
        platform: string;
        arch: string;
        nodeVersion: string;
        nginxVersion?: string;
        certbotVersion?: string;
    }>;
    /**
     * Checks if nginx service is running
     */
    isNginxRunning(): Promise<boolean>;
    /**
     * Checks nginx configuration syntax
     */
    checkNginxSyntax(): Promise<boolean>;
    /**
     * Gets available disk space in the nginx configuration directory
     */
    getAvailableDiskSpace(): Promise<number>;
    /**
     * Validates that the system has enough resources for deployment
     */
    validateSystemResources(): Promise<void>;
}
//# sourceMappingURL=system.service.d.ts.map