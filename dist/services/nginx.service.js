"use strict";
// Nginx operations service
Object.defineProperty(exports, "__esModule", { value: true });
exports.NginxService = void 0;
const constants_1 = require("../config/constants");
class NginxService {
    constructor(processService, systemService) {
        this.processService = processService;
        this.systemService = systemService;
    }
    /**
     * Generates nginx configuration content
     */
    generateConfiguration(config) {
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

    client_max_body_size ${constants_1.NGINX_CONFIG.CLIENT_MAX_BODY_SIZE};
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
        proxy_read_timeout ${constants_1.NGINX_CONFIG.PROXY_READ_TIMEOUT};
        proxy_connect_timeout ${constants_1.NGINX_CONFIG.PROXY_CONNECT_TIMEOUT};
    }
}`;
    }
    /**
     * Creates nginx configuration file
     */
    async createConfiguration(config) {
        try {
            const configContent = this.generateConfiguration(config);
            const configPath = this.getConfigPath(config.cleanProjectName);
            await this.processService.writeFileWithSudo(configContent, configPath);
            return {
                success: true,
                message: `${constants_1.SUCCESS_MESSAGES.CONFIG_CREATED}: ${configPath}`
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create configuration'
            };
        }
    }
    /**
     * Enables the site by creating a symbolic link
     */
    async enableSite(cleanProjectName) {
        try {
            const configPath = this.getConfigPath(cleanProjectName);
            const enabledPath = this.getEnabledPath(cleanProjectName);
            await this.processService.createSymlinkWithSudo(configPath, enabledPath);
            return {
                success: true,
                message: constants_1.SUCCESS_MESSAGES.SITE_ENABLED
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to enable site'
            };
        }
    }
    /**
     * Disables the site by removing the symbolic link
     */
    async disableSite(cleanProjectName) {
        try {
            const enabledPath = this.getEnabledPath(cleanProjectName);
            await this.processService.removeFileWithSudo(enabledPath);
            return {
                success: true,
                message: 'Site disabled successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to disable site'
            };
        }
    }
    /**
     * Tests nginx configuration
     */
    async testConfiguration() {
        try {
            await this.processService.executeCommand(constants_1.COMMANDS.NGINX.TEST);
            return {
                success: true,
                message: 'Nginx configuration test passed'
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Nginx configuration test failed'
            };
        }
    }
    /**
     * Reloads nginx service
     */
    async reloadNginx() {
        try {
            await this.processService.executeCommand(constants_1.COMMANDS.NGINX.RELOAD);
            return {
                success: true,
                message: constants_1.SUCCESS_MESSAGES.NGINX_RELOADED
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Failed to reload nginx'
            };
        }
    }
    /**
     * Restarts nginx service
     */
    async restartNginx() {
        try {
            await this.processService.executeCommand(constants_1.COMMANDS.NGINX.RESTART);
            return {
                success: true,
                message: 'Nginx restarted successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Failed to restart nginx'
            };
        }
    }
    /**
     * Checks if site configuration exists
     */
    async siteExists(cleanProjectName) {
        const configPath = this.getConfigPath(cleanProjectName);
        return await this.systemService.fileExists(configPath);
    }
    /**
     * Checks if site is enabled
     */
    async isSiteEnabled(cleanProjectName) {
        const enabledPath = this.getEnabledPath(cleanProjectName);
        return await this.systemService.fileExists(enabledPath);
    }
    /**
     * Removes site configuration completely
     */
    async removeSite(cleanProjectName) {
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to remove site'
            };
        }
    }
    /**
     * Validates nginx configuration before applying changes
     */
    async validateAndApply(operation) {
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Operation failed'
            };
        }
    }
    /**
     * Gets the full path to the site configuration file
     */
    getConfigPath(cleanProjectName) {
        return `${constants_1.NGINX_CONFIG.SITES_AVAILABLE_PATH}/${cleanProjectName}`;
    }
    /**
     * Gets the full path to the enabled site symbolic link
     */
    getEnabledPath(cleanProjectName) {
        return `${constants_1.NGINX_CONFIG.SITES_ENABLED_PATH}/${cleanProjectName}`;
    }
    /**
     * Gets nginx configuration paths for a site
     */
    getSitePaths(cleanProjectName) {
        return {
            configPath: this.getConfigPath(cleanProjectName),
            enabledPath: this.getEnabledPath(cleanProjectName)
        };
    }
}
exports.NginxService = NginxService;
//# sourceMappingURL=nginx.service.js.map