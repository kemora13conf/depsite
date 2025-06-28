export declare const APP_CONFIG: {
    readonly NAME: "DepSite";
    readonly VERSION: "1.0.0";
    readonly DESCRIPTION: "Nginx Site Deployment Tool";
};
export declare const NGINX_CONFIG: {
    readonly SITES_AVAILABLE_PATH: "/etc/nginx/sites-available";
    readonly SITES_ENABLED_PATH: "/etc/nginx/sites-enabled";
    readonly LOG_PATH: "/var/log/nginx";
    readonly CLIENT_MAX_BODY_SIZE: "20M";
    readonly PROXY_READ_TIMEOUT: "300s";
    readonly PROXY_CONNECT_TIMEOUT: "75s";
};
export declare const SSL_CONFIG: {
    readonly CERTBOT_COMMAND: "certbot";
    readonly DEFAULT_OPTIONS: {
        readonly NON_INTERACTIVE: "--non-interactive";
        readonly AGREE_TOS: "--agree-tos";
        readonly REDIRECT: "--redirect";
        readonly NGINX: "--nginx";
    };
};
export declare const VALIDATION_RULES: {
    readonly PROJECT_NAME: {
        readonly MIN_LENGTH: 1;
        readonly MAX_LENGTH: 50;
        readonly ALLOWED_CHARS: RegExp;
    };
    readonly DOMAIN_NAME: {
        readonly MIN_LENGTH: 3;
        readonly MAX_LENGTH: 253;
        readonly PATTERN: RegExp;
    };
    readonly PORT_NUMBER: {
        readonly MIN: 1;
        readonly MAX: 65535;
        readonly RESERVED_PORTS: readonly [22, 25, 53, 80, 110, 143, 443, 993, 995];
    };
};
export declare const ERROR_MESSAGES: {
    readonly ROOT_USER: "This script should not be run as root. Use sudo when needed.";
    readonly NGINX_NOT_FOUND: "Nginx is not installed. Please install nginx first.";
    readonly CERTBOT_NOT_FOUND: "Certbot is not installed. SSL setup will be skipped.";
    readonly INVALID_PROJECT_NAME: "Project name must contain only letters, numbers, hyphens, and underscores.";
    readonly INVALID_DOMAIN_NAME: "Please enter a valid domain name.";
    readonly INVALID_PORT_NUMBER: "Port must be between 1 and 65535.";
    readonly RESERVED_PORT: "This port is reserved for system services.";
    readonly SITE_EXISTS: "Site configuration already exists.";
    readonly CONFIG_TEST_FAILED: "Nginx configuration test failed.";
    readonly ROLLBACK_FAILED: "Failed to rollback changes.";
};
export declare const SUCCESS_MESSAGES: {
    readonly CONFIG_CREATED: "Configuration created successfully";
    readonly SITE_ENABLED: "Site enabled successfully";
    readonly NGINX_RELOADED: "Nginx reloaded successfully";
    readonly SSL_SETUP_COMPLETE: "SSL certificate setup completed";
    readonly DEPLOYMENT_COMPLETE: "Deployment completed successfully!";
};
export declare const COMMANDS: {
    readonly NGINX: {
        readonly TEST: "sudo nginx -t";
        readonly RELOAD: "sudo systemctl reload nginx";
        readonly RESTART: "sudo systemctl restart nginx";
    };
    readonly CERTBOT: {
        readonly INSTALL: (domain: string) => string;
    };
    readonly SYSTEM: {
        readonly WHICH_NGINX: "which nginx";
        readonly WHICH_CERTBOT: "which certbot";
    };
};
//# sourceMappingURL=constants.d.ts.map