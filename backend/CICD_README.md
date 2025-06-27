# Backend CI/CD Setup

This document describes the CI/CD pipeline setup for the backend service.

## Overview

The CI/CD pipeline is configured using GitHub Actions and includes the following stages:

1. **Testing** - Runs linting, unit tests, and e2e tests
2. **Building** - Builds the application and creates artifacts
3. **Security** - Runs security audits
4. **Deployment** - Deploys to staging (develop branch) and production (main branch)

## Workflow Files

- `.github/workflows/ci-cd.yml` - Main CI/CD workflow

## Docker Setup

- `Dockerfile` - Multi-stage Docker build for production
- `docker-compose.yml` - Local development setup with PostgreSQL
- `.dockerignore` - Excludes unnecessary files from Docker build
- `health-check.js` - Health check script for Docker containers

## Local Development

### Using Docker Compose

```bash
# Start the entire stack (app + database)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop the stack
docker-compose down
```

### Using Local Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
npm run start:dev
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## CI/CD Pipeline

### Triggers

The pipeline runs on:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Only when changes are made in the `backend/` directory

### Jobs

1. **test** - Runs all tests with PostgreSQL service
2. **build** - Builds the application and uploads artifacts
3. **security** - Runs security audits
4. **deploy-staging** - Deploys to staging environment (develop branch)
5. **deploy-production** - Deploys to production environment (main branch)

### Deployment

The deployment jobs are currently placeholder jobs. You'll need to add your specific deployment commands based on your infrastructure:

- **Staging**: Deploy to staging environment when pushing to `develop`
- **Production**: Deploy to production environment when pushing to `main`

### Environment Secrets

Set up the following secrets in your GitHub repository:

- `DATABASE_URL` - Production database URL
- `JWT_SECRET` - JWT secret for production
- `NODE_ENV` - Environment (production/staging)

## Security

The pipeline includes:

- Security audits using `npm audit`
- Non-root user in Docker containers
- Health checks for containers
- Environment-specific configurations

## Monitoring

- Health check endpoint: `/health`
- Docker health checks configured
- Logging configured for production

## Next Steps

1. Configure your deployment environment (AWS, GCP, Azure, etc.)
2. Set up environment secrets in GitHub
3. Configure your database for production
4. Set up monitoring and logging
5. Configure SSL certificates
6. Set up backup strategies
