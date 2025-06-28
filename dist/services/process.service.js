"use strict";
// Command execution utilities
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessService = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const types_1 = require("../types");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class ProcessService {
    /**
     * Executes a command asynchronously
     */
    async executeCommand(command) {
        try {
            const { stdout, stderr } = await execAsync(command);
            return { stdout, stderr, exitCode: 0 };
        }
        catch (error) {
            throw new types_1.SystemError(`Command failed: ${error.message}`, command);
        }
    }
    /**
     * Executes a command synchronously (blocking)
     */
    executeCommandSync(command) {
        try {
            (0, child_process_1.execSync)(command, { stdio: 'ignore' });
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Checks if a command exists in the system
     */
    async commandExists(command) {
        try {
            await this.executeCommand(`which ${command}`);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Checks if a command exists synchronously
     */
    commandExistsSync(command) {
        return this.executeCommandSync(`which ${command}`);
    }
    /**
     * Executes a command with sudo privileges
     */
    async executeSudoCommand(command) {
        return this.executeCommand(`sudo ${command}`);
    }
    /**
     * Executes a command and returns only stdout
     */
    async getCommandOutput(command) {
        const result = await this.executeCommand(command);
        return result.stdout.trim();
    }
    /**
     * Writes content to a file using sudo
     */
    async writeFileWithSudo(content, filePath) {
        // Escape single quotes in content for shell
        const escapedContent = content.replace(/'/g, "'\"'\"'");
        const command = `echo '${escapedContent}' | sudo tee '${filePath}' > /dev/null`;
        await this.executeCommand(command);
    }
    /**
     * Creates a symbolic link with sudo
     */
    async createSymlinkWithSudo(source, destination) {
        const command = `sudo ln -sf "${source}" "${destination}"`;
        await this.executeCommand(command);
    }
    /**
     * Removes a file with sudo
     */
    async removeFileWithSudo(filePath) {
        const command = `sudo rm -f "${filePath}"`;
        await this.executeCommand(command);
    }
}
exports.ProcessService = ProcessService;
//# sourceMappingURL=process.service.js.map