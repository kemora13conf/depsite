import { ProcessedConfig } from '../types';
export declare class ConfigGenerator {
    /**
     * Generates complete nginx configuration for a site
     */
    generateNginxConfig(config: ProcessedConfig, upstreamAddress?: string): string;
    /**
     * Generates SSL-enabled nginx configuration
     */
    generateSSLConfig(config: ProcessedConfig): string;
    /**
     * Builds the main configuration template
     */
    private buildConfigTemplate;
    /**
     * Builds SSL configuration block
     */
    private buildSSLConfigBlock;
    /**
     * Generates configuration with custom upstream servers
     */
    generateLoadBalancedConfig(config: ProcessedConfig, upstreamServers: Array<{
        host: string;
        port: number;
        weight?: number;
    }>): string;
    /**
     * Builds load-balanced upstream configuration
     */
    private buildLoadBalancedUpstream;
    /**
     * Builds server block configuration
     */
    private buildServerBlock;
    /**
     * Generates development configuration (without SSL and security headers)
     */
    generateDevConfig(config: ProcessedConfig): string;
    /**
     * Validates generated configuration syntax
     */
    validateConfigSyntax(config: string): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Generates configuration with custom template variables
     */
    generateCustomConfig(config: ProcessedConfig, customVars: Record<string, string>): string;
}
//# sourceMappingURL=config-generator.d.ts.map