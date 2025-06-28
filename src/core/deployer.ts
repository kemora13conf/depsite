// Main deployment orchestrator

import { DeploymentConfig, ProcessedConfig, DeploymentSummary, LogLevel, DeploymentError } from '../types';
import { OutputService } from '../cli/output';
import { PromptService } from '../cli/prompts';
import { ProcessService } from '../services/process.service';
import { SystemService } from '../services/system.service';
import { NginxService } from '../services/nginx.service';
import { SSLService } from '../services/ssl.service';
import { ValidationService } from './validator';
import { ConfigGenerator } from './config-generator';
import { ErrorHandler } from '../utils/error-handler';
import { APP_CONFIG, SUCCESS_MESSAGES } from '../config/constants';

export class DeploymentOrchestrator {
  private outputService: OutputService;
  private promptService: PromptService;
  private processService: ProcessService;
  private systemService: SystemService;
  private nginxService: NginxService;
  private sslService: SSLService;
  private validationService: ValidationService;
  private configGenerator: ConfigGenerator;

  constructor() {
    this.outputService = new OutputService();
    this.promptService = new PromptService();
    this.processService = new ProcessService();
    this.systemService = new SystemService(this.processService);
    this.nginxService = new NginxService(this.processService, this.systemService);
    this.sslService = new SSLService(this.processService);
    this.validationService = new ValidationService(this.systemService, this.nginxService);
    this.configGenerator = new ConfigGenerator();
  }

  /**
   * Main deployment workflow
   */
  async deploy(): Promise<void> {
    try {
      // Display header
      this.outputService.printHeader(`${APP_CONFIG.NAME} - ${APP_CONFIG.DESCRIPTION}`);

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

    } catch (error) {
      ErrorHandler.handle(error);
    }
  }

  /**
   * Validates system requirements and dependencies
   */
  private async validateSystem(): Promise<void> {
    this.outputService.printSection('System Validation');
    this.outputService.printProgress('Checking system requirements');

    const systemResult = await this.validationService.validateSystemRequirements();
    
    if (!systemResult.isValid) {
      this.outputService.clearLine();
      systemResult.errors.forEach(error => {
        this.outputService.log(LogLevel.ERROR, error);
      });
      throw new DeploymentError('System validation failed', 'SYSTEM_VALIDATION_FAILED');
    }

    this.outputService.printProgressComplete('System requirements validated');

    // Check dependencies and display status
    const dependencies = await this.systemService.checkDependencies();
    
    this.outputService.log(LogLevel.SUCCESS, 'Nginx detected and available');
    
    if (dependencies.certbot) {
      this.outputService.log(LogLevel.SUCCESS, 'Certbot detected and available for SSL setup');
    } else {
      this.outputService.log(LogLevel.WARNING, 'Certbot not found - SSL setup will be skipped');
    }
  }

  /**
   * Gets configuration from user input
   */
  private async getUserConfiguration(): Promise<DeploymentConfig> {
    this.outputService.printSection('Configuration');
    return await this.promptService.getDeploymentConfig();
  }

  /**
   * Processes and validates configuration
   */
  private async processConfiguration(config: DeploymentConfig): Promise<ProcessedConfig> {
    this.outputService.printProgress('Processing configuration');

    const validationResult = await this.validationService.validatePreDeployment(config);
    
    if (!validationResult.isValid || !validationResult.processedConfig) {
      this.outputService.clearLine();
      validationResult.errors.forEach(error => {
        this.outputService.log(LogLevel.ERROR, error);
      });
      throw new DeploymentError('Configuration validation failed', 'CONFIG_VALIDATION_FAILED');
    }

    this.outputService.printProgressComplete('Configuration processed and validated');
    
    return validationResult.processedConfig;
  }

  /**
   * Confirms deployment with user
   */
  private async confirmDeployment(config: ProcessedConfig): Promise<void> {
    this.outputService.printConfigPreview(
      config.cleanProjectName,
      config.domainName,
      config.portNumber,
      config.upstreamName
    );

    const confirmed = await this.promptService.confirmDeployment();
    
    if (!confirmed) {
      this.outputService.log(LogLevel.WARNING, 'Deployment cancelled by user');
      process.exit(0);
    }
  }

  /**
   * Handles existing site configuration
   */
  private async handleExistingSite(config: ProcessedConfig): Promise<void> {
    const siteExists = await this.nginxService.siteExists(config.cleanProjectName);
    
    if (siteExists) {
      this.outputService.log(LogLevel.WARNING, `Site configuration already exists: ${config.cleanProjectName}`);
      
      const overwrite = await this.promptService.confirmOverwrite();
      if (!overwrite) {
        this.outputService.log(LogLevel.WARNING, 'Deployment cancelled by user');
        process.exit(0);
      }
      
      this.outputService.log(LogLevel.INFO, 'Will overwrite existing configuration');
    }
  }

  /**
   * Executes the main deployment process
   */
  private async executeDeployment(config: ProcessedConfig): Promise<DeploymentSummary> {
    this.outputService.printSection('Deployment');

    let siteConfigPath = '';
    let rollbackNeeded = false;

    try {
      // Generate and create nginx configuration
      this.outputService.printProgress('Creating nginx configuration');
      const createResult = await this.nginxService.createConfiguration(config);
      
      if (!createResult.success) {
        throw new DeploymentError(createResult.error || 'Failed to create configuration', 'CONFIG_CREATION_FAILED');
      }

      siteConfigPath = this.nginxService.getSitePaths(config.cleanProjectName).configPath;
      rollbackNeeded = true;

      this.outputService.printProgressComplete('Nginx configuration created');

      // Enable the site
      this.outputService.printProgress('Enabling site');
      const enableResult = await this.nginxService.enableSite(config.cleanProjectName);
      
      if (!enableResult.success) {
        throw new DeploymentError(enableResult.error || 'Failed to enable site', 'SITE_ENABLE_FAILED', true);
      }

      this.outputService.printProgressComplete('Site enabled');

      // Test and reload nginx
      this.outputService.printProgress('Testing and reloading nginx');
      
      const testResult = await this.nginxService.testConfiguration();
      if (!testResult.success) {
        throw new DeploymentError(testResult.error || 'Nginx configuration test failed', 'CONFIG_TEST_FAILED', true);
      }

      const reloadResult = await this.nginxService.reloadNginx();
      if (!reloadResult.success) {
        throw new DeploymentError(reloadResult.error || 'Failed to reload nginx', 'NGINX_RELOAD_FAILED', true);
      }

      this.outputService.printProgressComplete('Nginx configuration applied');

      const paths = this.nginxService.getSitePaths(config.cleanProjectName);
      
      return {
        config,
        siteConfigPath: paths.configPath,
        siteEnabledPath: paths.enabledPath,
        sslEnabled: false
      };

    } catch (error) {
      if (rollbackNeeded) {
        await this.rollbackDeployment(config.cleanProjectName, siteConfigPath);
      }
      throw error;
    }
  }

  /**
   * Sets up SSL certificate
   */
  private async setupSSL(config: ProcessedConfig, summary: DeploymentSummary): Promise<void> {
    const certbotAvailable = await this.sslService.isCertbotAvailable();
    
    if (!certbotAvailable) {
      this.outputService.log(LogLevel.WARNING, 'Certbot not available - SSL setup skipped');
      return;
    }

    const setupSSL = await this.promptService.confirmSSLSetup();
    if (!setupSSL) {
      this.outputService.log(LogLevel.INFO, 'SSL setup skipped by user');
      return;
    }

    this.outputService.printSection('SSL Setup');
    this.outputService.printProgress('Setting up SSL certificate');

    try {
      const sslResult = await this.sslService.setupSSLWithAutoEmail(config.domainName);
      
      if (sslResult.success) {
        this.outputService.printProgressComplete('SSL certificate configured successfully');
        summary.sslEnabled = true;
      } else {
        this.outputService.clearLine();
        this.outputService.log(LogLevel.WARNING, `SSL setup failed: ${sslResult.error}`);
        this.outputService.log(LogLevel.INFO, `You can set up SSL manually later: sudo certbot --nginx -d ${config.domainName}`);
      }
    } catch (error) {
      this.outputService.clearLine();
      this.outputService.log(LogLevel.WARNING, 'SSL setup failed or was cancelled');
      this.outputService.log(LogLevel.INFO, `You can set up SSL manually later: sudo certbot --nginx -d ${config.domainName}`);
    }
  }

  /**
   * Displays deployment summary
   */
  private displayDeploymentSummary(summary: DeploymentSummary): void {
    this.outputService.printDeploymentSummary(
      summary.config.cleanProjectName,
      summary.config.domainName,
      summary.config.portNumber,
      summary.siteConfigPath,
      summary.config.cleanProjectName
    );

    if (summary.sslEnabled) {
      this.outputService.newLine();
      this.outputService.log(LogLevel.SUCCESS, '🔒 SSL certificate has been configured');
      this.outputService.log(LogLevel.INFO, `Your site is now available at: https://${summary.config.domainName}`);
    } else {
      this.outputService.newLine();
      this.outputService.log(LogLevel.INFO, `Your site is now available at: http://${summary.config.domainName}`);
    }
  }

  /**
   * Rolls back deployment in case of failure
   */
  private async rollbackDeployment(cleanProjectName: string, siteConfigPath: string): Promise<void> {
    this.outputService.log(LogLevel.ERROR, 'Deployment failed - rolling back changes...');

    try {
      // Remove site from sites-enabled
      await this.nginxService.disableSite(cleanProjectName);
      
      // Remove configuration file if it was created
      if (siteConfigPath) {
        await this.processService.removeFileWithSudo(siteConfigPath);
      }

      this.outputService.log(LogLevel.INFO, 'Rollback completed successfully');
    } catch (error) {
      this.outputService.log(LogLevel.ERROR, `Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.outputService.log(LogLevel.INFO, 'You may need to manually clean up nginx configuration files');
    }
  }

  /**
   * Validates deployment status after completion
   */
  private async validateDeployment(config: ProcessedConfig): Promise<boolean> {
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
    } catch {
      return false;
    }
  }

  /**
   * Removes an existing deployment
   */
  async removeSite(projectName: string): Promise<void> {
    try {
      this.outputService.printHeader('Site Removal');
      
      const cleanProjectName = projectName.toLowerCase().replace(/[^a-zA-Z0-9-]/g, '-');
      
      // Check if site exists
      const siteExists = await this.nginxService.siteExists(cleanProjectName);
      if (!siteExists) {
        this.outputService.log(LogLevel.ERROR, `Site '${cleanProjectName}' does not exist`);
        return;
      }

      // Confirm removal
      const confirmed = await this.promptService.confirm(
        `Are you sure you want to remove site '${cleanProjectName}'? This action cannot be undone.`,
        false
      );

      if (!confirmed) {
        this.outputService.log(LogLevel.INFO, 'Site removal cancelled');
        return;
      }

      // Remove site
      this.outputService.printProgress('Removing site configuration');
      
      const removeResult = await this.nginxService.removeSite(cleanProjectName);
      if (!removeResult.success) {
        throw new DeploymentError(removeResult.error || 'Failed to remove site', 'SITE_REMOVAL_FAILED');
      }

      // Reload nginx
      const reloadResult = await this.nginxService.reloadNginx();
      if (!reloadResult.success) {
        this.outputService.log(LogLevel.WARNING, 'Failed to reload nginx after site removal');
      }

      this.outputService.printProgressComplete('Site removed successfully');
      this.outputService.log(LogLevel.SUCCESS, `Site '${cleanProjectName}' has been removed`);

    } catch (error) {
      ErrorHandler.handle(error);
    }
  }

  /**
   * Lists all managed sites
   */
  async listSites(): Promise<void> {
    try {
      this.outputService.printHeader('Managed Sites');
      
      // This would require implementing a way to track managed sites
      // For now, we'll show available and enabled sites
      
      this.outputService.log(LogLevel.INFO, 'Available sites: /etc/nginx/sites-available/');
      this.outputService.log(LogLevel.INFO, 'Enabled sites: /etc/nginx/sites-enabled/');
      
    } catch (error) {
      ErrorHandler.handle(error);
    }
  }
}