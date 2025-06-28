import { DeploymentError, SystemError, ValidationError } from '../types';
export declare class ErrorHandler {
    private static outputService;
    /**
     * Handles different types of errors and provides appropriate responses
     */
    static handle(error: unknown): never;
    /**
     * Wraps async functions with error handling
     */
    static withErrorHandling<T>(operation: () => Promise<T>, errorMessage?: string): Promise<T>;
    /**
     * Creates a deployment error with rollback flag
     */
    static createDeploymentError(message: string, code: string, rollback?: boolean): DeploymentError;
    /**
     * Creates a validation error
     */
    static createValidationError(message: string, field?: string): ValidationError;
    /**
     * Creates a system error
     */
    static createSystemError(message: string, command?: string): SystemError;
    /**
     * Validates that a condition is true, throws ValidationError if false
     */
    static assert(condition: boolean, message: string, field?: string): void;
    /**
     * Safely executes a function and returns a result or error
     */
    static safeExecute<T>(operation: () => T, fallback?: T): {
        success: boolean;
        data?: T;
        error?: Error;
    };
}
//# sourceMappingURL=error-handler.d.ts.map