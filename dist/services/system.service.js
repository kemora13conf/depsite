"use strict";
// System checks and file operations
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemService = void 0;
const promises_1 = require("fs/promises");
const types_1 = require("../types");
const constants_1 = require("../config/constants");
class SystemService {
    constructor(processService) {
        this.processService = processService;
    }
    /**
     * Checks if running as root user
     */
    checkRootUser() {
        if (process.getuid && process.getuid() === 0) {
            throw new types_1.SystemError(constants_1.ERROR_MESSAGES.ROOT_USER);
        }
    }
    /**
     * Checks system dependencies (nginx, certbot)
     */
    async checkDependencies() {
        const nginx = await this.processService.commandExists('nginx');
        const certbot = await this.processService.commandExists('certbot');
        if (!nginx) {
            throw new types_1.SystemError(constants_1.ERROR_MESSAGES.NGINX_NOT_FOUND);
        }
        return { nginx, certbot };
    }
    /**
     * Checks system dependencies synchronously
     */
    checkDependenciesSync() {
        const nginx = this.processService.commandExistsSync('nginx');
        const certbot = this.processService.commandExistsSync('certbot');
        if (!nginx) {
            throw new types_1.SystemError(constants_1.ERROR_MESSAGES.NGINX_NOT_FOUND);
        }
        return { nginx, certbot };
    }
    /**
     * Checks if a file exists
     */
    async fileExists(filePath) {
        try {
            await (0, promises_1.access)(filePath, promises_1.constants.F_OK);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Checks if a file is readable
     */
    async isFileReadable(filePath) {
        try {
            await (0, promises_1.access)(filePath, promises_1.constants.R_OK);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Checks if a file is writable
     */
    async isFileWritable(filePath) {
        try {
            await (0, promises_1.access)(filePath, promises_1.constants.W_OK);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Validates system requirements before deployment
     */
    async validateSystemRequirements() {
        // Check if running as root
        this.checkRootUser();
        // Check dependencies
        const dependencies = await this.checkDependencies();
        return dependencies;
    }
    /**
     * Gets system information
     */
    async getSystemInfo() {
        const systemInfo = {
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            nginxVersion: undefined,
            certbotVersion: undefined
        };
        try {
            const nginxVersion = await this.processService.getCommandOutput('nginx -v 2>&1');
            systemInfo.nginxVersion = nginxVersion;
        }
        catch {
            // Nginx version not available
        }
        try {
            const certbotVersion = await this.processService.getCommandOutput('certbot --version');
            systemInfo.certbotVersion = certbotVersion;
        }
        catch {
            // Certbot version not available
        }
        return systemInfo;
    }
    /**
     * Checks if nginx service is running
     */
    async isNginxRunning() {
        try {
            await this.processService.executeCommand('sudo systemctl is-active --quiet nginx');
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Checks nginx configuration syntax
     */
    async checkNginxSyntax() {
        try {
            await this.processService.executeCommand(constants_1.COMMANDS.NGINX.TEST);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Gets available disk space in the nginx configuration directory
     */
    async getAvailableDiskSpace() {
        try {
            const output = await this.processService.getCommandOutput('df /etc/nginx --output=avail --no-sync -B1');
            const lines = output.split('\n');
            const availableBytes = parseInt(lines[1].trim(), 10);
            return availableBytes;
        }
        catch {
            return 0;
        }
    }
    /**
     * Validates that the system has enough resources for deployment
     */
    async validateSystemResources() {
        const availableSpace = await this.getAvailableDiskSpace();
        const requiredSpace = 1024; // 1KB minimum for config files
        if (availableSpace < requiredSpace) {
            throw new types_1.SystemError('Insufficient disk space for nginx configuration');
        }
        const isNginxRunning = await this.isNginxRunning();
        if (!isNginxRunning) {
            throw new types_1.SystemError('Nginx service is not running');
        }
    }
}
exports.SystemService = SystemService;
//# sourceMappingURL=system.service.js.map