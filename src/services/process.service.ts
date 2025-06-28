// Command execution utilities

import { exec, execSync } from 'child_process';
import { promisify } from 'util';
import { CommandResult, SystemError } from '../types';

const execAsync = promisify(exec);

export class ProcessService {
  /**
   * Executes a command asynchronously
   */
  async executeCommand(command: string): Promise<CommandResult> {
    try {
      const { stdout, stderr } = await execAsync(command);
      return { stdout, stderr, exitCode: 0 };
    } catch (error: any) {
      throw new SystemError(
        `Command failed: ${error.message}`,
        command
      );
    }
  }

  /**
   * Executes a command synchronously (blocking)
   */
  executeCommandSync(command: string): boolean {
    try {
      execSync(command, { stdio: 'ignore' });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Checks if a command exists in the system
   */
  async commandExists(command: string): Promise<boolean> {
    try {
      await this.executeCommand(`which ${command}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Checks if a command exists synchronously
   */
  commandExistsSync(command: string): boolean {
    return this.executeCommandSync(`which ${command}`);
  }

  /**
   * Executes a command with sudo privileges
   */
  async executeSudoCommand(command: string): Promise<CommandResult> {
    return this.executeCommand(`sudo ${command}`);
  }

  /**
   * Executes a command and returns only stdout
   */
  async getCommandOutput(command: string): Promise<string> {
    const result = await this.executeCommand(command);
    return result.stdout.trim();
  }

  /**
   * Writes content to a file using sudo
   */
  async writeFileWithSudo(content: string, filePath: string): Promise<void> {
    // Escape single quotes in content for shell
    const escapedContent = content.replace(/'/g, "'\"'\"'");
    const command = `echo '${escapedContent}' | sudo tee '${filePath}' > /dev/null`;
    
    await this.executeCommand(command);
  }

  /**
   * Creates a symbolic link with sudo
   */
  async createSymlinkWithSudo(source: string, destination: string): Promise<void> {
    const command = `sudo ln -sf "${source}" "${destination}"`;
    await this.executeCommand(command);
  }

  /**
   * Removes a file with sudo
   */
  async removeFileWithSudo(filePath: string): Promise<void> {
    const command = `sudo rm -f "${filePath}"`;
    await this.executeCommand(command);
  }
}