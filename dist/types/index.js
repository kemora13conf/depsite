"use strict";
// Core types and interfaces
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemError = exports.ValidationError = exports.DeploymentError = exports.LogLevel = void 0;
// Logger levels
var LogLevel;
(function (LogLevel) {
    LogLevel["INFO"] = "info";
    LogLevel["SUCCESS"] = "success";
    LogLevel["WARNING"] = "warning";
    LogLevel["ERROR"] = "error";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
// Application errors
class DeploymentError extends Error {
    constructor(message, code, rollback = false) {
        super(message);
        this.code = code;
        this.rollback = rollback;
        this.name = 'DeploymentError';
    }
}
exports.DeploymentError = DeploymentError;
class ValidationError extends Error {
    constructor(message, field) {
        super(message);
        this.field = field;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class SystemError extends Error {
    constructor(message, command) {
        super(message);
        this.command = command;
        this.name = 'SystemError';
    }
}
exports.SystemError = SystemError;
//# sourceMappingURL=index.js.map