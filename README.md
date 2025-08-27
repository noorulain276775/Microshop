# MicroShop

MicroShop is a microservices-based e-commerce platform demonstrating event-driven architecture with Apache Kafka.

## Architecture Overview

The platform consists of four main microservices:

| Service | Technology Stack | Port | Database | Description |
|---------|------------------|------|----------|-------------|
| User Service | Node.js + TypeScript + Express | 4000 | MongoDB | User registration, authentication, and management with Kafka producer |
| Product Service | Python + FastAPI | 8000 | MongoDB | Product CRUD operations with Kafka producer |
| Order Service | Node.js + TypeScript + Express | 3000 | MySQL | Order creation and management with Kafka producer |
| Notification Service | Python + Flask | 5000 | - | Consumes Kafka events and sends welcome emails |

All services communicate asynchronously through Apache Kafka for event-driven messaging.

## Services Description

### User Service
- Built with Node.js, TypeScript, and Express
- MongoDB database with Mongoose ODM
- User registration, authentication, and management
- Kafka producer for user events
- Runs on port 4000

### Product Service  
- Built with Python and FastAPI
- MongoDB database with Motor async driver
- Product CRUD operations
- Kafka producer for product events
- Runs on port 8000

### Order Service
- Built with Node.js, TypeScript, and Express
- MySQL database with connection pooling
- JWT authentication and validation
- Handles order creation and management
- Kafka producer for order events
- Runs on port 3000

### Notification Service
- Built with Python and Flask
- Consumes Kafka events from other services
- Sends welcome emails when users register
- Runs on port 5000
- Handles user-registered events automatically
- Sends professional HTML welcome emails
- Includes health check and test endpoints

## Infrastructure

- **Message Broker**: Apache Kafka with Zookeeper
- **Databases**: MongoDB (User/Product), MySQL (Orders)
- **Containerization**: Docker and Docker Compose
- **Kafka UI**: Web interface for monitoring Kafka topics and messages


1. User Login → JWT Token (contains user_id, email, username)
2. User Places Order → Order Service validates JWT + extracts user info
3. Order Service → Publishes "order-placed" event to Kafka
4. Notification Service → Consumes event + sends order confirmation email

## Project Structure

```
Microshop/
├── user-service/          # Node.js + TypeScript service
├── product-service/       # Python + FastAPI service  
├── order-service/         # Node.js + TypeScript service
├── notification-service/  # Python + Flask service
├── docker-compose.yaml    # Infrastructure setup
└── README.md
```

## Prerequisites

- Docker and Docker Compose
- Node.js (for user, order, and notification services)
- Python 3.8+ (for product service)

## Environment Configuration

**Important**: Before starting the services, create a `.env` file in the root directory with your secure credentials:

```bash
# Copy the example file
cp env.example .env

# Edit with your secure passwords and secrets
# MySQL Database Configuration
MYSQL_ROOT_PASSWORD=your-secure-root-password
MYSQL_DATABASE=orders_db
MYSQL_USER=orders_user
MYSQL_PASSWORD=your-secure-mysql-user-password

# JWT Configuration (must match across all services)
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Email Configuration (for notification service)
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
```

**Security Note**: Never commit the `.env` file to version control. It's already included in `.gitignore`.

**⚠️ CRITICAL**: All services will fail to start if the required environment variables are not set. No default/fallback secrets are provided for security reasons.

## Getting Started

1. **Configure Environment Variables**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your secure credentials
   # Pay special attention to:
   # - MYSQL_ROOT_PASSWORD (use a strong password)
   # - JWT_SECRET (use a long, random string)
   # - SMTP credentials (for email notifications)
   
   # ⚠️ IMPORTANT: All services require these environment variables to start
   # No default secrets are provided for security reasons
   ```

2. **Start Infrastructure Services**
   ```bash
   docker-compose up -d
   ```
   This starts:
   - Zookeeper (port 2181)
   - Kafka (ports 9092, 29092)
   - Kafka UI (port 8080)
   - MongoDB (port 27017)
   - MySQL (port 3307)

2. **Start User Service**
   ```bash
   cd user-service
   npm install
   npm run dev
   ```
   Service will be available at http://localhost:4000

3. **Start Product Service**
   ```bash
   cd product-service
   pip install -r requirements.txt
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   Service will be available at http://localhost:8000

4. **Start Order Service**
   ```bash
   cd order-service
   npm install
   npm run dev
   ```
   Service will be available at http://localhost:3000

5. **Start Notification Service**
   ```bash
   cd notification-service
   pip install -r requirements.txt
   python app.py
   ```
   Service will be available at http://localhost:5000

## Access Points

- **Kafka UI**: http://localhost:8080
- **User Service**: http://localhost:4000
- **Product Service**: http://localhost:8000
- **Order Service**: http://localhost:3000
- **Notification Service**: http://localhost:5000
- **MongoDB**: localhost:27017
- **MySQL**: localhost:3306

## Development Notes

- Each service has its own database collection in MongoDB
- Kafka topics are auto-created when services start
- Services use environment variables for configuration
- Docker Compose handles service dependencies and networking
- Notification service automatically processes Kafka events
- User registration triggers automatic welcome emails
- All services communicate asynchronously via Kafka events

## Security Considerations

- **Environment Variables**: All sensitive configuration is stored in environment variables
- **JWT Secrets**: Use strong, unique JWT secrets in production
- **Database Passwords**: Use strong passwords for MySQL and MongoDB
- **Email Credentials**: Store SMTP credentials securely
- **Network Security**: Services communicate over internal Docker network
- **No Hardcoded Secrets**: All passwords and secrets are externalized
- **No Default Fallbacks**: Services will fail to start if required environment variables are missing
- **Git Ignore**: `.env` file is properly ignored by version control

**📖 For detailed security configuration, see [SECURITY.md](SECURITY.md)**

## Production Deployment

For production deployment:
1. Use strong, unique passwords for all databases
2. Generate a cryptographically secure JWT secret
3. Use environment-specific configuration files
4. Enable HTTPS for all external communications
5. Implement proper logging and monitoring
6. Use secrets management services (AWS Secrets Manager, HashiCorp Vault, etc.)