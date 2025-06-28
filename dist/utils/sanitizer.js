"use strict";
// Input sanitization utilities
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputSanitizer = void 0;
const constants_1 = require("../config/constants");
const types_1 = require("../types");
class InputSanitizer {
    /**
     * Sanitizes project name by removing invalid characters and converting to lowercase
     */
    static sanitizeProjectName(name) {
        if (!name || typeof name !== 'string') {
            throw new types_1.ValidationError('Project name must be a non-empty string');
        }
        return name
            .trim()
            .replace(/[^a-zA-Z0-9-_]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '')
            .toLowerCase();
    }
    /**
     * Sanitizes domain name by trimming and converting to lowercase
     */
    static sanitizeDomainName(domain) {
        if (!domain || typeof domain !== 'string') {
            throw new types_1.ValidationError('Domain name must be a non-empty string');
        }
        return domain.trim().toLowerCase();
    }
    /**
     * Sanitizes and validates port number
     */
    static sanitizePortNumber(port) {
        const portNum = typeof port === 'string' ? parseInt(port.trim(), 10) : port;
        if (isNaN(portNum)) {
            throw new types_1.ValidationError('Port must be a valid number');
        }
        if (portNum < constants_1.VALIDATION_RULES.PORT_NUMBER.MIN || portNum > constants_1.VALIDATION_RULES.PORT_NUMBER.MAX) {
            throw new types_1.ValidationError(`Port must be between ${constants_1.VALIDATION_RULES.PORT_NUMBER.MIN} and ${constants_1.VALIDATION_RULES.PORT_NUMBER.MAX}`);
        }
        if (constants_1.VALIDATION_RULES.PORT_NUMBER.RESERVED_PORTS.includes(portNum)) {
            throw new types_1.ValidationError(`Port ${portNum} is reserved for system services`);
        }
        return portNum;
    }
    /**
     * Escapes special characters for shell commands
     */
    static escapeShellString(str) {
        return str.replace(/'/g, "'\"'\"'");
    }
    /**
     * Removes potentially dangerous characters from file paths
     */
    static sanitizeFilePath(path) {
        return path.replace(/[^\w\s\-_./]/gi, '');
    }
    /**
     * Generates upstream name from project name
     */
    static generateUpstreamName(projectName) {
        const cleanName = this.sanitizeProjectName(projectName);
        return `${cleanName}_prod`;
    }
}
exports.InputSanitizer = InputSanitizer;
//# sourceMappingURL=sanitizer.js.map