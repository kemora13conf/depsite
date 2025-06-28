// System checks and file operations

import { access, constants } from 'fs/promises';
import { SystemDependencies, SystemError } from '../types';
import { ProcessService } from './process.service';
import { COMMANDS, ERROR_MESSAGES } from '../config/constants';

export class SystemService {
  constructor(private processService: ProcessService) {}

  /**
   * Checks if running as root user
   */
  checkRootUser(): void {
    if (process.getuid && process.getuid() === 0) {
      throw new SystemError(ERROR_MESSAGES.ROOT_USER);
    }
  }

  /**
   * Checks system dependencies (nginx, certbot)
   */
  async checkDependencies(): Promise<SystemDependencies> {
    const nginx = await this.processService.commandExists('nginx');
    const certbot = await this.processService.commandExists('certbot');

    if (!nginx) {
      throw new SystemError(ERROR_MESSAGES.NGINX_NOT_FOUND);
    }

    return { nginx, certbot };
  }

  /**
   * Checks system dependencies synchronously
   */
  checkDependenciesSync(): SystemDependencies {
    const nginx = this.processService.commandExistsSync('nginx');
    const certbot = this.processService.commandExistsSync('certbot');

    if (!nginx) {
      throw new SystemError(ERROR_MESSAGES.NGINX_NOT_FOUND);
    }

    return { nginx, certbot };
  }

  /**
   * Checks if a file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await access(filePath, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks if a file is readable
   */
  async isFileReadable(filePath: string): Promise<boolean> {
    try {
      await access(filePath, constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks if a file is writable
   */
  async isFileWritable(filePath: string): Promise<boolean> {
    try {
      await access(filePath, constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates system requirements before deployment
   */
  async validateSystemRequirements(): Promise<SystemDependencies> {
    // Check if running as root
    this.checkRootUser();

    // Check dependencies
    const dependencies = await this.checkDependencies();

    return dependencies;
  }

  /**
   * Gets system information
   */
  async getSystemInfo(): Promise<{
    platform: string;
    arch: string;
    nodeVersion: string;
    nginxVersion?: string;
    certbotVersion?: string;
  }> {
    const systemInfo = {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      nginxVersion: undefined as string | undefined,
      certbotVersion: undefined as string | undefined
    };

    try {
      const nginxVersion = await this.processService.getCommandOutput('nginx -v 2>&1');
      systemInfo.nginxVersion = nginxVersion;
    } catch {
      // Nginx version not available
    }

    try {
      const certbotVersion = await this.processService.getCommandOutput('certbot --version');
      systemInfo.certbotVersion = certbotVersion;
    } catch {
      // Certbot version not available
    }

    return systemInfo;
  }

  /**
   * Checks if nginx service is running
   */
  async isNginxRunning(): Promise<boolean> {
    try {
      await this.processService.executeCommand('sudo systemctl is-active --quiet nginx');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks nginx configuration syntax
   */
  async checkNginxSyntax(): Promise<boolean> {
    try {
      await this.processService.executeCommand(COMMANDS.NGINX.TEST);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets available disk space in the nginx configuration directory
   */
  async getAvailableDiskSpace(): Promise<number> {
    try {
      const output = await this.processService.getCommandOutput('df /etc/nginx --output=avail --no-sync -B1');
      const lines = output.split('\n');
      const availableBytes = parseInt(lines[1].trim(), 10);
      return availableBytes;
    } catch {
      return 0;
    }
  }

  /**
   * Validates that the system has enough resources for deployment
   */
  async validateSystemResources(): Promise<void> {
    const availableSpace = await this.getAvailableDiskSpace();
    const requiredSpace = 1024; // 1KB minimum for config files

    if (availableSpace < requiredSpace) {
      throw new SystemError('Insufficient disk space for nginx configuration');
    }

    const isNginxRunning = await this.isNginxRunning();
    if (!isNginxRunning) {
      throw new SystemError('Nginx service is not running');
    }
  }
}