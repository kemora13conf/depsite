import { SSLSetupOptions, NginxOperationResult } from '../types';
import { ProcessService } from './process.service';
export declare class SSLService {
    private processService;
    constructor(processService: ProcessService);
    /**
     * Checks if certbot is available
     */
    isCertbotAvailable(): Promise<boolean>;
    /**
     * Sets up SSL certificate using certbot
     */
    setupSSL(options: SSLSetupOptions): Promise<NginxOperationResult>;
    /**
     * Checks if SSL certificate exists for a domain
     */
    certificateExists(domainName: string): Promise<boolean>;
    /**
     * Renews SSL certificate for a domain
     */
    renewCertificate(domainName?: string): Promise<NginxOperationResult>;
    /**
     * Revokes SSL certificate for a domain
     */
    revokeCertificate(domainName: string): Promise<NginxOperationResult>;
    /**
     * Deletes SSL certificate for a domain
     */
    deleteCertificate(domainName: string): Promise<NginxOperationResult>;
    /**
     * Lists all SSL certificates
     */
    listCertificates(): Promise<string[]>;
    /**
     * Gets certificate information for a domain
     */
    getCertificateInfo(domainName: string): Promise<{
        exists: boolean;
        expiryDate?: string;
        status?: string;
    }>;
    /**
     * Checks if certificates need renewal
     */
    checkRenewalStatus(): Promise<{
        needsRenewal: boolean;
        certificates: string[];
    }>;
    /**
     * Builds certbot command with options
     */
    private buildCertbotCommand;
    /**
     * Sets up SSL with automatic email detection
     */
    setupSSLWithAutoEmail(domainName: string): Promise<NginxOperationResult>;
}
//# sourceMappingURL=ssl.service.d.ts.map