export declare class CLI {
    private outputService;
    private deployer;
    constructor();
    /**
     * Main CLI entry point
     */
    run(args?: string[]): Promise<void>;
    /**
     * Prints usage information
     */
    private printUsage;
    /**
     * Prints version information
     */
    private printVersion;
    /**
     * Handles process signals for graceful shutdown
     */
    setupSignalHandlers(): void;
}
//# sourceMappingURL=index.d.ts.map