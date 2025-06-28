"use strict";
// CLI entry point
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLI = void 0;
const deployer_1 = require("../core/deployer");
const output_1 = require("./output");
const error_handler_1 = require("../utils/error-handler");
const types_1 = require("../types");
const constants_1 = require("../config/constants");
class CLI {
    constructor() {
        this.outputService = new output_1.OutputService();
        this.deployer = new deployer_1.DeploymentOrchestrator();
    }
    /**
     * Main CLI entry point
     */
    async run(args = process.argv) {
        try {
            const command = args[2]; // First argument after node and script name
            const options = args.slice(3);
            switch (command) {
                case 'deploy':
                case undefined: // Default command
                    await this.deployer.deploy();
                    break;
                case 'remove':
                    if (options.length === 0) {
                        this.outputService.log(types_1.LogLevel.ERROR, 'Please specify a project name to remove');
                        this.printUsage();
                        process.exit(1);
                    }
                    await this.deployer.removeSite(options[0]);
                    break;
                case 'list':
                    await this.deployer.listSites();
                    break;
                case 'help':
                case '--help':
                case '-h':
                    this.printUsage();
                    break;
                case 'version':
                case '--version':
                case '-v':
                    this.printVersion();
                    break;
                default:
                    this.outputService.log(types_1.LogLevel.ERROR, `Unknown command: ${command}`);
                    this.printUsage();
                    process.exit(1);
            }
        }
        catch (error) {
            error_handler_1.ErrorHandler.handle(error);
        }
    }
    /**
     * Prints usage information
     */
    printUsage() {
        console.log();
        console.log(`${constants_1.APP_CONFIG.NAME} v${constants_1.APP_CONFIG.VERSION} - ${constants_1.APP_CONFIG.DESCRIPTION}`);
        console.log();
        console.log('Usage:');
        console.log('  depsite [command] [options]');
        console.log();
        console.log('Commands:');
        console.log('  deploy             Deploy a new nginx site configuration (default)');
        console.log('  remove <project>   Remove an existing site configuration');
        console.log('  list               List all managed sites');
        console.log('  help               Show this help message');
        console.log('  version            Show version information');
        console.log();
        console.log('Examples:');
        console.log('  depsite                    # Start interactive deployment');
        console.log('  depsite deploy             # Same as above');
        console.log('  depsite remove my-api      # Remove site configuration for "my-api"');
        console.log('  depsite list               # List all managed sites');
        console.log();
        console.log('Options:');
        console.log('  -h, --help        Show help');
        console.log('  -v, --version     Show version');
        console.log();
    }
    /**
     * Prints version information
     */
    printVersion() {
        console.log(`${constants_1.APP_CONFIG.NAME} v${constants_1.APP_CONFIG.VERSION}`);
    }
    /**
     * Handles process signals for graceful shutdown
     */
    setupSignalHandlers() {
        process.on('SIGINT', () => {
            this.outputService.newLine();
            this.outputService.log(types_1.LogLevel.WARNING, 'Deployment interrupted by user');
            process.exit(130);
        });
        process.on('SIGTERM', () => {
            this.outputService.newLine();
            this.outputService.log(types_1.LogLevel.WARNING, 'Deployment terminated');
            process.exit(143);
        });
        process.on('uncaughtException', (error) => {
            this.outputService.log(types_1.LogLevel.ERROR, 'Uncaught exception occurred');
            console.error(error);
            process.exit(1);
        });
        process.on('unhandledRejection', (reason, promise) => {
            this.outputService.log(types_1.LogLevel.ERROR, 'Unhandled promise rejection');
            console.error('Promise:', promise);
            console.error('Reason:', reason);
            process.exit(1);
        });
    }
}
exports.CLI = CLI;
//# sourceMappingURL=index.js.map