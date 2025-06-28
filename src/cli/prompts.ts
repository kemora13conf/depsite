// User input prompts

import inquirer from 'inquirer';
import { DeploymentConfig, PromptConfig, ValidationError } from '../types';
import { VALIDATION_RULES } from '../config/constants';
import { InputSanitizer } from '../utils/sanitizer';

export class PromptService {
  /**
   * Gets deployment configuration from user input
   */
  async getDeploymentConfig(): Promise<DeploymentConfig> {
    const projectName = await this.promptProjectName();
    const domainName = await this.promptDomainName();
    const portNumber = await this.promptPortNumber();

    return {
      projectName,
      domainName,
      portNumber
    };
  }

  /**
   * Prompts for project name with validation
   */
  private async promptProjectName(): Promise<string> {
    const answer = await inquirer.prompt({
      type: 'input',
      name: 'value',
      message: 'Enter the project name (e.g., hrayfi-api):',
      validate: (input: string) => this.validateProjectName(input)
    });

    return answer.value.trim();
  }

  /**
   * Prompts for domain name with validation
   */
  private async promptDomainName(): Promise<string> {
    const answer = await inquirer.prompt({
      type: 'input',
      name: 'value',
      message: 'Enter the domain name (e.g., hrayfi-api.reacture.dev):',
      validate: (input: string) => this.validateDomainName(input)
    });

    return answer.value.trim();
  }

  /**
   * Prompts for port number with validation
   */
  private async promptPortNumber(): Promise<number> {
    const answer = await inquirer.prompt({
      type: 'input',
      name: 'value',
      message: 'Enter the port number (e.g., 3101):',
      validate: (input: string) => this.validatePortNumber(input)
    });

    return parseInt(answer.value, 10);
  }

  /**
   * Prompts for confirmation with custom message
   */
  async confirm(message: string, defaultValue: boolean = false): Promise<boolean> {
    const answer = await inquirer.prompt({
      type: 'confirm',
      name: 'value',
      message,
      default: defaultValue
    });

    return answer.value;
  }

  /**
   * Prompts for SSL setup confirmation
   */
  async confirmSSLSetup(): Promise<boolean> {
    return await this.confirm('Setup SSL certificate with certbot?', true);
  }

  /**
   * Prompts for configuration confirmation
   */
  async confirmDeployment(): Promise<boolean> {
    return await this.confirm('Continue with these settings?', false);
  }

  /**
   * Prompts for overwrite confirmation
   */
  async confirmOverwrite(): Promise<boolean> {
    return await this.confirm('Overwrite existing configuration?', false);
  }

  /**
   * Generic prompt method for custom prompts
   */
  async prompt<T = any>(config: PromptConfig): Promise<T> {
    const answer = await inquirer.prompt(config);
    return answer[config.name];
  }

  /**
   * Validates project name
   */
  private validateProjectName(input: string): boolean | string {
    if (!input || input.trim() === '') {
      return 'Project name is required';
    }

    const trimmed = input.trim();
    
    if (trimmed.length < VALIDATION_RULES.PROJECT_NAME.MIN_LENGTH) {
      return `Project name must be at least ${VALIDATION_RULES.PROJECT_NAME.MIN_LENGTH} character(s)`;
    }

    if (trimmed.length > VALIDATION_RULES.PROJECT_NAME.MAX_LENGTH) {
      return `Project name must be no more than ${VALIDATION_RULES.PROJECT_NAME.MAX_LENGTH} characters`;
    }

    if (!VALIDATION_RULES.PROJECT_NAME.ALLOWED_CHARS.test(trimmed)) {
      return 'Project name must contain only letters, numbers, hyphens, and underscores';
    }

    return true;
  }

  /**
   * Validates domain name
   */
  private validateDomainName(input: string): boolean | string {
    if (!input || input.trim() === '') {
      return 'Domain name is required';
    }

    const trimmed = input.trim();
    
    if (trimmed.length < VALIDATION_RULES.DOMAIN_NAME.MIN_LENGTH) {
      return `Domain name must be at least ${VALIDATION_RULES.DOMAIN_NAME.MIN_LENGTH} characters`;
    }

    if (trimmed.length > VALIDATION_RULES.DOMAIN_NAME.MAX_LENGTH) {
      return `Domain name must be no more than ${VALIDATION_RULES.DOMAIN_NAME.MAX_LENGTH} characters`;
    }

    if (!VALIDATION_RULES.DOMAIN_NAME.PATTERN.test(trimmed)) {
      return 'Please enter a valid domain name (e.g., example.com or subdomain.example.com)';
    }

    return true;
  }

  /**
   * Validates port number
   */
  private validatePortNumber(input: string): boolean | string {
    if (!input || input.trim() === '') {
      return 'Port number is required';
    }

    try {
      InputSanitizer.sanitizePortNumber(input);
      return true;
    } catch (error) {
      if (error instanceof ValidationError) {
        return error.message;
      }
      return 'Invalid port number';
    }
  }
}