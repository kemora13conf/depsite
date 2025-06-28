"use strict";
// Main deployment orchestrator
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentOrchestrator = void 0;
const types_1 = require("../types");
const output_1 = require("../cli/output");
const prompts_1 = require("../cli/prompts");
const process_service_1 = require("../services/process.service");
const system_service_1 = require("../services/system.service");
const nginx_service_1 = require("../services/nginx.service");
const ssl_service_1 = require("../services/ssl.service");
const validator_1 = require("./validator");
const config_generator_1 = require("./config-generator");
const error_handler_1 = require("../utils/error-handler");
const constants_1 = require("../config/constants");
class DeploymentOrchestrator {
    constructor() {
        this.outputService = new output_1.OutputService();
        this.promptService = new prompts_1.PromptService();
        this.processService = new process_service_1.ProcessService();
        this.systemService = new system_service_1.SystemService(this.processService);
        this.nginxService = new nginx_service_1.NginxService(this.processService, this.systemService);
        this.sslService = new ssl_service_1.SSLService(this.processService);
        this.validationService = new validator_1.ValidationService(this.systemService, this.nginxService);
        this.configGenerator = new config_generator_1.ConfigGenerator();
    }
    /**
     * Main deployment workflow
     */
    async deploy() {
        try {
            // Display header
            this.outputService.printHeader(`${constants_1.APP_CONFIG.NAME} - ${constants_1.APP_CONFIG.DESCRIPTION}`);
            // Step 1: Validate system requirements
            await this.validateSystem();
            // Step 2: Get user input
            const config = await this.getUserConfiguration();
            // Step 3: Process and validate configuration
            const processedConfig = await this.processConfiguration(config);
            // Step 4: Confirm deployment
            await this.confirmDeployment(processedConfig);
            // Step 5: Check for existing site
            await this.handleExistingSite(processedConfig);
            // Step 6: Execute deployment
            const summary = await this.executeDeployment(processedConfig);
            // Step 7: Setup SSL (optional)
            await this.setupSSL(processedConfig, summary);
            // Step 8: Display summary
            this.displayDeploymentSummary(summary);
        }
        catch (error) {
            error_handler_1.ErrorHandler.handle(error);
        }
    }
    /**
     * Validates system requirements and dependencies
     */
    async validateSystem() {
        this.outputService.printSection('System Validation');
        this.outputService.printProgress('Checking system requirements');
        const systemResult = await this.validationService.validateSystemRequirements();
        if (!systemResult.isValid) {
            this.outputService.clearLine();
            systemResult.errors.forEach(error => {
                this.outputService.log(types_1.LogLevel.ERROR, error);
            });
            throw new types_1.DeploymentError('System validation failed', 'SYSTEM_VALIDATION_FAILED');
        }
        this.outputService.printProgressComplete('System requirements validated');
        // Check dependencies and display status
        const dependencies = await this.systemService.checkDependencies();
        this.outputService.log(types_1.LogLevel.SUCCESS, 'Nginx detected and available');
        if (dependencies.certbot) {
            this.outputService.log(types_1.LogLevel.SUCCESS, 'Certbot detected and available for SSL setup');
        }
        else {
            this.outputService.log(types_1.LogLevel.WARNING, 'Certbot not found - SSL setup will be skipped');
        }
    }
    /**
     * Gets configuration from user input
     */
    async getUserConfiguration() {
        this.outputService.printSection('Configuration');
        return await this.promptService.getDeploymentConfig();
    }
    /**
     * Processes and validates configuration
     */
    async processConfiguration(config) {
        this.outputService.printProgress('Processing configuration');
        const validationResult = await this.validationService.validatePreDeployment(config);
        if (!validationResult.isValid || !validationResult.processedConfig) {
            this.outputService.clearLine();
            validationResult.errors.forEach(error => {
                this.outputService.log(types_1.LogLevel.ERROR, error);
            });
            throw new types_1.DeploymentError('Configuration validation failed', 'CONFIG_VALIDATION_FAILED');
        }
        this.outputService.printProgressComplete('Configuration processed and validated');
        return validationResult.processedConfig;
    }
    /**
     * Confirms deployment with user
     */
    async confirmDeployment(config) {
        this.outputService.printConfigPreview(config.cleanProjectName, config.domainName, config.portNumber, config.upstreamName);
        const confirmed = await this.promptService.confirmDeployment();
        if (!confirmed) {
            this.outputService.log(types_1.LogLevel.WARNING, 'Deployment cancelled by user');
            process.exit(0);
        }
    }
    /**
     * Handles existing site configuration
     */
    async handleExistingSite(config) {
        const siteExists = await this.nginxService.siteExists(config.cleanProjectName);
        if (siteExists) {
            this.outputService.log(types_1.LogLevel.WARNING, `Site configuration already exists: ${config.cleanProjectName}`);
            const overwrite = await this.promptService.confirmOverwrite();
            if (!overwrite) {
                this.outputService.log(types_1.LogLevel.WARNING, 'Deployment cancelled by user');
                process.exit(0);
            }
            this.outputService.log(types_1.LogLevel.INFO, 'Will overwrite existing configuration');
        }
    }
    /**
     * Executes the main deployment process
     */
    async executeDeployment(config) {
        this.outputService.printSection('Deployment');
        let siteConfigPath = '';
        let rollbackNeeded = false;
        try {
            // Generate and create nginx configuration
            this.outputService.printProgress('Creating nginx configuration');
            const createResult = await this.nginxService.createConfiguration(config);
            if (!createResult.success) {
                throw new types_1.DeploymentError(createResult.error || 'Failed to create configuration', 'CONFIG_CREATION_FAILED');
            }
            siteConfigPath = this.nginxService.getSitePaths(config.cleanProjectName).configPath;
            rollbackNeeded = true;
            this.outputService.printProgressComplete('Nginx configuration created');
            // Enable the site
            this.outputService.printProgress('Enabling site');
            const enableResult = await this.nginxService.enableSite(config.cleanProjectName);
            if (!enableResult.success) {
                throw new types_1.DeploymentError(enableResult.error || 'Failed to enable site', 'SITE_ENABLE_FAILED', true);
            }
            this.outputService.printProgressComplete('Site enabled');
            // Test and reload nginx
            this.outputService.printProgress('Testing and reloading nginx');
            const testResult = await this.nginxService.testConfiguration();
            if (!testResult.success) {
                throw new types_1.DeploymentError(testResult.error || 'Nginx configuration test failed', 'CONFIG_TEST_FAILED', true);
            }
            const reloadResult = await this.nginxService.reloadNginx();
            if (!reloadResult.success) {
                throw new types_1.DeploymentError(reloadResult.error || 'Failed to reload nginx', 'NGINX_RELOAD_FAILED', true);
            }
            this.outputService.printProgressComplete('Nginx configuration applied');
            const paths = this.nginxService.getSitePaths(config.cleanProjectName);
            return {
                config,
                siteConfigPath: paths.configPath,
                siteEnabledPath: paths.enabledPath,
                sslEnabled: false
            };
        }
        catch (error) {
            if (rollbackNeeded) {
                await this.rollbackDeployment(config.cleanProjectName, siteConfigPath);
            }
            throw error;
        }
    }
    /**
     * Sets up SSL certificate
     */
    async setupSSL(config, summary) {
        const certbotAvailable = await this.sslService.isCertbotAvailable();
        if (!certbotAvailable) {
            this.outputService.log(types_1.LogLevel.WARNING, 'Certbot not available - SSL setup skipped');
            return;
        }
        const setupSSL = await this.promptService.confirmSSLSetup();
        if (!setupSSL) {
            this.outputService.log(types_1.LogLevel.INFO, 'SSL setup skipped by user');
            return;
        }
        this.outputService.printSection('SSL Setup');
        this.outputService.printProgress('Setting up SSL certificate');
        try {
            const sslResult = await this.sslService.setupSSLWithAutoEmail(config.domainName);
            if (sslResult.success) {
                this.outputService.printProgressComplete('SSL certificate configured successfully');
                summary.sslEnabled = true;
            }
            else {
                this.outputService.clearLine();
                this.outputService.log(types_1.LogLevel.WARNING, `SSL setup failed: ${sslResult.error}`);
                this.outputService.log(types_1.LogLevel.INFO, `You can set up SSL manually later: sudo certbot --nginx -d ${config.domainName}`);
            }
        }
        catch (error) {
            this.outputService.clearLine();
            this.outputService.log(types_1.LogLevel.WARNING, 'SSL setup failed or was cancelled');
            this.outputService.log(types_1.LogLevel.INFO, `You can set up SSL manually later: sudo certbot --nginx -d ${config.domainName}`);
        }
    }
    /**
     * Displays deployment summary
     */
    displayDeploymentSummary(summary) {
        this.outputService.printDeploymentSummary(summary.config.cleanProjectName, summary.config.domainName, summary.config.portNumber, summary.siteConfigPath, summary.config.cleanProjectName);
        if (summary.sslEnabled) {
            this.outputService.newLine();
            this.outputService.log(types_1.LogLevel.SUCCESS, '🔒 SSL certificate has been configured');
            this.outputService.log(types_1.LogLevel.INFO, `Your site is now available at: https://${summary.config.domainName}`);
        }
        else {
            this.outputService.newLine();
            this.outputService.log(types_1.LogLevel.INFO, `Your site is now available at: http://${summary.config.domainName}`);
        }
    }
    /**
     * Rolls back deployment in case of failure
     */
    async rollbackDeployment(cleanProjectName, siteConfigPath) {
        this.outputService.log(types_1.LogLevel.ERROR, 'Deployment failed - rolling back changes...');
        try {
            // Remove site from sites-enabled
            await this.nginxService.disableSite(cleanProjectName);
            // Remove configuration file if it was created
            if (siteConfigPath) {
                await this.processService.removeFileWithSudo(siteConfigPath);
            }
            this.outputService.log(types_1.LogLevel.INFO, 'Rollback completed successfully');
        }
        catch (error) {
            this.outputService.log(types_1.LogLevel.ERROR, `Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            this.outputService.log(types_1.LogLevel.INFO, 'You may need to manually clean up nginx configuration files');
        }
    }
    /**
     * Validates deployment status after completion
     */
    async validateDeployment(config) {
        try {
            // Check if site is enabled
            const isEnabled = await this.nginxService.isSiteEnabled(config.cleanProjectName);
            if (!isEnabled) {
                return false;
            }
            // Test nginx configuration
            const testResult = await this.nginxService.testConfiguration();
            if (!testResult.success) {
                return false;
            }
            // Check if nginx is running
            const isRunning = await this.systemService.isNginxRunning();
            if (!isRunning) {
                return false;
            }
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Removes an existing deployment
     */
    async removeSite(projectName) {
        try {
            this.outputService.printHeader('Site Removal');
            const cleanProjectName = projectName.toLowerCase().replace(/[^a-zA-Z0-9-]/g, '-');
            // Check if site exists
            const siteExists = await this.nginxService.siteExists(cleanProjectName);
            if (!siteExists) {
                this.outputService.log(types_1.LogLevel.ERROR, `Site '${cleanProjectName}' does not exist`);
                return;
            }
            // Confirm removal
            const confirmed = await this.promptService.confirm(`Are you sure you want to remove site '${cleanProjectName}'? This action cannot be undone.`, false);
            if (!confirmed) {
                this.outputService.log(types_1.LogLevel.INFO, 'Site removal cancelled');
                return;
            }
            // Remove site
            this.outputService.printProgress('Removing site configuration');
            const removeResult = await this.nginxService.removeSite(cleanProjectName);
            if (!removeResult.success) {
                throw new types_1.DeploymentError(removeResult.error || 'Failed to remove site', 'SITE_REMOVAL_FAILED');
            }
            // Reload nginx
            const reloadResult = await this.nginxService.reloadNginx();
            if (!reloadResult.success) {
                this.outputService.log(types_1.LogLevel.WARNING, 'Failed to reload nginx after site removal');
            }
            this.outputService.printProgressComplete('Site removed successfully');
            this.outputService.log(types_1.LogLevel.SUCCESS, `Site '${cleanProjectName}' has been removed`);
        }
        catch (error) {
            error_handler_1.ErrorHandler.handle(error);
        }
    }
    /**
     * Lists all managed sites
     */
    async listSites() {
        try {
            this.outputService.printHeader('Managed Sites');
            // This would require implementing a way to track managed sites
            // For now, we'll show available and enabled sites
            this.outputService.log(types_1.LogLevel.INFO, 'Available sites: /etc/nginx/sites-available/');
            this.outputService.log(types_1.LogLevel.INFO, 'Enabled sites: /etc/nginx/sites-enabled/');
        }
        catch (error) {
            error_handler_1.ErrorHandler.handle(error);
        }
    }
}
exports.DeploymentOrchestrator = DeploymentOrchestrator;
//# sourceMappingURL=deployer.js.map