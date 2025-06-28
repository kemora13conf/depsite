import { LogLevel } from '../types';
export declare class OutputService {
    /**
     * Logs a message with appropriate color based on level
     */
    log(level: LogLevel, message: string): void;
    /**
     * Prints application header
     */
    printHeader(title: string): void;
    /**
     * Prints a section separator
     */
    printSection(title: string): void;
    /**
     * Prints deployment summary
     */
    printDeploymentSummary(projectName: string, domainName: string, portNumber: number, siteConfig: string, cleanProjectName: string): void;
    /**
     * Prints configuration preview
     */
    printConfigPreview(projectName: string, domainName: string, portNumber: number, upstreamName: string): void;
    /**
     * Prints a simple message without formatting
     */
    print(message: string): void;
    /**
     * Prints an empty line
     */
    newLine(): void;
    /**
     * Prints progress indicator
     */
    printProgress(message: string): void;
    /**
     * Clears the current line (useful after printProgress)
     */
    clearLine(): void;
    /**
     * Prints success on the same line (after printProgress)
     */
    printProgressComplete(message?: string): void;
}
//# sourceMappingURL=output.d.ts.map