// Nginx operations service

import { NginxOperationResult, ProcessedConfig } from '../types';
import { ProcessService } from './process.service';
import { SystemService } from './system.service';
import { NGINX_CONFIG, COMMANDS, SUCCESS_MESSAGES } from '../config/constants';
import { InputSanitizer } from '../utils/sanitizer';

export class NginxService {
  constructor(
    private processService: ProcessService,
    private systemService: SystemService
  ) {}

  /**
   * Generates nginx configuration content
   */
  generateConfiguration(config: ProcessedConfig): string {
    const { cleanProjectName, domainName, portNumber, upstreamName } = config;

    return `# Upstream for ${config.projectName} Production
upstream ${upstreamName} {
    ip_hash;
    server 127.0.0.1:${portNumber};
}

# HTTP Server Block
server {
    listen 80;
    server_name ${domainName};

    client_max_body_size ${NGINX_CONFIG.CLIENT_MAX_BODY_SIZE};
    charset utf-8;

    # Custom error pages
    error_page 404 /not-found;
    error_page 500 502 503 504 /bad-request;

    location / {
        proxy_pass http://${upstreamName};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
        proxy_cache_bypass \\$http_upgrade;
        proxy_read_timeout ${NGINX_CONFIG.PROXY_READ_TIMEOUT};
        proxy_connect_timeout ${NGINX_CONFIG.PROXY_CONNECT_TIMEOUT};
    }
}`;
  }

  /**
   * Creates nginx configuration file
   */
  async createConfiguration(config: ProcessedConfig): Promise<NginxOperationResult> {
    try {
      const configContent = this.generateConfiguration(config);
      const configPath = this.getConfigPath(config.cleanProjectName);

      await this.processService.writeFileWithSudo(configContent, configPath);

      return {
        success: true,
        message: `${SUCCESS_MESSAGES.CONFIG_CREATED}: ${configPath}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create configuration'
      };
    }
  }

  /**
   * Enables the site by creating a symbolic link
   */
  async enableSite(cleanProjectName: string): Promise<NginxOperationResult> {
    try {
      const configPath = this.getConfigPath(cleanProjectName);
      const enabledPath = this.getEnabledPath(cleanProjectName);

      await this.processService.createSymlinkWithSudo(configPath, enabledPath);

      return {
        success: true,
        message: SUCCESS_MESSAGES.SITE_ENABLED
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to enable site'
      };
    }
  }

  /**
   * Disables the site by removing the symbolic link
   */
  async disableSite(cleanProjectName: string): Promise<NginxOperationResult> {
    try {
      const enabledPath = this.getEnabledPath(cleanProjectName);
      await this.processService.removeFileWithSudo(enabledPath);

      return {
        success: true,
        message: 'Site disabled successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to disable site'
      };
    }
  }

  /**
   * Tests nginx configuration
   */
  async testConfiguration(): Promise<NginxOperationResult> {
    try {
      await this.processService.executeCommand(COMMANDS.NGINX.TEST);
      return {
        success: true,
        message: 'Nginx configuration test passed'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Nginx configuration test failed'
      };
    }
  }

  /**
   * Reloads nginx service
   */
  async reloadNginx(): Promise<NginxOperationResult> {
    try {
      await this.processService.executeCommand(COMMANDS.NGINX.RELOAD);
      return {
        success: true,
        message: SUCCESS_MESSAGES.NGINX_RELOADED
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to reload nginx'
      };
    }
  }

  /**
   * Restarts nginx service
   */
  async restartNginx(): Promise<NginxOperationResult> {
    try {
      await this.processService.executeCommand(COMMANDS.NGINX.RESTART);
      return {
        success: true,
        message: 'Nginx restarted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to restart nginx'
      };
    }
  }

  /**
   * Checks if site configuration exists
   */
  async siteExists(cleanProjectName: string): Promise<boolean> {
    const configPath = this.getConfigPath(cleanProjectName);
    return await this.systemService.fileExists(configPath);
  }

  /**
   * Checks if site is enabled
   */
  async isSiteEnabled(cleanProjectName: string): Promise<boolean> {
    const enabledPath = this.getEnabledPath(cleanProjectName);
    return await this.systemService.fileExists(enabledPath);
  }

  /**
   * Removes site configuration completely
   */
  async removeSite(cleanProjectName: string): Promise<NginxOperationResult> {
    try {
      const configPath = this.getConfigPath(cleanProjectName);
      const enabledPath = this.getEnabledPath(cleanProjectName);

      // Remove from sites-enabled first
      await this.processService.removeFileWithSudo(enabledPath);
      
      // Remove from sites-available
      await this.processService.removeFileWithSudo(configPath);

      return {
        success: true,
        message: 'Site configuration removed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove site'
      };
    }
  }

  /**
   * Validates nginx configuration before applying changes
   */
  async validateAndApply(operation: () => Promise<void>): Promise<NginxOperationResult> {
    try {
      // Execute the operation
      await operation();

      // Test configuration
      const testResult = await this.testConfiguration();
      if (!testResult.success) {
        throw new Error(testResult.error || 'Configuration test failed');
      }

      // Reload nginx
      const reloadResult = await this.reloadNginx();
      if (!reloadResult.success) {
        throw new Error(reloadResult.error || 'Failed to reload nginx');
      }

      return {
        success: true,
        message: 'Operation completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Operation failed'
      };
    }
  }

  /**
   * Gets the full path to the site configuration file
   */
  private getConfigPath(cleanProjectName: string): string {
    return `${NGINX_CONFIG.SITES_AVAILABLE_PATH}/${cleanProjectName}`;
  }

  /**
   * Gets the full path to the enabled site symbolic link
   */
  private getEnabledPath(cleanProjectName: string): string {
    return `${NGINX_CONFIG.SITES_ENABLED_PATH}/${cleanProjectName}`;
  }

  /**
   * Gets nginx configuration paths for a site
   */
  getSitePaths(cleanProjectName: string): {
    configPath: string;
    enabledPath: string;
  } {
    return {
      configPath: this.getConfigPath(cleanProjectName),
      enabledPath: this.getEnabledPath(cleanProjectName)
    };
  }
}