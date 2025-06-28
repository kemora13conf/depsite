// Application constants and configuration

export const APP_CONFIG = {
  NAME: 'DepSite',
  VERSION: '1.0.0',
  DESCRIPTION: 'Nginx Site Deployment Tool'
} as const;

export const NGINX_CONFIG = {
  SITES_AVAILABLE_PATH: '/etc/nginx/sites-available',
  SITES_ENABLED_PATH: '/etc/nginx/sites-enabled',
  LOG_PATH: '/var/log/nginx',
  CLIENT_MAX_BODY_SIZE: '20M',
  PROXY_READ_TIMEOUT: '300s',
  PROXY_CONNECT_TIMEOUT: '75s'
} as const;

export const SSL_CONFIG = {
  CERTBOT_COMMAND: 'certbot',
  DEFAULT_OPTIONS: {
    NON_INTERACTIVE: '--non-interactive',
    AGREE_TOS: '--agree-tos',
    REDIRECT: '--redirect',
    NGINX: '--nginx'
  }
} as const;

export const VALIDATION_RULES = {
  PROJECT_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
    ALLOWED_CHARS: /^[a-zA-Z0-9-_]+$/
  },
  DOMAIN_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 253,
    PATTERN: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  },
  PORT_NUMBER: {
    MIN: 1,
    MAX: 65535,
    RESERVED_PORTS: [22, 25, 53, 80, 110, 143, 443, 993, 995]
  }
} as const;

export const ERROR_MESSAGES = {
  ROOT_USER: 'This script should not be run as root. Use sudo when needed.',
  NGINX_NOT_FOUND: 'Nginx is not installed. Please install nginx first.',
  CERTBOT_NOT_FOUND: 'Certbot is not installed. SSL setup will be skipped.',
  INVALID_PROJECT_NAME: 'Project name must contain only letters, numbers, hyphens, and underscores.',
  INVALID_DOMAIN_NAME: 'Please enter a valid domain name.',
  INVALID_PORT_NUMBER: 'Port must be between 1 and 65535.',
  RESERVED_PORT: 'This port is reserved for system services.',
  SITE_EXISTS: 'Site configuration already exists.',
  CONFIG_TEST_FAILED: 'Nginx configuration test failed.',
  ROLLBACK_FAILED: 'Failed to rollback changes.'
} as const;

export const SUCCESS_MESSAGES = {
  CONFIG_CREATED: 'Configuration created successfully',
  SITE_ENABLED: 'Site enabled successfully',
  NGINX_RELOADED: 'Nginx reloaded successfully',
  SSL_SETUP_COMPLETE: 'SSL certificate setup completed',
  DEPLOYMENT_COMPLETE: 'Deployment completed successfully!'
} as const;

export const COMMANDS = {
  NGINX: {
    TEST: 'sudo nginx -t',
    RELOAD: 'sudo systemctl reload nginx',
    RESTART: 'sudo systemctl restart nginx'
  },
  CERTBOT: {
    INSTALL: (domain: string) => `sudo certbot --nginx -d "${domain}" --non-interactive --agree-tos --redirect`
  },
  SYSTEM: {
    WHICH_NGINX: 'which nginx',
    WHICH_CERTBOT: 'which certbot'
  }
} as const;