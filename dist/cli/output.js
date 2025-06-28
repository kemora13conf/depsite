"use strict";
// Colored output utilities
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputService = void 0;
const chalk_1 = __importDefault(require("chalk"));
const types_1 = require("../types");
class OutputService {
    /**
     * Logs a message with appropriate color based on level
     */
    log(level, message) {
        const timestamp = new Date().toLocaleTimeString();
        switch (level) {
            case types_1.LogLevel.INFO:
                console.log(chalk_1.default.blue('[INFO]'), message);
                break;
            case types_1.LogLevel.SUCCESS:
                console.log(chalk_1.default.green('[SUCCESS]'), message);
                break;
            case types_1.LogLevel.WARNING:
                console.log(chalk_1.default.yellow('[WARNING]'), message);
                break;
            case types_1.LogLevel.ERROR:
                console.log(chalk_1.default.red('[ERROR]'), message);
                break;
            default:
                console.log(message);
        }
    }
    /**
     * Prints application header
     */
    printHeader(title) {
        const line = '='.repeat(48);
        console.log(line);
        console.log(chalk_1.default.bold.cyan(`         ${title}`));
        console.log(line);
        console.log();
    }
    /**
     * Prints a section separator
     */
    printSection(title) {
        console.log();
        console.log(chalk_1.default.bold.magenta(`--- ${title} ---`));
        console.log();
    }
    /**
     * Prints deployment summary
     */
    printDeploymentSummary(projectName, domainName, portNumber, siteConfig, cleanProjectName) {
        console.log();
        console.log('================================================');
        this.log(types_1.LogLevel.SUCCESS, 'Deployment completed successfully!');
        console.log('================================================');
        console.log();
        console.log(chalk_1.default.bold('Site Details:'));
        console.log(`  - Project: ${chalk_1.default.cyan(cleanProjectName)}`);
        console.log(`  - Domain: ${chalk_1.default.cyan(domainName)}`);
        console.log(`  - Port: ${chalk_1.default.cyan(portNumber.toString())}`);
        console.log(`  - Config: ${chalk_1.default.cyan(siteConfig)}`);
        console.log(`  - Enabled: ${chalk_1.default.cyan(`/etc/nginx/sites-enabled/${cleanProjectName}`)}`);
        console.log();
        console.log(chalk_1.default.bold('Next steps:'));
        console.log(`  1. Make sure your Node.js app is running on port ${chalk_1.default.yellow(portNumber.toString())}`);
        console.log(`  2. Test your site: ${chalk_1.default.green(`curl -I http://${domainName}`)}`);
        console.log(`  3. Check nginx logs: ${chalk_1.default.green('sudo tail -f /var/log/nginx/access.log')}`);
        console.log();
        console.log(chalk_1.default.bold('Useful commands:'));
        console.log(`  - Disable site: ${chalk_1.default.yellow(`sudo rm /etc/nginx/sites-enabled/${cleanProjectName} && sudo systemctl reload nginx`)}`);
        console.log(`  - Edit config: ${chalk_1.default.yellow(`sudo nano ${siteConfig}`)}`);
        console.log(`  - Test config: ${chalk_1.default.yellow('sudo nginx -t')}`);
        console.log(`  - Reload nginx: ${chalk_1.default.yellow('sudo systemctl reload nginx')}`);
    }
    /**
     * Prints configuration preview
     */
    printConfigPreview(projectName, domainName, portNumber, upstreamName) {
        console.log();
        this.log(types_1.LogLevel.INFO, `Project: ${projectName}`);
        this.log(types_1.LogLevel.INFO, `Domain: ${domainName}`);
        this.log(types_1.LogLevel.INFO, `Port: ${portNumber}`);
        this.log(types_1.LogLevel.INFO, `Upstream: ${upstreamName}`);
    }
    /**
     * Prints a simple message without formatting
     */
    print(message) {
        console.log(message);
    }
    /**
     * Prints an empty line
     */
    newLine() {
        console.log();
    }
    /**
     * Prints progress indicator
     */
    printProgress(message) {
        process.stdout.write(chalk_1.default.blue(`[PROGRESS] ${message}...`));
    }
    /**
     * Clears the current line (useful after printProgress)
     */
    clearLine() {
        process.stdout.write('\r\x1b[K');
    }
    /**
     * Prints success on the same line (after printProgress)
     */
    printProgressComplete(message = 'Done') {
        this.clearLine();
        this.log(types_1.LogLevel.SUCCESS, message);
    }
}
exports.OutputService = OutputService;
//# sourceMappingURL=output.js.map