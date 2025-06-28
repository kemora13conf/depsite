// Colored output utilities

import chalk from 'chalk';
import { LogLevel } from '../types';

export class OutputService {
  /**
   * Logs a message with appropriate color based on level
   */
  log(level: LogLevel, message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    
    switch (level) {
      case LogLevel.INFO:
        console.log(chalk.blue('[INFO]'), message);
        break;
      case LogLevel.SUCCESS:
        console.log(chalk.green('[SUCCESS]'), message);
        break;
      case LogLevel.WARNING:
        console.log(chalk.yellow('[WARNING]'), message);
        break;
      case LogLevel.ERROR:
        console.log(chalk.red('[ERROR]'), message);
        break;
      default:
        console.log(message);
    }
  }

  /**
   * Prints application header
   */
  printHeader(title: string): void {
    const line = '='.repeat(48);
    console.log(line);
    console.log(chalk.bold.cyan(`         ${title}`));
    console.log(line);
    console.log();
  }

  /**
   * Prints a section separator
   */
  printSection(title: string): void {
    console.log();
    console.log(chalk.bold.magenta(`--- ${title} ---`));
    console.log();
  }

  /**
   * Prints deployment summary
   */
  printDeploymentSummary(
    projectName: string,
    domainName: string,
    portNumber: number,
    siteConfig: string,
    cleanProjectName: string
  ): void {
    console.log();
    console.log('================================================');
    this.log(LogLevel.SUCCESS, 'Deployment completed successfully!');
    console.log('================================================');
    console.log();
    
    console.log(chalk.bold('Site Details:'));
    console.log(`  - Project: ${chalk.cyan(cleanProjectName)}`);
    console.log(`  - Domain: ${chalk.cyan(domainName)}`);
    console.log(`  - Port: ${chalk.cyan(portNumber.toString())}`);
    console.log(`  - Config: ${chalk.cyan(siteConfig)}`);
    console.log(`  - Enabled: ${chalk.cyan(`/etc/nginx/sites-enabled/${cleanProjectName}`)}`);
    
    console.log();
    console.log(chalk.bold('Next steps:'));
    console.log(`  1. Make sure your Node.js app is running on port ${chalk.yellow(portNumber.toString())}`);
    console.log(`  2. Test your site: ${chalk.green(`curl -I http://${domainName}`)}`);
    console.log(`  3. Check nginx logs: ${chalk.green('sudo tail -f /var/log/nginx/access.log')}`);
    
    console.log();
    console.log(chalk.bold('Useful commands:'));
    console.log(`  - Disable site: ${chalk.yellow(`sudo rm /etc/nginx/sites-enabled/${cleanProjectName} && sudo systemctl reload nginx`)}`);
    console.log(`  - Edit config: ${chalk.yellow(`sudo nano ${siteConfig}`)}`);
    console.log(`  - Test config: ${chalk.yellow('sudo nginx -t')}`);
    console.log(`  - Reload nginx: ${chalk.yellow('sudo systemctl reload nginx')}`);
  }

  /**
   * Prints configuration preview
   */
  printConfigPreview(
    projectName: string,
    domainName: string,
    portNumber: number,
    upstreamName: string
  ): void {
    console.log();
    this.log(LogLevel.INFO, `Project: ${projectName}`);
    this.log(LogLevel.INFO, `Domain: ${domainName}`);
    this.log(LogLevel.INFO, `Port: ${portNumber}`);
    this.log(LogLevel.INFO, `Upstream: ${upstreamName}`);
  }

  /**
   * Prints a simple message without formatting
   */
  print(message: string): void {
    console.log(message);
  }

  /**
   * Prints an empty line
   */
  newLine(): void {
    console.log();
  }

  /**
   * Prints progress indicator
   */
  printProgress(message: string): void {
    process.stdout.write(chalk.blue(`[PROGRESS] ${message}...`));
  }

  /**
   * Clears the current line (useful after printProgress)
   */
  clearLine(): void {
    process.stdout.write('\r\x1b[K');
  }

  /**
   * Prints success on the same line (after printProgress)
   */
  printProgressComplete(message: string = 'Done'): void {
    this.clearLine();
    this.log(LogLevel.SUCCESS, message);
  }
}