"use strict";
// User input prompts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptService = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const types_1 = require("../types");
const constants_1 = require("../config/constants");
const sanitizer_1 = require("../utils/sanitizer");
class PromptService {
    /**
     * Gets deployment configuration from user input
     */
    async getDeploymentConfig() {
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
    async promptProjectName() {
        const answer = await inquirer_1.default.prompt({
            type: 'input',
            name: 'value',
            message: 'Enter the project name (e.g., hrayfi-api):',
            validate: (input) => this.validateProjectName(input)
        });
        return answer.value.trim();
    }
    /**
     * Prompts for domain name with validation
     */
    async promptDomainName() {
        const answer = await inquirer_1.default.prompt({
            type: 'input',
            name: 'value',
            message: 'Enter the domain name (e.g., hrayfi-api.reacture.dev):',
            validate: (input) => this.validateDomainName(input)
        });
        return answer.value.trim();
    }
    /**
     * Prompts for port number with validation
     */
    async promptPortNumber() {
        const answer = await inquirer_1.default.prompt({
            type: 'input',
            name: 'value',
            message: 'Enter the port number (e.g., 3101):',
            validate: (input) => this.validatePortNumber(input)
        });
        return parseInt(answer.value, 10);
    }
    /**
     * Prompts for confirmation with custom message
     */
    async confirm(message, defaultValue = false) {
        const answer = await inquirer_1.default.prompt({
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
    async confirmSSLSetup() {
        return await this.confirm('Setup SSL certificate with certbot?', true);
    }
    /**
     * Prompts for configuration confirmation
     */
    async confirmDeployment() {
        return await this.confirm('Continue with these settings?', false);
    }
    /**
     * Prompts for overwrite confirmation
     */
    async confirmOverwrite() {
        return await this.confirm('Overwrite existing configuration?', false);
    }
    /**
     * Generic prompt method for custom prompts
     */
    async prompt(config) {
        const answer = await inquirer_1.default.prompt(config);
        return answer[config.name];
    }
    /**
     * Validates project name
     */
    validateProjectName(input) {
        if (!input || input.trim() === '') {
            return 'Project name is required';
        }
        const trimmed = input.trim();
        if (trimmed.length < constants_1.VALIDATION_RULES.PROJECT_NAME.MIN_LENGTH) {
            return `Project name must be at least ${constants_1.VALIDATION_RULES.PROJECT_NAME.MIN_LENGTH} character(s)`;
        }
        if (trimmed.length > constants_1.VALIDATION_RULES.PROJECT_NAME.MAX_LENGTH) {
            return `Project name must be no more than ${constants_1.VALIDATION_RULES.PROJECT_NAME.MAX_LENGTH} characters`;
        }
        if (!constants_1.VALIDATION_RULES.PROJECT_NAME.ALLOWED_CHARS.test(trimmed)) {
            return 'Project name must contain only letters, numbers, hyphens, and underscores';
        }
        return true;
    }
    /**
     * Validates domain name
     */
    validateDomainName(input) {
        if (!input || input.trim() === '') {
            return 'Domain name is required';
        }
        const trimmed = input.trim();
        if (trimmed.length < constants_1.VALIDATION_RULES.DOMAIN_NAME.MIN_LENGTH) {
            return `Domain name must be at least ${constants_1.VALIDATION_RULES.DOMAIN_NAME.MIN_LENGTH} characters`;
        }
        if (trimmed.length > constants_1.VALIDATION_RULES.DOMAIN_NAME.MAX_LENGTH) {
            return `Domain name must be no more than ${constants_1.VALIDATION_RULES.DOMAIN_NAME.MAX_LENGTH} characters`;
        }
        if (!constants_1.VALIDATION_RULES.DOMAIN_NAME.PATTERN.test(trimmed)) {
            return 'Please enter a valid domain name (e.g., example.com or subdomain.example.com)';
        }
        return true;
    }
    /**
     * Validates port number
     */
    validatePortNumber(input) {
        if (!input || input.trim() === '') {
            return 'Port number is required';
        }
        try {
            sanitizer_1.InputSanitizer.sanitizePortNumber(input);
            return true;
        }
        catch (error) {
            if (error instanceof types_1.ValidationError) {
                return error.message;
            }
            return 'Invalid port number';
        }
    }
}
exports.PromptService = PromptService;
//# sourceMappingURL=prompts.js.map