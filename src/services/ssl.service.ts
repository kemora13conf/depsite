// SSL/Certbot operations service

import { SSLSetupOptions, NginxOperationResult } from '../types';
import { ProcessService } from './process.service';
import { COMMANDS, SUCCESS_MESSAGES } from '../config/constants';

export class SSLService {
  constructor(private processService: ProcessService) {}

  /**
   * Checks if certbot is available
   */
  async isCertbotAvailable(): Promise<boolean> {
    return await this.processService.commandExists('certbot');
  }

  /**
   * Sets up SSL certificate using certbot
   */
  async setupSSL(options: SSLSetupOptions): Promise<NginxOperationResult> {
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
        message: SUCCESS_MESSAGES.SSL_SETUP_COMPLETE
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SSL setup failed'
      };
    }
  }

  /**
   * Checks if SSL certificate exists for a domain
   */
  async certificateExists(domainName: string): Promise<boolean> {
    try {
      const command = `sudo certbot certificates -d ${domainName}`;
      const result = await this.processService.executeCommand(command);
      return result.stdout.includes(domainName);
    } catch {
      return false;
    }
  }

  /**
   * Renews SSL certificate for a domain
   */
  async renewCertificate(domainName?: string): Promise<NginxOperationResult> {
    try {
      const command = domainName 
        ? `sudo certbot renew --cert-name ${domainName}`
        : 'sudo certbot renew';
      
      await this.processService.executeCommand(command);

      return {
        success: true,
        message: 'SSL certificate renewed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Certificate renewal failed'
      };
    }
  }

  /**
   * Revokes SSL certificate for a domain
   */
  async revokeCertificate(domainName: string): Promise<NginxOperationResult> {
    try {
      const command = `sudo certbot revoke --cert-name ${domainName}`;
      await this.processService.executeCommand(command);

      return {
        success: true,
        message: 'SSL certificate revoked successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Certificate revocation failed'
      };
    }
  }

  /**
   * Deletes SSL certificate for a domain
   */
  async deleteCertificate(domainName: string): Promise<NginxOperationResult> {
    try {
      const command = `sudo certbot delete --cert-name ${domainName}`;
      await this.processService.executeCommand(command);

      return {
        success: true,
        message: 'SSL certificate deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Certificate deletion failed'
      };
    }
  }

  /**
   * Lists all SSL certificates
   */
  async listCertificates(): Promise<string[]> {
    try {
      const result = await this.processService.executeCommand('sudo certbot certificates');
      const lines = result.stdout.split('\n');
      const certificates: string[] = [];

      for (const line of lines) {
        const match = line.match(/Certificate Name: (.+)/);
        if (match) {
          certificates.push(match[1].trim());
        }
      }

      return certificates;
    } catch {
      return [];
    }
  }

  /**
   * Gets certificate information for a domain
   */
  async getCertificateInfo(domainName: string): Promise<{
    exists: boolean;
    expiryDate?: string;
    status?: string;
  }> {
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
    } catch {
      return { exists: false };
    }
  }

  /**
   * Checks if certificates need renewal
   */
  async checkRenewalStatus(): Promise<{
    needsRenewal: boolean;
    certificates: string[];
  }> {
    try {
      const result = await this.processService.executeCommand('sudo certbot renew --dry-run');
      const needsRenewal = result.stdout.includes('would be renewed');
      
      // Extract certificate names that need renewal
      const lines = result.stdout.split('\n');
      const certificates: string[] = [];
      
      for (const line of lines) {
        if (line.includes('would be renewed')) {
          const match = line.match(/\/etc\/letsencrypt\/live\/([^\/]+)\//);
          if (match) {
            certificates.push(match[1]);
          }
        }
      }

      return { needsRenewal, certificates };
    } catch {
      return { needsRenewal: false, certificates: [] };
    }
  }

  /**
   * Builds certbot command with options
   */
  private buildCertbotCommand(options: SSLSetupOptions): string {
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
  async setupSSLWithAutoEmail(domainName: string): Promise<NginxOperationResult> {
    try {
      // Try to get email from git config first
      let email: string | undefined;
      
      try {
        const gitEmail = await this.processService.getCommandOutput('git config --global user.email');
        if (gitEmail && gitEmail.includes('@')) {
          email = gitEmail;
        }
      } catch {
        // Git email not available
      }

      const command = email
        ? `sudo certbot --nginx -d "${domainName}" --non-interactive --agree-tos --redirect --email "${email}"`
        : `sudo certbot --nginx -d "${domainName}" --non-interactive --agree-tos --redirect --register-unsafely-without-email`;

      await this.processService.executeCommand(command);

      return {
        success: true,
        message: SUCCESS_MESSAGES.SSL_SETUP_COMPLETE
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SSL setup failed'
      };
    }
  }
}