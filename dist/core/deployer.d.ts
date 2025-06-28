export declare class DeploymentOrchestrator {
    private outputService;
    private promptService;
    private processService;
    private systemService;
    private nginxService;
    private sslService;
    private validationService;
    private configGenerator;
    constructor();
    /**
     * Main deployment workflow
     */
    deploy(): Promise<void>;
    /**
     * Validates system requirements and dependencies
     */
    private validateSystem;
    /**
     * Gets configuration from user input
     */
    private getUserConfiguration;
    /**
     * Processes and validates configuration
     */
    private processConfiguration;
    /**
     * Confirms deployment with user
     */
    private confirmDeployment;
    /**
     * Handles existing site configuration
     */
    private handleExistingSite;
    /**
     * Executes the main deployment process
     */
    private executeDeployment;
    /**
     * Sets up SSL certificate
     */
    private setupSSL;
    /**
     * Displays deployment summary
     */
    private displayDeploymentSummary;
    /**
     * Rolls back deployment in case of failure
     */
    private rollbackDeployment;
    /**
     * Validates deployment status after completion
     */
    private validateDeployment;
    /**
     * Removes an existing deployment
     */
    removeSite(projectName: string): Promise<void>;
    /**
     * Lists all managed sites
     */
    listSites(): Promise<void>;
}
//# sourceMappingURL=deployer.d.ts.map