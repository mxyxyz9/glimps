# Timelapse Journal

A photo journaling application with analytics and timelapse generation capabilities, built with a separated frontend and backend architecture.

## Architecture

This application follows a clean separation between frontend and backend:

- **Frontend**: Next.js React application (`frontend/`)
- **Backend**: Express.js API server (`backend/`)
- **Database**: MySQL database

## Quick Start

### Development

1. Install dependencies:
   ```bash
   npm run install:all
   ```

2. Set up environment variables:
   ```bash
   # Copy example files and configure
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

3. Start development servers:
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Production

For detailed build and deployment instructions, see [BUILD_DEPLOY.md](./BUILD_DEPLOY.md).

Quick production deployment with Docker:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Features

- **Authentication**: User registration, login, and JWT-based authentication
- **Journal Management**: Create, edit, and organize photo journals
- **Photo Capture**: Upload and manage photos with metadata
- **Analytics**: Progress tracking and statistics
- **Timelapse Generation**: Create timelapse videos from photo sequences

## Project Structure

```
timelapse-journal/
├── frontend/              # Next.js React application
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/              # Frontend utilities and API client
│   └── ...
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── services/     # Business logic
│   │   ├── models/       # Data models
│   │   └── ...
│   └── ...
├── scripts/              # Build and deployment scripts
├── config/               # Environment configurations
└── ...
```

## API Documentation

The backend provides RESTful APIs for:

- **Authentication**: `/api/auth/*`
- **Journals**: `/api/journals/*`
- **Photos**: `/api/photos/*`
- **Analytics**: `/api/analytics/*`
- **Timelapse**: `/api/timelapse/*`

## Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both frontend and backend in development mode |
| `npm run build` | Build both applications |
| `npm run build:prod` | Build for production |
| `npm run test` | Run backend tests |
| `npm run lint` | Run frontend linting |

### Environment Variables

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_ENV=development
```

#### Backend (.env)
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=timelapse_journal
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_ACCESS_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

## Deployment

See [BUILD_DEPLOY.md](./BUILD_DEPLOY.md) for comprehensive deployment instructions including:

- Docker deployment
- PM2 deployment
- Manual deployment
- Environment-specific configurations
- Health checks and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is private and proprietary.