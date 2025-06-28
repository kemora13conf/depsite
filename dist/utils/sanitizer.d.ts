export declare class InputSanitizer {
    /**
     * Sanitizes project name by removing invalid characters and converting to lowercase
     */
    static sanitizeProjectName(name: string): string;
    /**
     * Sanitizes domain name by trimming and converting to lowercase
     */
    static sanitizeDomainName(domain: string): string;
    /**
     * Sanitizes and validates port number
     */
    static sanitizePortNumber(port: string | number): number;
    /**
     * Escapes special characters for shell commands
     */
    static escapeShellString(str: string): string;
    /**
     * Removes potentially dangerous characters from file paths
     */
    static sanitizeFilePath(path: string): string;
    /**
     * Generates upstream name from project name
     */
    static generateUpstreamName(projectName: string): string;
}
//# sourceMappingURL=sanitizer.d.ts.map