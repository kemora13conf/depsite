#!/usr/bin/env node
"use strict";
/**
 * DepSite - Nginx Site Deployment Tool
 *
 * A TypeScript CLI tool that automates the deployment of nginx reverse proxy
 * configurations for Node.js applications.
 *
 * Features:
 * - Interactive CLI with colored output
 * - Automatic nginx configuration generation
 * - SSL certificate setup with Certbot
 * - Configuration validation and testing
 * - Automatic rollback on failure
 * - Comprehensive deployment summary
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptService = exports.OutputService = exports.ConfigGenerator = exports.ValidationService = exports.ProcessService = exports.SystemService = exports.SSLService = exports.NginxService = exports.DeploymentOrchestrator = exports.CLI = void 0;
const cli_1 = require("./cli");
// Main execution
async function main() {
    const cli = new cli_1.CLI();
    // Setup signal handlers for graceful shutdown
    cli.setupSignalHandlers();
    // Run the CLI
    await cli.run();
}
// Only run if this file is executed directly
if (require.main === module) {
    main().catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
// Export for potential use as a library
var cli_2 = require("./cli");
Object.defineProperty(exports, "CLI", { enumerable: true, get: function () { return cli_2.CLI; } });
var deployer_1 = require("./core/deployer");
Object.defineProperty(exports, "DeploymentOrchestrator", { enumerable: true, get: function () { return deployer_1.DeploymentOrchestrator; } });
var nginx_service_1 = require("./services/nginx.service");
Object.defineProperty(exports, "NginxService", { enumerable: true, get: function () { return nginx_service_1.NginxService; } });
var ssl_service_1 = require("./services/ssl.service");
Object.defineProperty(exports, "SSLService", { enumerable: true, get: function () { return ssl_service_1.SSLService; } });
var system_service_1 = require("./services/system.service");
Object.defineProperty(exports, "SystemService", { enumerable: true, get: function () { return system_service_1.SystemService; } });
var process_service_1 = require("./services/process.service");
Object.defineProperty(exports, "ProcessService", { enumerable: true, get: function () { return process_service_1.ProcessService; } });
var validator_1 = require("./core/validator");
Object.defineProperty(exports, "ValidationService", { enumerable: true, get: function () { return validator_1.ValidationService; } });
var config_generator_1 = require("./core/config-generator");
Object.defineProperty(exports, "ConfigGenerator", { enumerable: true, get: function () { return config_generator_1.ConfigGenerator; } });
var output_1 = require("./cli/output");
Object.defineProperty(exports, "OutputService", { enumerable: true, get: function () { return output_1.OutputService; } });
var prompts_1 = require("./cli/prompts");
Object.defineProperty(exports, "PromptService", { enumerable: true, get: function () { return prompts_1.PromptService; } });
__exportStar(require("./types"), exports);
__exportStar(require("./config/constants"), exports);
//# sourceMappingURL=index.js.map