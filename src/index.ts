#!/usr/bin/env node

import { exec, execSync } from 'child_process';
import { promisify } from 'util';
import { access, constants } from 'fs/promises';
import chalk from 'chalk';
import inquirer from 'inquirer';

const execAsync = promisify(exec);

interface DeploymentConfig {
  projectName: string;
  domainName: string;
  portNumber: number;
}

class NginxSiteDeployer {
  private certbotAvailable: boolean = false;

  constructor() {
    this.checkDependencies();
  }

  // Colored output functions
  private printStatus(message: string): void {
    console.log(chalk.blue('[INFO]'), message);
  }

  private printSuccess(message: string): void {
    console.log(chalk.green('[SUCCESS]'), message);
  }

  private printWarning(message: string): void {
    console.log(chalk.yellow('[WARNING]'), message);
  }

  private printError(message: string): void {
    console.log(chalk.red('[ERROR]'), message);
  }

  // Check if running as root
  private checkRootUser(): void {
    if (process.getuid && process.getuid() === 0) {
      this.printError('This script should not be run as root. Use sudo when needed.');
      process.exit(1);
    }
  }

  // Check dependencies
  private checkDependencies(): void {
    this.checkRootUser();

    try {
      execSync('which nginx', { stdio: 'ignore' });
    } catch {
      this.printError('Nginx is not installed. Please install nginx first.');
      process.exit(1);
    }

    try {
      execSync('which certbot', { stdio: 'ignore' });
      this.certbotAvailable = true;
    } catch {
      this.printWarning('Certbot is not installed. SSL setup will be skipped.');
      this.certbotAvailable = false;
    }
  }

  // Get user input
  private async getUserInput(): Promise<DeploymentConfig> {
    console.log('================================================');
    console.log('         Nginx Site Deployment Script');
    console.log('================================================');
    console.log();

    const projectName = await inquirer.prompt({
      type: 'input',
      name: 'value',
      message: 'Enter the project name (e.g., hrayfi-api):',
      validate: (input: string) => input.trim() !== '' || 'Project name is required'
    });

    const domainName = await inquirer.prompt({
      type: 'input',
      name: 'value',
      message: 'Enter the domain name (e.g., hrayfi-api.reacture.dev):',
      validate: (input: string) => input.trim() !== '' || 'Domain name is required'
    });

    const portNumber = await inquirer.prompt({
      type: 'input',
      name: 'value',
      message: 'Enter the port number (e.g., 3101):',
      validate: (input: string) => {
        const port = parseInt(input);
        if (isNaN(port)) return 'Port must be a number';
        if (port < 1 || port > 65535) return 'Port must be between 1 and 65535';
        return true;
      }
    });

    return {
      projectName: projectName.value,
      domainName: domainName.value,
      portNumber: parseInt(portNumber.value)
    };
  }

  // Sanitize project name
  private sanitizeProjectName(name: string): string {
    return name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
  }

  // Generate nginx configuration
  private generateNginxConfig(config: DeploymentConfig, cleanProjectName: string): string {
    const upstreamName = `${cleanProjectName}_prod`;
    
    return `# Upstream for ${config.projectName} Production
upstream ${upstreamName} {
    ip_hash;
    server 127.0.0.1:${config.portNumber};
}

# HTTP Server Block
server {
    listen 80;
    server_name ${config.domainName};

    client_max_body_size 20M;
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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}`;
  }

  // Check if site already exists
  private async checkSiteExists(cleanProjectName: string): Promise<boolean> {
    const siteConfig = `/etc/nginx/sites-available/${cleanProjectName}`;
    try {
      await access(siteConfig, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  // Create nginx configuration file
  private async createNginxConfig(config: DeploymentConfig, cleanProjectName: string): Promise<string> {
    const siteConfig = `/etc/nginx/sites-available/${cleanProjectName}`;
    const nginxConfig = this.generateNginxConfig(config, cleanProjectName);

    try {
      // Escape single quotes in the config for shell
      const escapedConfig = nginxConfig.replace(/'/g, "'\"'\"'");
      await execAsync(`echo '${escapedConfig}' | sudo tee '${siteConfig}' > /dev/null`);
      this.printSuccess(`Configuration created: ${siteConfig}`);
      return siteConfig;
    } catch (error) {
      this.printError(`Failed to create configuration: ${error}`);
      throw error;
    }
  }

  // Enable the site
  private async enableSite(cleanProjectName: string): Promise<void> {
    this.printStatus('Enabling site...');
    try {
      await execAsync(`sudo ln -sf "/etc/nginx/sites-available/${cleanProjectName}" "/etc/nginx/sites-enabled/"`);
      this.printSuccess('Site enabled');
    } catch (error) {
      this.printError(`Failed to enable site: ${error}`);
      throw error;
    }
  }

  // Test nginx configuration
  private async testNginxConfig(): Promise<void> {
    this.printStatus('Testing nginx configuration...');
    try {
      await execAsync('sudo nginx -t');
      this.printSuccess('Nginx configuration test passed');
    } catch (error) {
      this.printError('Nginx configuration test failed!');
      throw error;
    }
  }

  // Reload nginx
  private async reloadNginx(): Promise<void> {
    this.printStatus('Reloading nginx...');
    try {
      await execAsync('sudo systemctl reload nginx');
      this.printSuccess('Nginx reloaded successfully');
    } catch (error) {
      this.printError('Failed to reload nginx!');
      throw error;
    }
  }

  // Setup SSL with certbot
  private async setupSSL(domainName: string): Promise<void> {
    if (!this.certbotAvailable) {
      this.printWarning('Certbot not available. Install certbot to enable SSL setup.');
      return;
    }

    const setupSSL = await inquirer.prompt({
      type: 'confirm',
      name: 'value',
      message: 'Setup SSL certificate with certbot?',
      default: true
    });

    if (!setupSSL.value) {
      this.printWarning('SSL setup skipped');
      return;
    }

    this.printStatus('Setting up SSL certificate...');
    try {
      await execAsync(`sudo certbot --nginx -d "${domainName}" --non-interactive --agree-tos --redirect`);
      this.printSuccess('SSL certificate setup completed');
    } catch (error) {
      this.printWarning('SSL setup failed or was cancelled. You can run it manually later:');
      console.log(`sudo certbot --nginx -d ${domainName}`);
    }
  }

  // Rollback changes
  private async rollbackChanges(cleanProjectName: string, siteConfig: string): Promise<void> {
    this.printError('Rolling back changes...');
    try {
      await execAsync(`sudo rm -f "/etc/nginx/sites-enabled/${cleanProjectName}"`);
      await execAsync(`sudo rm -f "${siteConfig}"`);
    } catch (error) {
      this.printError(`Failed to rollback: ${error}`);
    }
  }

  // Print final summary
  private printSummary(config: DeploymentConfig, cleanProjectName: string, siteConfig: string): void {
    console.log();
    console.log('================================================');
    this.printSuccess('Deployment completed successfully!');
    console.log('================================================');
    console.log();
    console.log('Site Details:');
    console.log(`  - Project: ${cleanProjectName}`);
    console.log(`  - Domain: ${config.domainName}`);
    console.log(`  - Port: ${config.portNumber}`);
    console.log(`  - Config: ${siteConfig}`);
    console.log(`  - Enabled: /etc/nginx/sites-enabled/${cleanProjectName}`);
    console.log();
    console.log('Next steps:');
    console.log(`  1. Make sure your Node.js app is running on port ${config.portNumber}`);
    console.log(`  2. Test your site: curl -I http://${config.domainName}`);
    console.log(`  3. Check nginx logs: sudo tail -f /var/log/nginx/access.log`);
    console.log();
    console.log('Useful commands:');
    console.log(`  - Disable site: sudo rm /etc/nginx/sites-enabled/${cleanProjectName} && sudo systemctl reload nginx`);
    console.log(`  - Edit config: sudo nano ${siteConfig}`);
    console.log(`  - Test config: sudo nginx -t`);
    console.log(`  - Reload nginx: sudo systemctl reload nginx`);
  }

  // Main deployment function
  public async deploy(): Promise<void> {
    try {
      // Get user input
      const config = await this.getUserInput();
      const cleanProjectName = this.sanitizeProjectName(config.projectName);
      const upstreamName = `${cleanProjectName}_prod`;

      this.printStatus(`Project: ${cleanProjectName}`);
      this.printStatus(`Domain: ${config.domainName}`);
      this.printStatus(`Port: ${config.portNumber}`);
      this.printStatus(`Upstream: ${upstreamName}`);

      // Confirm settings
      console.log();
      const confirm = await inquirer.prompt({
        type: 'confirm',
        name: 'value',
        message: 'Continue with these settings?',
        default: false
      });

      if (!confirm.value) {
        this.printWarning('Deployment cancelled.');
        return;
      }

      // Check if site already exists
      const siteExists = await this.checkSiteExists(cleanProjectName);
      if (siteExists) {
        this.printError(`Site configuration already exists: /etc/nginx/sites-available/${cleanProjectName}`);
        const overwrite = await inquirer.prompt({
          type: 'confirm',
          name: 'value',
          message: 'Overwrite existing configuration?',
          default: false
        });

        if (!overwrite.value) {
          this.printWarning('Deployment cancelled.');
          return;
        }
      }

      // Create nginx configuration
      this.printStatus('Creating nginx configuration...');
      const siteConfig = await this.createNginxConfig(config, cleanProjectName);

      try {
        // Enable the site
        await this.enableSite(cleanProjectName);

        // Test nginx configuration
        await this.testNginxConfig();

        // Reload nginx
        await this.reloadNginx();

        // Setup SSL
        await this.setupSSL(config.domainName);

        // Print summary
        this.printSummary(config, cleanProjectName, siteConfig);

      } catch (error) {
        await this.rollbackChanges(cleanProjectName, siteConfig);
        process.exit(1);
      }

    } catch (error) {
      this.printError(`Deployment failed: ${error}`);
      process.exit(1);
    }
  }
}

// Main execution
if (require.main === module) {
  const deployer = new NginxSiteDeployer();
  deployer.deploy().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

export default NginxSiteDeployer;