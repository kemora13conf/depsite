#!/usr/bin/env node
declare class NginxSiteDeployer {
    private certbotAvailable;
    constructor();
    private printStatus;
    private printSuccess;
    private printWarning;
    private printError;
    private checkRootUser;
    private checkDependencies;
    private getUserInput;
    private sanitizeProjectName;
    private generateNginxConfig;
    private checkSiteExists;
    private createNginxConfig;
    private enableSite;
    private testNginxConfig;
    private reloadNginx;
    private setupSSL;
    private rollbackChanges;
    private printSummary;
    deploy(): Promise<void>;
}
export default NginxSiteDeployer;
//# sourceMappingURL=index.d.ts.map