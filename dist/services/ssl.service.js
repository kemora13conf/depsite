"use strict";
// SSL/Certbot operations service
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSLService = void 0;
const constants_1 = require("../config/constants");
class SSLService {
    constructor(processService) {
        this.processService = processService;
    }
    /**
     * Checks if certbot is available
     */
    async isCertbotAvailable() {
        return await this.processService.commandExists('certbot');
    }
    /**
     * Sets up SSL certificate using certbot
     */
    async setupSSL(options) {
        try {
            const isAvailable = await this.isCertbotAvailable();
            if (!isAvailable) {
                return {
                    success: false,
                    error: 'Certbot is not installed. Please install certbot first.'
                };
            }
            const command = this.buildCertbotCommand(options);
            await this.processService.executeCommand(command);
            return {
                success: true,
                message: constants_1.SUCCESS_MESSAGES.SSL_SETUP_COMPLETE
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'SSL setup failed'
            };
        }
    }
    /**
     * Checks if SSL certificate exists for a domain
     */
    async certificateExists(domainName) {
        try {
            const command = `sudo certbot certificates -d ${domainName}`;
            const result = await this.processService.executeCommand(command);
            return result.stdout.includes(domainName);
        }
        catch {
            return false;
        }
    }
    /**
     * Renews SSL certificate for a domain
     */
    async renewCertificate(domainName) {
        try {
            const command = domainName
                ? `sudo certbot renew --cert-name ${domainName}`
                : 'sudo certbot renew';
            await this.processService.executeCommand(command);
            return {
                success: true,
                message: 'SSL certificate renewed successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Certificate renewal failed'
            };
        }
    }
    /**
     * Revokes SSL certificate for a domain
     */
    async revokeCertificate(domainName) {
        try {
            const command = `sudo certbot revoke --cert-name ${domainName}`;
            await this.processService.executeCommand(command);
            return {
                success: true,
                message: 'SSL certificate revoked successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Certificate revocation failed'
            };
        }
    }
    /**
     * Deletes SSL certificate for a domain
     */
    async deleteCertificate(domainName) {
        try {
            const command = `sudo certbot delete --cert-name ${domainName}`;
            await this.processService.executeCommand(command);
            return {
                success: true,
                message: 'SSL certificate deleted successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Certificate deletion failed'
            };
        }
    }
    /**
     * Lists all SSL certificates
     */
    async listCertificates() {
        try {
            const result = await this.processService.executeCommand('sudo certbot certificates');
            const lines = result.stdout.split('\n');
            const certificates = [];
            for (const line of lines) {
                const match = line.match(/Certificate Name: (.+)/);
                if (match) {
                    certificates.push(match[1].trim());
                }
            }
            return certificates;
        }
        catch {
            return [];
        }
    }
    /**
     * Gets certificate information for a domain
     */
    async getCertificateInfo(domainName) {
        try {
            const command = `sudo certbot certificates -d ${domainName}`;
            const result = await this.processService.executeCommand(command);
            if (!result.stdout.includes(domainName)) {
                return { exists: false };
            }
            // Extract expiry date
            const expiryMatch = result.stdout.match(/Expiry Date: ([^\n]+)/);
            const expiryDate = expiryMatch ? expiryMatch[1].trim() : undefined;
            return {
                exists: true,
                expiryDate,
                status: 'active'
            };
        }
        catch {
            return { exists: false };
        }
    }
    /**
     * Checks if certificates need renewal
     */
    async checkRenewalStatus() {
        try {
            const result = await this.processService.executeCommand('sudo certbot renew --dry-run');
            const needsRenewal = result.stdout.includes('would be renewed');
            // Extract certificate names that need renewal
            const lines = result.stdout.split('\n');
            const certificates = [];
            for (const line of lines) {
                if (line.includes('would be renewed')) {
                    const match = line.match(/\/etc\/letsencrypt\/live\/([^\/]+)\//);
                    if (match) {
                        certificates.push(match[1]);
                    }
                }
            }
            return { needsRenewal, certificates };
        }
        catch {
            return { needsRenewal: false, certificates: [] };
        }
    }
    /**
     * Builds certbot command with options
     */
    buildCertbotCommand(options) {
        const { domainName, nonInteractive = true, agreeToS = true, redirect = true } = options;
        let command = `sudo certbot --nginx -d "${domainName}"`;
        if (nonInteractive) {
            command += ' --non-interactive';
        }
        if (agreeToS) {
            command += ' --agree-tos';
        }
        if (redirect) {
            command += ' --redirect';
        }
        return command;
    }
    /**
     * Sets up SSL with automatic email detection
     */
    async setupSSLWithAutoEmail(domainName) {
        try {
            // Try to get email from git config first
            let email;
            try {
                const gitEmail = await this.processService.getCommandOutput('git config --global user.email');
                if (gitEmail && gitEmail.includes('@')) {
                    email = gitEmail;
                }
            }
            catch {
                // Git email not available
            }
            const command = email
                ? `sudo certbot --nginx -d "${domainName}" --non-interactive --agree-tos --redirect --email "${email}"`
                : `sudo certbot --nginx -d "${domainName}" --non-interactive --agree-tos --redirect --register-unsafely-without-email`;
            await this.processService.executeCommand(command);
            return {
                success: true,
                message: constants_1.SUCCESS_MESSAGES.SSL_SETUP_COMPLETE
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'SSL setup failed'
            };
        }
    }
}
exports.SSLService = SSLService;
//# sourceMappingURL=ssl.service.js.map