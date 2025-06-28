# DepSite - Nginx Site Deployment Tool

A TypeScript CLI tool that automates the deployment of nginx reverse proxy configurations for Node.js applications.

## Features

- 🚀 Interactive CLI with colored output
- 🔧 Automatic nginx configuration generation
- 🔒 SSL certificate setup with Certbot
- ✅ Configuration validation and testing
- 🔄 Automatic rollback on failure
- 📝 Comprehensive deployment summary

## Prerequisites

- Node.js (>=14.0.0)
- Nginx installed and running
- Certbot (optional, for SSL setup)
- Sudo privileges for nginx configuration

## Installation

```bash
# Clone or download the project
cd ~/Desktop/Code/NodeJs/depsite

# Install dependencies
yarn install

# Build the project
yarn build
```

## Usage

### Development Mode
```bash
yarn dev
```

### Production Mode
```bash
# Build first
yarn build

# Run the built version
yarn start
```

## What it does

1. **Validates Environment**: Checks for nginx installation and sudo privileges
2. **Collects Input**: Prompts for project name, domain, and port number
3. **Generates Configuration**: Creates nginx upstream and server blocks
4. **Validates Setup**: Tests nginx configuration before applying
5. **Enables Site**: Creates symbolic links in sites-enabled
6. **SSL Setup**: Optionally configures SSL certificates with Certbot
7. **Provides Summary**: Shows deployment details and useful commands

## Example nginx Configuration Generated

```nginx
# Upstream for my-app Production
upstream my-app_prod {
    ip_hash;
    server 127.0.0.1:3000;
}

# HTTP Server Block
server {
    listen 80;
    server_name my-app.example.com;

    client_max_body_size 20M;
    charset utf-8;

    # Custom error pages
    error_page 404 /not-found;
    error_page 500 502 503 504 /bad-request;

    location / {
        proxy_pass http://my-app_prod;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

## Project Structure

```
depsite/
├── src/
│   └── index.ts          # Main application file
├── dist/                 # Compiled JavaScript (after build)
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Error Handling

- Automatic rollback on configuration errors
- Validation of user input
- Dependency checking
- Graceful error messages with colored output

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
