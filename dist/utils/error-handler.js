"use strict";
// Error handling utilities
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const types_1 = require("../types");
const output_1 = require("../cli/output");
class ErrorHandler {
    /**
     * Handles different types of errors and provides appropriate responses
     */
    static handle(error) {
        if (error instanceof types_1.DeploymentError) {
            this.outputService.log(types_1.LogLevel.ERROR, error.message);
            if (error.rollback) {
                this.outputService.log(types_1.LogLevel.INFO, 'Attempting rollback...');
            }
            process.exit(1);
        }
        if (error instanceof types_1.ValidationError) {
            this.outputService.log(types_1.LogLevel.ERROR, `Validation Error: ${error.message}`);
            if (error.field) {
                this.outputService.log(types_1.LogLevel.INFO, `Field: ${error.field}`);
            }
            process.exit(1);
        }
        if (error instanceof types_1.SystemError) {
            this.outputService.log(types_1.LogLevel.ERROR, `System Error: ${error.message}`);
            if (error.command) {
                this.outputService.log(types_1.LogLevel.INFO, `Command: ${error.command}`);
            }
            process.exit(1);
        }
        if (error instanceof Error) {
            this.outputService.log(types_1.LogLevel.ERROR, `Unexpected Error: ${error.message}`);
            console.error(error.stack);
            process.exit(1);
        }
        this.outputService.log(types_1.LogLevel.ERROR, 'Unknown error occurred');
        console.error(error);
        process.exit(1);
    }
    /**
     * Wraps async functions with error handling
     */
    static async withErrorHandling(operation, errorMessage) {
        try {
            return await operation();
        }
        catch (error) {
            if (errorMessage) {
                throw new types_1.DeploymentError(errorMessage, 'OPERATION_FAILED');
            }
            throw error;
        }
    }
    /**
     * Creates a deployment error with rollback flag
     */
    static createDeploymentError(message, code, rollback = false) {
        return new types_1.DeploymentError(message, code, rollback);
    }
    /**
     * Creates a validation error
     */
    static createValidationError(message, field) {
        return new types_1.ValidationError(message, field);
    }
    /**
     * Creates a system error
     */
    static createSystemError(message, command) {
        return new types_1.SystemError(message, command);
    }
    /**
     * Validates that a condition is true, throws ValidationError if false
     */
    static assert(condition, message, field) {
        if (!condition) {
            throw new types_1.ValidationError(message, field);
        }
    }
    /**
     * Safely executes a function and returns a result or error
     */
    static safeExecute(operation, fallback) {
        try {
            const data = operation();
            return { success: true, data };
        }
        catch (error) {
            return {
                success: false,
                data: fallback,
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }
}
exports.ErrorHandler = ErrorHandler;
ErrorHandler.outputService = new output_1.OutputService();
//# sourceMappingURL=error-handler.js.map