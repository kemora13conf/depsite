// Error handling utilities

import { DeploymentError, SystemError, ValidationError, LogLevel } from '../types';
import { OutputService } from '../cli/output';

export class ErrorHandler {
  private static outputService = new OutputService();

  /**
   * Handles different types of errors and provides appropriate responses
   */
  static handle(error: unknown): never {
    if (error instanceof DeploymentError) {
      this.outputService.log(LogLevel.ERROR, error.message);
      if (error.rollback) {
        this.outputService.log(LogLevel.INFO, 'Attempting rollback...');
      }
      process.exit(1);
    }

    if (error instanceof ValidationError) {
      this.outputService.log(LogLevel.ERROR, `Validation Error: ${error.message}`);
      if (error.field) {
        this.outputService.log(LogLevel.INFO, `Field: ${error.field}`);
      }
      process.exit(1);
    }

    if (error instanceof SystemError) {
      this.outputService.log(LogLevel.ERROR, `System Error: ${error.message}`);
      if (error.command) {
        this.outputService.log(LogLevel.INFO, `Command: ${error.command}`);
      }
      process.exit(1);
    }

    if (error instanceof Error) {
      this.outputService.log(LogLevel.ERROR, `Unexpected Error: ${error.message}`);
      console.error(error.stack);
      process.exit(1);
    }

    this.outputService.log(LogLevel.ERROR, 'Unknown error occurred');
    console.error(error);
    process.exit(1);
  }

  /**
   * Wraps async functions with error handling
   */
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    errorMessage?: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (errorMessage) {
        throw new DeploymentError(errorMessage, 'OPERATION_FAILED');
      }
      throw error;
    }
  }

  /**
   * Creates a deployment error with rollback flag
   */
  static createDeploymentError(
    message: string,
    code: string,
    rollback: boolean = false
  ): DeploymentError {
    return new DeploymentError(message, code, rollback);
  }

  /**
   * Creates a validation error
   */
  static createValidationError(message: string, field?: string): ValidationError {
    return new ValidationError(message, field);
  }

  /**
   * Creates a system error
   */
  static createSystemError(message: string, command?: string): SystemError {
    return new SystemError(message, command);
  }

  /**
   * Validates that a condition is true, throws ValidationError if false
   */
  static assert(condition: boolean, message: string, field?: string): void {
    if (!condition) {
      throw new ValidationError(message, field);
    }
  }

  /**
   * Safely executes a function and returns a result or error
   */
  static safeExecute<T>(
    operation: () => T,
    fallback?: T
  ): { success: boolean; data?: T; error?: Error } {
    try {
      const data = operation();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        data: fallback, 
        error: error instanceof Error ? error : new Error(String(error)) 
      };
    }
  }
}