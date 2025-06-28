# DepSite - Nginx Site Deployment Tool

A TypeScript CLI tool that automates the deployment of nginx reverse proxy configurations for Node.js applications.

## 🚀 Features

- 🎯 **Interactive CLI** with colored output and progress indicators
- 🔧 **Automatic nginx configuration** generation with best practices
- 🔒 **SSL certificate setup** with Certbot integration
- ✅ **Configuration validation** and testing before deployment
- 🔄 **Automatic rollback** on failure
- 📝 **Comprehensive deployment summary** with useful commands
- 🏗️ **Clean Architecture** with separation of concerns
- 🧪 **Testable components** with dependency injection
- 📦 **Modular design** for easy maintenance and extension

## 📋 Prerequisites

- Node.js (>=14.0.0)
- Nginx installed and running
- Certbot (optional, for SSL setup)
- Sudo privileges for nginx configuration

## 📁 Project Structure

```
src/
├── cli/                    # CLI interface and user interaction
│   ├── index.ts           # CLI entry point and command handling
│   ├── output.ts          # Colored output and logging utilities
│   └── prompts.ts         # User input prompts and validation
├── core/                   # Core business logic
│   ├── deployer.ts        # Main deployment orchestrator
│   ├── config-generator.ts # Nginx configuration generation
│   └── validator.ts       # Input and system validation
├── services/              # External system interactions
│   ├── nginx.service.ts   # Nginx operations (create, enable, test)
│   ├── ssl.service.ts     # SSL/Certbot operations
│   ├── system.service.ts  # System checks and file operations
│   └── process.service.ts # Command execution utilities
├── types/                 # TypeScript interfaces and types
│   └── index.ts          # All type definitions
├── config/               # Application configuration
│   └── constants.ts      # Application constants and settings
├── utils/                # Reusable utilities
│   ├── sanitizer.ts      # Input sanitization utilities
│   └── error-handler.ts  # Error handling utilities
└── index.ts              # Main entry point and exports
```

## 🛠️ Installation

```bash
# Clone or download the project
cd ~/Desktop/Code/NodeJs/depsite

# Install dependencies
yarn install

# Build the project
yarn build
```

## 📖 Usage

### Development Mode
```bash
yarn start
```

### Production Mode
```bash
# Build first
yarn build

# Run the built version
node dist/index.js
```

### Command Line Options
```bash
# Interactive deployment (default)
depsite
depsite deploy

# Remove existing site
depsite remove <project-name>

# List managed sites
depsite list

# Show help
depsite help

# Show version
depsite version
```

## 🔧 Architecture Benefits

### ✅ **Single Responsibility Principle**
Each class and module has one clear purpose:
- `CLI` - Handles command-line interface
- `DeploymentOrchestrator` - Manages deployment workflow
- `NginxService` - Handles nginx operations
- `SSLService` - Manages SSL certificates
- `ValidationService` - Validates inputs and system state

### ✅ **Separation of Concerns**
- **Presentation Layer**: CLI, output formatting, user prompts
- **Business Logic**: Deployment orchestration, validation
- **Service Layer**: External system interactions (nginx, certbot, file system)
- **Data Layer**: Configuration, types, constants

### ✅ **Dependency Injection**
Services are injected into classes, making them:
- Easy to test with mocks
- Loosely coupled
- Replaceable/configurable

### ✅ **Error Handling**
Centralized error handling with:
- Custom error types (`DeploymentError`, `ValidationError`, `SystemError`)
- Automatic rollback on failures
- Graceful error messages

### ✅ **Testability**
Each component can be unit tested independently:
```typescript
// Example test setup
const mockProcessService = new MockProcessService();
const nginxService = new NginxService(mockProcessService, mockSystemService);
```

## 🧪 Testing Strategy

The refactored architecture enables comprehensive testing:

### Unit Tests
- **Services**: Mock external dependencies (file system, commands)
- **Validators**: Test input validation rules
- **Config Generator**: Test nginx configuration generation
- **Utils**: Test sanitization and error handling

### Integration Tests
- **Deployment Flow**: Test complete deployment process
- **Service Interactions**: Test service communication
- **Error Scenarios**: Test rollback mechanisms

### Example Test Structure
```
tests/
├── unit/
│   ├── services/
│   ├── core/
│   ├── utils/
│   └── cli/
├── integration/
│   ├── deployment.test.ts
│   └── rollback.test.ts
└── fixtures/
    ├── configs/
    └── responses/
```

## 🔄 Migration from Original Code

### What Changed
1. **Single 11KB file** → **Modular architecture** with 15+ focused files
2. **Mixed concerns** → **Clear separation** of presentation, business logic, and services
3. **Hard to test** → **Dependency injection** with mockable services
4. **Hardcoded values** → **Centralized configuration**
5. **No error types** → **Custom error classes** with rollback support

### Benefits Gained
- **Maintainability**: Smaller, focused files
- **Testability**: Each component can be tested independently
- **Reusability**: Services can be reused in other projects
- **Scalability**: Easy to add new features (Docker, Apache, etc.)
- **Team Development**: Multiple developers can work on different modules

## 🎯 Future Enhancements

The new architecture makes it easy to add:

### New Deployment Targets
- Apache configuration support
- Docker reverse proxy setup
- Kubernetes ingress configuration

### Enhanced Features
- Configuration templates
- Multiple environment support
- Automated testing endpoints
- Monitoring integration
- Backup and restore functionality

### CLI Improvements
- Configuration file support
- Batch deployment
- Interactive configuration wizard
- Plugin system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Work on a specific module (services, core, cli, etc.)
4. Add tests for your changes
5. Ensure all tests pass
6. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Add JSDoc comments for public methods
- Write unit tests for new features
- Update documentation for API changes
- Use the established error handling patterns

## 📚 API Documentation

### Core Classes

#### `DeploymentOrchestrator`
Main deployment workflow manager.

```typescript
const deployer = new DeploymentOrchestrator();
await deployer.deploy(); // Interactive deployment
await deployer.removeSite('project-name'); // Remove site
await deployer.listSites(); // List managed sites
```

#### `NginxService`
Nginx configuration management.

```typescript
const nginxService = new NginxService(processService, systemService);
await nginxService.createConfiguration(config);
await nginxService.enableSite(projectName);
await nginxService.testConfiguration();
await nginxService.reloadNginx();
```

#### `SSLService`
SSL certificate management.

```typescript
const sslService = new SSLService(processService);
await sslService.setupSSL({ domainName: 'example.com' });
await sslService.renewCertificate('example.com');
```

#### `ValidationService`
Input and system validation.

```typescript
const validator = new ValidationService(systemService, nginxService);
const result = await validator.validateDeploymentConfig(config);
if (!result.isValid) {
  console.log('Errors:', result.errors);
}
```

## 🔍 Example Generated Configuration

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

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

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

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

## 🐛 Troubleshooting

### Common Issues

#### Permission Errors
```bash
# Ensure you have sudo privileges
sudo -v

# Check nginx installation
which nginx
nginx -v
```

#### Port Already in Use
```bash
# Check what's using the port
sudo netstat -tlnp | grep :3000
sudo ss -tlnp | grep :3000
```

#### Nginx Configuration Errors
```bash
# Test nginx configuration
sudo nginx -t

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
```

#### SSL Certificate Issues
```bash
# Check certbot installation
which certbot
certbot --version

# List existing certificates
sudo certbot certificates

# Test certificate renewal
sudo certbot renew --dry-run
```

### Debug Mode
Set environment variable for verbose logging:
```bash
DEBUG=depsite:* yarn start
```

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with TypeScript for type safety
- Uses Inquirer.js for interactive prompts
- Chalk for colored terminal output
- Follows clean architecture principles
- Inspired by modern DevOps deployment tools

## 📞 Support

- 📚 Documentation: Check this README and inline code comments
- 🐛 Issues: Report bugs and feature requests on GitHub
- 💬 Discussions: Use GitHub Discussions for questions and ideas
- 📧 Contact: Reach out to maintainers for support

---

**Happy Deploying! 🚀**