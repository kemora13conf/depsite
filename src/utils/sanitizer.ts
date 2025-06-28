// Input sanitization utilities

import { VALIDATION_RULES } from '../config/constants';
import { ValidationError } from '../types';

export class InputSanitizer {
  /**
   * Sanitizes project name by removing invalid characters and converting to lowercase
   */
  static sanitizeProjectName(name: string): string {
    if (!name || typeof name !== 'string') {
      throw new ValidationError('Project name must be a non-empty string');
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
  static sanitizeDomainName(domain: string): string {
    if (!domain || typeof domain !== 'string') {
      throw new ValidationError('Domain name must be a non-empty string');
    }

    return domain.trim().toLowerCase();
  }

  /**
   * Sanitizes and validates port number
   */
  static sanitizePortNumber(port: string | number): number {
    const portNum = typeof port === 'string' ? parseInt(port.trim(), 10) : port;

    if (isNaN(portNum)) {
      throw new ValidationError('Port must be a valid number');
    }

    if (portNum < VALIDATION_RULES.PORT_NUMBER.MIN || portNum > VALIDATION_RULES.PORT_NUMBER.MAX) {
      throw new ValidationError(`Port must be between ${VALIDATION_RULES.PORT_NUMBER.MIN} and ${VALIDATION_RULES.PORT_NUMBER.MAX}`);
    }

    if (VALIDATION_RULES.PORT_NUMBER.RESERVED_PORTS.includes(portNum as any)) {
      throw new ValidationError(`Port ${portNum} is reserved for system services`);
    }

    return portNum;
  }

  /**
   * Escapes special characters for shell commands
   */
  static escapeShellString(str: string): string {
    return str.replace(/'/g, "'\"'\"'");
  }

  /**
   * Removes potentially dangerous characters from file paths
   */
  static sanitizeFilePath(path: string): string {
    return path.replace(/[^\w\s\-_./]/gi, '');
  }

  /**
   * Generates upstream name from project name
   */
  static generateUpstreamName(projectName: string): string {
    const cleanName = this.sanitizeProjectName(projectName);
    return `${cleanName}_prod`;
  }
}