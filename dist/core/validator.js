"use strict";
// Input and system validation
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationService = void 0;
const sanitizer_1 = require("../utils/sanitizer");
const constants_1 = require("../config/constants");
class ValidationService {
    constructor(systemService, nginxService) {
        this.systemService = systemService;
        this.nginxService = nginxService;
    }
    /**
     * Validates deployment configuration
     */
    async validateDeploymentConfig(config) {
        const errors = [];
        // Validate project name
        const projectNameResult = this.validateProjectName(config.projectName);
        if (!projectNameResult.isValid) {
            errors.push(...projectNameResult.errors);
        }
        // Validate domain name
        const domainResult = this.validateDomainName(config.domainName);
        if (!domainResult.isValid) {
            errors.push(...domainResult.errors);
        }
        // Validate port number
        const portResult = this.validatePortNumber(config.portNumber);
        if (!portResult.isValid) {
            errors.push(...portResult.errors);
        }
        // Check for port conflicts
        const portConflictResult = await this.checkPortConflicts(config.portNumber);
        if (!portConflictResult.isValid) {
            errors.push(...portConflictResult.errors);
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Validates system requirements
     */
    async validateSystemRequirements() {
        const errors = [];
        try {
            // Check system dependencies
            await this.systemService.validateSystemRequirements();
            // Check system resources
            await this.systemService.validateSystemResources();
        }
        catch (error) {
            if (error instanceof Error) {
                errors.push(error.message);
            }
            else {
                errors.push('Unknown system validation error');
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Validates project name
     */
    validateProjectName(projectName) {
        const errors = [];
        if (!projectName || typeof projectName !== 'string') {
            errors.push('Project name is required');
            return { isValid: false, errors };
        }
        const trimmed = projectName.trim();
        if (trimmed.length < constants_1.VALIDATION_RULES.PROJECT_NAME.MIN_LENGTH) {
            errors.push(`Project name must be at least ${constants_1.VALIDATION_RULES.PROJECT_NAME.MIN_LENGTH} character(s)`);
        }
        if (trimmed.length > constants_1.VALIDATION_RULES.PROJECT_NAME.MAX_LENGTH) {
            errors.push(`Project name must be no more than ${constants_1.VALIDATION_RULES.PROJECT_NAME.MAX_LENGTH} characters`);
        }
        if (!constants_1.VALIDATION_RULES.PROJECT_NAME.ALLOWED_CHARS.test(trimmed)) {
            errors.push(constants_1.ERROR_MESSAGES.INVALID_PROJECT_NAME);
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Validates domain name
     */
    validateDomainName(domainName) {
        const errors = [];
        if (!domainName || typeof domainName !== 'string') {
            errors.push('Domain name is required');
            return { isValid: false, errors };
        }
        const trimmed = domainName.trim();
        if (trimmed.length < constants_1.VALIDATION_RULES.DOMAIN_NAME.MIN_LENGTH) {
            errors.push(`Domain name must be at least ${constants_1.VALIDATION_RULES.DOMAIN_NAME.MIN_LENGTH} characters`);
        }
        if (trimmed.length > constants_1.VALIDATION_RULES.DOMAIN_NAME.MAX_LENGTH) {
            errors.push(`Domain name must be no more than ${constants_1.VALIDATION_RULES.DOMAIN_NAME.MAX_LENGTH} characters`);
        }
        if (!constants_1.VALIDATION_RULES.DOMAIN_NAME.PATTERN.test(trimmed)) {
            errors.push(constants_1.ERROR_MESSAGES.INVALID_DOMAIN_NAME);
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Validates port number
     */
    validatePortNumber(portNumber) {
        const errors = [];
        if (typeof portNumber !== 'number' || isNaN(portNumber)) {
            errors.push('Port number must be a valid number');
            return { isValid: false, errors };
        }
        if (portNumber < constants_1.VALIDATION_RULES.PORT_NUMBER.MIN || portNumber > constants_1.VALIDATION_RULES.PORT_NUMBER.MAX) {
            errors.push(constants_1.ERROR_MESSAGES.INVALID_PORT_NUMBER);
        }
        if (constants_1.VALIDATION_RULES.PORT_NUMBER.RESERVED_PORTS.includes(portNumber)) {
            errors.push(constants_1.ERROR_MESSAGES.RESERVED_PORT);
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Checks for port conflicts with existing services
     */
    async checkPortConflicts(portNumber) {
        const errors = [];
        try {
            // Check if port is available by trying to connect to it
            const isPortInUse = await this.systemService.checkPortInUse(portNumber);
            if (!isPortInUse) {
                errors.push(`No service is running on port ${portNumber}. Please ensure your Node.js application is running on this port before deploying.`);
            }
        }
        catch (error) {
            // Port checking failed, add warning
            errors.push(`Warning: Could not verify if port ${portNumber} is in use. Please ensure your Node.js application is running.`);
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Validates that site doesn't already exist
     */
    async validateSiteDoesNotExist(cleanProjectName) {
        const errors = [];
        const siteExists = await this.nginxService.siteExists(cleanProjectName);
        if (siteExists) {
            errors.push(constants_1.ERROR_MESSAGES.SITE_EXISTS);
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Processes and validates complete deployment configuration
     */
    async processAndValidateConfig(config) {
        // First validate the basic configuration
        const validationResult = await this.validateDeploymentConfig(config);
        if (!validationResult.isValid) {
            throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
        }
        // Sanitize and process the configuration
        const cleanProjectName = sanitizer_1.InputSanitizer.sanitizeProjectName(config.projectName);
        const sanitizedDomain = sanitizer_1.InputSanitizer.sanitizeDomainName(config.domainName);
        const sanitizedPort = sanitizer_1.InputSanitizer.sanitizePortNumber(config.portNumber);
        const upstreamName = sanitizer_1.InputSanitizer.generateUpstreamName(config.projectName);
        return {
            ...config,
            domainName: sanitizedDomain,
            portNumber: sanitizedPort,
            cleanProjectName,
            upstreamName
        };
    }
    /**
     * Validates nginx configuration syntax
     */
    async validateNginxConfig() {
        const errors = [];
        const isValid = await this.systemService.checkNginxSyntax();
        if (!isValid) {
            errors.push(constants_1.ERROR_MESSAGES.CONFIG_TEST_FAILED);
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Comprehensive pre-deployment validation
     */
    async validatePreDeployment(config) {
        const allErrors = [];
        // Validate system requirements
        const systemResult = await this.validateSystemRequirements();
        if (!systemResult.isValid) {
            allErrors.push(...systemResult.errors);
        }
        // Process and validate configuration
        let processedConfig;
        try {
            processedConfig = await this.processAndValidateConfig(config);
            // Check if site already exists
            const siteExistsResult = await this.validateSiteDoesNotExist(processedConfig.cleanProjectName);
            if (!siteExistsResult.isValid) {
                allErrors.push(...siteExistsResult.errors);
            }
        }
        catch (error) {
            if (error instanceof Error) {
                allErrors.push(error.message);
            }
            else {
                allErrors.push('Configuration processing failed');
            }
        }
        return {
            isValid: allErrors.length === 0,
            errors: allErrors,
            processedConfig
        };
    }
    /**
     * Validates individual field values with detailed feedback
     */
    validateField(fieldName, value) {
        switch (fieldName) {
            case 'projectName':
                return this.validateProjectName(value);
            case 'domainName':
                return this.validateDomainName(value);
            case 'portNumber':
                return this.validatePortNumber(value);
            default:
                return {
                    isValid: false,
                    errors: [`Unknown field: ${fieldName}`]
                };
        }
    }
}
exports.ValidationService = ValidationService;
//# sourceMappingURL=validator.js.map