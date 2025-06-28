// Nginx configuration generation

import { ProcessedConfig } from '../types';
import { NGINX_CONFIG } from '../config/constants';

export class ConfigGenerator {
  /**
   * Generates complete nginx configuration for a site
   */
  generateNginxConfig(config: ProcessedConfig): string {
    const { cleanProjectName, domainName, portNumber, upstreamName, projectName } = config;

    return this.buildConfigTemplate({
      projectName,
      cleanProjectName,
      domainName,
      portNumber,
      upstreamName,
      clientMaxBodySize: NGINX_CONFIG.CLIENT_MAX_BODY_SIZE,
      proxyReadTimeout: NGINX_CONFIG.PROXY_READ_TIMEOUT,
      proxyConnectTimeout: NGINX_CONFIG.PROXY_CONNECT_TIMEOUT
    });
  }

  /**
   * Generates SSL-enabled nginx configuration
   */
  generateSSLConfig(config: ProcessedConfig): string {
    const baseConfig = this.generateNginxConfig(config);
    
    // Add SSL configuration blocks
    const sslConfig = this.buildSSLConfigBlock(config);
    
    return `${baseConfig}\n\n${sslConfig}`;
  }

  /**
   * Builds the main configuration template
   */
  private buildConfigTemplate(params: {
    projectName: string;
    cleanProjectName: string;
    domainName: string;
    portNumber: number;
    upstreamName: string;
    clientMaxBodySize: string;
    proxyReadTimeout: string;
    proxyConnectTimeout: string;
  }): string {
    const {
      projectName,
      cleanProjectName,
      domainName,
      portNumber,
      upstreamName,
      clientMaxBodySize,
      proxyReadTimeout,
      proxyConnectTimeout
    } = params;

    return `# Upstream for ${projectName} Production
upstream ${upstreamName} {
    ip_hash;
    server 127.0.0.1:${portNumber};
}

# HTTP Server Block
server {
    listen 80;
    server_name ${domainName};

    client_max_body_size ${clientMaxBodySize};
    charset utf-8;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Custom error pages
    error_page 404 /not-found;
    error_page 500 502 503 504 /bad-request;

    # Main location block
    location / {
        proxy_pass http://${upstreamName};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
        proxy_cache_bypass \\$http_upgrade;
        proxy_read_timeout ${proxyReadTimeout};
        proxy_connect_timeout ${proxyConnectTimeout};

        # Additional proxy settings
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }

    # Block access to sensitive files
    location ~ /\\. {
        deny all;
    }

    location ~* \\.(env|log|ini|conf)$ {
        deny all;
    }
}`;
  }

  /**
   * Builds SSL configuration block
   */
  private buildSSLConfigBlock(config: ProcessedConfig): string {
    const { domainName, upstreamName } = config;

    return `# HTTPS Server Block (Added by Certbot)
server {
    listen 443 ssl http2;
    server_name ${domainName};

    # SSL Configuration will be managed by Certbot
    ssl_certificate /etc/letsencrypt/live/${domainName}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domainName}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Additional SSL security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Main location block for SSL
    location / {
        proxy_pass http://${upstreamName};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_cache_bypass \\$http_upgrade;
    }
}`;
  }

  /**
   * Generates configuration with custom upstream servers
   */
  generateLoadBalancedConfig(
    config: ProcessedConfig,
    upstreamServers: Array<{ host: string; port: number; weight?: number }>
  ): string {
    const { projectName, cleanProjectName, domainName, upstreamName } = config;

    const upstreamBlock = this.buildLoadBalancedUpstream(upstreamName, upstreamServers);
    const serverBlock = this.buildServerBlock(config);

    return `# Load Balanced Upstream for ${projectName} Production
${upstreamBlock}

${serverBlock}`;
  }

  /**
   * Builds load-balanced upstream configuration
   */
  private buildLoadBalancedUpstream(
    upstreamName: string,
    servers: Array<{ host: string; port: number; weight?: number }>
  ): string {
    const serverLines = servers.map(server => {
      const weight = server.weight ? ` weight=${server.weight}` : '';
      return `    server ${server.host}:${server.port}${weight};`;
    }).join('\n');

    return `upstream ${upstreamName} {
    ip_hash;
${serverLines}
}`;
  }

  /**
   * Builds server block configuration
   */
  private buildServerBlock(config: ProcessedConfig): string {
    return this.buildConfigTemplate({
      projectName: config.projectName,
      cleanProjectName: config.cleanProjectName,
      domainName: config.domainName,
      portNumber: config.portNumber,
      upstreamName: config.upstreamName,
      clientMaxBodySize: NGINX_CONFIG.CLIENT_MAX_BODY_SIZE,
      proxyReadTimeout: NGINX_CONFIG.PROXY_READ_TIMEOUT,
      proxyConnectTimeout: NGINX_CONFIG.PROXY_CONNECT_TIMEOUT
    });
  }

  /**
   * Generates development configuration (without SSL and security headers)
   */
  generateDevConfig(config: ProcessedConfig): string {
    const { projectName, cleanProjectName, domainName, portNumber, upstreamName } = config;

    return `# Development Upstream for ${projectName}
upstream ${upstreamName} {
    server 127.0.0.1:${portNumber};
}

# Development Server Block
server {
    listen 80;
    server_name ${domainName};

    client_max_body_size ${NGINX_CONFIG.CLIENT_MAX_BODY_SIZE};
    charset utf-8;

    # Development logging
    access_log ${NGINX_CONFIG.LOG_PATH}/access.log;
    error_log ${NGINX_CONFIG.LOG_PATH}/error.log;

    location / {
        proxy_pass http://${upstreamName};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
        proxy_cache_bypass \\$http_upgrade;
        
        # Development settings
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        proxy_send_timeout 300s;
    }
}`;
  }

  /**
   * Validates generated configuration syntax
   */
  validateConfigSyntax(config: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic syntax validation
    if (!config.includes('upstream')) {
      errors.push('Missing upstream configuration');
    }

    if (!config.includes('server {')) {
      errors.push('Missing server block');
    }

    if (!config.includes('proxy_pass')) {
      errors.push('Missing proxy_pass directive');
    }

    // Check for balanced braces
    const openBraces = (config.match(/{/g) || []).length;
    const closeBraces = (config.match(/}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      errors.push('Unbalanced braces in configuration');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generates configuration with custom template variables
   */
  generateCustomConfig(config: ProcessedConfig, customVars: Record<string, string>): string {
    let configTemplate = this.generateNginxConfig(config);

    // Replace custom variables in the format {{variable_name}}
    Object.entries(customVars).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      configTemplate = configTemplate.replace(regex, value);
    });

    return configTemplate;
  }
}