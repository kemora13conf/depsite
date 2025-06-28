import { CommandResult } from '../types';
export declare class ProcessService {
    /**
     * Executes a command asynchronously
     */
    executeCommand(command: string): Promise<CommandResult>;
    /**
     * Executes a command synchronously (blocking)
     */
    executeCommandSync(command: string): boolean;
    /**
     * Checks if a command exists in the system
     */
    commandExists(command: string): Promise<boolean>;
    /**
     * Checks if a command exists synchronously
     */
    commandExistsSync(command: string): boolean;
    /**
     * Executes a command with sudo privileges
     */
    executeSudoCommand(command: string): Promise<CommandResult>;
    /**
     * Executes a command and returns only stdout
     */
    getCommandOutput(command: string): Promise<string>;
    /**
     * Writes content to a file using sudo
     */
    writeFileWithSudo(content: string, filePath: string): Promise<void>;
    /**
     * Creates a symbolic link with sudo
     */
    createSymlinkWithSudo(source: string, destination: string): Promise<void>;
    /**
     * Removes a file with sudo
     */
    removeFileWithSudo(filePath: string): Promise<void>;
}
//# sourceMappingURL=process.service.d.ts.map