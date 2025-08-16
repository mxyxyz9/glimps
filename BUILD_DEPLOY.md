# Build and Deployment Guide

This document outlines the build and deployment process for the Timelapse Journal application.

## Project Structure

```
timelapse-journal/
├── frontend/           # Next.js React application
├── backend/            # Express.js API server
├── scripts/            # Build and deployment scripts
├── config/             # Environment configurations
├── docker-compose.yml  # Development Docker setup
└── docker-compose.prod.yml # Production Docker setup
```

## Environment Configuration

### Frontend Environment Variables

Create the following environment files in the `frontend/` directory:

- `.env.local` - Development environment
- `.env.production` - Production environment

```bash
# Example .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_ENV=development
```

### Backend Environment Variables

Create the following environment files in the `backend/` directory:

- `.env` - Development environment (copy from .env.example)
- `.env.production` - Production environment
- `.env.test` - Testing environment

## Build Process

### Development Build

```bash
# Install all dependencies
npm run install:all

# Build both frontend and backend
npm run build

# Or build individually
npm run build:frontend
npm run build:backend
```

### Production Build

```bash
# Build for production
npm run build:prod

# Or use the build script
./scripts/build.sh production
```

### Build Scripts

The following npm scripts are available:

| Script | Description |
|--------|-------------|
| `build` | Build both frontend and backend for development |
| `build:prod` | Build both frontend and backend for production |
| `build:frontend` | Build only the frontend |
| `build:backend` | Build only the backend |
| `build:prod:frontend` | Build frontend for production |
| `build:prod:backend` | Build backend for production |

## Deployment Options

### 1. Docker Deployment (Recommended)

#### Development
```bash
# Start development environment
docker-compose up -d

# Or use the deployment script
./scripts/deploy.sh development docker
```

#### Production
```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# Or use the deployment script
./scripts/deploy.sh production docker
```

### 2. PM2 Deployment

```bash
# Install PM2 globally
npm install -g pm2

# Deploy with PM2
./scripts/deploy.sh production pm2
```

### 3. Manual Deployment

#### Frontend (Next.js)
```bash
cd frontend
npm install
npm run build:prod
npm run start:prod
```

#### Backend (Express.js)
```bash
cd backend
npm install
npm run build:prod
npm run start:prod
```

## Environment-Specific Configurations

### Development
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Database: Local MySQL instance

### Staging
- Frontend: https://staging.yourdomain.com
- Backend: https://api-staging.yourdomain.com
- Database: Staging MySQL instance

### Production
- Frontend: https://yourdomain.com
- Backend: https://api.yourdomain.com
- Database: Production MySQL instance

## Health Checks

The application includes health check endpoints:

- Backend: `GET /api/health`
- Frontend: `GET /` (homepage)

## Monitoring and Logs

### Docker Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### PM2 Logs
```bash
# View PM2 logs
pm2 logs

# View specific app logs
pm2 logs timelapse-journal-backend
```

### File Logs
Backend logs are stored in `backend/logs/`:
- `err.log` - Error logs
- `out.log` - Output logs
- `combined.log` - Combined logs

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000 and 5000 are available
2. **Environment variables**: Check that all required environment variables are set
3. **Database connection**: Verify database credentials and connectivity
4. **Build failures**: Check Node.js version compatibility (requires Node.js 18+)

### Debug Commands

```bash
# Check service status
docker-compose ps

# Restart services
docker-compose restart

# View service logs
docker-compose logs -f [service-name]

# Access service shell
docker-compose exec [service-name] sh
```

## Performance Optimization

### Frontend Optimizations
- Next.js automatic code splitting
- Image optimization with `next/image`
- CSS optimization in production builds
- Bundle analysis available with `npm run analyze`

### Backend Optimizations
- PM2 cluster mode for multiple instances
- Request logging and monitoring
- Database connection pooling
- Gzip compression enabled

## Security Considerations

### Production Security Checklist
- [ ] Environment variables properly configured
- [ ] HTTPS enabled for production domains
- [ ] Database credentials secured
- [ ] JWT secrets are strong and unique
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] File upload restrictions in place
- [ ] Security headers configured (Helmet.js)

## Backup and Recovery

### Database Backup
```bash
# Create database backup
mysqldump -u username -p database_name > backup.sql

# Restore database backup
mysql -u username -p database_name < backup.sql
```

### File Backup
- Backend logs: `backend/logs/`
- Uploaded files: `backend/uploads/` (if using local storage)
- Configuration files: Environment files and configs

## Scaling Considerations

### Horizontal Scaling
- Use load balancer for multiple backend instances
- Database read replicas for read-heavy workloads
- CDN for static frontend assets

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries and indexes
- Implement caching strategies (Redis)