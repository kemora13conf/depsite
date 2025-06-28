// CLI entry point

import { DeploymentOrchestrator } from '../core/deployer';
import { OutputService } from './output';
import { ErrorHandler } from '../utils/error-handler';
import { LogLevel } from '../types';
import { APP_CONFIG } from '../config/constants';

export class CLI {
  private outputService: OutputService;
  private deployer: DeploymentOrchestrator;

  constructor() {
    this.outputService = new OutputService();
    this.deployer = new DeploymentOrchestrator();
  }

  /**
   * Main CLI entry point
   */
  async run(args: string[] = process.argv): Promise<void> {
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
            this.outputService.log(LogLevel.ERROR, 'Please specify a project name to remove');
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
          this.outputService.log(LogLevel.ERROR, `Unknown command: ${command}`);
          this.printUsage();
          process.exit(1);
      }
    } catch (error) {
      ErrorHandler.handle(error);
    }
  }

  /**
   * Prints usage information
   */
  private printUsage(): void {
    console.log();
    console.log(`${APP_CONFIG.NAME} v${APP_CONFIG.VERSION} - ${APP_CONFIG.DESCRIPTION}`);
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
  private printVersion(): void {
    console.log(`${APP_CONFIG.NAME} v${APP_CONFIG.VERSION}`);
  }

  /**
   * Handles process signals for graceful shutdown
   */
  setupSignalHandlers(): void {
    process.on('SIGINT', () => {
      this.outputService.newLine();
      this.outputService.log(LogLevel.WARNING, 'Deployment interrupted by user');
      process.exit(130);
    });

    process.on('SIGTERM', () => {
      this.outputService.newLine();
      this.outputService.log(LogLevel.WARNING, 'Deployment terminated');
      process.exit(143);
    });

    process.on('uncaughtException', (error) => {
      this.outputService.log(LogLevel.ERROR, 'Uncaught exception occurred');
      console.error(error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.outputService.log(LogLevel.ERROR, 'Unhandled promise rejection');
      console.error('Promise:', promise);
      console.error('Reason:', reason);
      process.exit(1);
    });
  }
}