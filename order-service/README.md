# Order Service

A Node.js microservice for handling e-commerce orders with MySQL database and Kafka event publishing.

## Architecture Overview

The Order Service follows the microservices architecture pattern:

```
User Service → JWT Token → Order Service → MySQL Database + Kafka Event → Notification Service
```

### Key Features

- **JWT Authentication**: Validates user tokens without calling User Service
- **MySQL Database**: Stores order data with proper indexing
- **Kafka Integration**: Publishes order-created events for other services
- **Event-Driven**: Completely decoupled from other services
- **RESTful API**: Clean, documented endpoints for order management

## Technology Stack

- **Runtime**: Node.js 18 with TypeScript
- **Framework**: Express.js with middleware
- **Database**: MySQL 8.0 with connection pooling
- **Message Broker**: Apache Kafka for event publishing
- **Authentication**: JWT token validation
- **Containerization**: Docker with health checks

## API Endpoints

### Authentication Required
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

### Order Management

#### POST /orders
Create a new order

**Request Body:**
```json
{
  "productId": "prod_123",
  "quantity": 2,
  "productPrice": 29.99
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Order placed successfully",
  "orderId": "order_uuid_123",
  "order": {
    "id": "order_uuid_123",
    "productId": "prod_123",
    "quantity": 2,
    "total": 59.98,
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### GET /orders
Get all orders for the authenticated user

#### GET /orders/:id
Get a specific order by ID

#### PUT /orders/:id/status
Update order status

### Health Check

#### GET /health
Service health status

## Database Schema

### Orders Table
```sql
CREATE TABLE orders (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  userEmail VARCHAR(255) NOT NULL,
  productId VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_userId (userId),
  INDEX idx_productId (productId),
  INDEX idx_status (status),
  INDEX idx_createdAt (createdAt)
);
```

### Order Items Table (Future Extensibility)
```sql
CREATE TABLE order_items (
  id VARCHAR(36) PRIMARY KEY,
  orderId VARCHAR(36) NOT NULL,
  productId VARCHAR(36) NOT NULL,
  productName VARCHAR(255) NOT NULL,
  productPrice DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
);
```

## Kafka Events

### Order Created Event
When an order is placed, the service publishes an event to the `order-created` topic:

```json
{
  "orderId": "order_uuid_123",
  "userId": "user_uuid_456",
  "userEmail": "user@example.com",
  "username": "username",
  "productId": "prod_123",
  "quantity": 2,
  "total": 59.98,
  "status": "pending",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Event Consumers
- **Notification Service**: Sends order confirmation emails
- **Inventory Service**: Updates product stock (future)
- **Analytics Service**: Tracks order metrics (future)

## Environment Configuration

Copy `env.example` to `.env` and configure:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration (must match User Service)
JWT_SECRET=your-super-secret-jwt-key

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_NAME=orders_db

# Kafka Configuration
KAFKA_BROKERS=localhost:9092
KAFKA_TOPIC=order-created

# Service Configuration
SERVICE_NAME=order-service
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp env.example .env
# Edit .env with your configuration
```

### 3. Start MySQL Database
```bash
docker run -d \
  --name mysql \
  -e MYSQL_ROOT_PASSWORD=your-secure-password \
  -e MYSQL_DATABASE=orders_db \
  -e MYSQL_USER=orders_user \
  -e MYSQL_PASSWORD=your-secure-user-password \
  -p 3306:3306 \
  mysql:8.0
```

### 4. Start Kafka (if not running)
```bash
docker-compose up -d kafka
```

### 5. Run the Service
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Docker Deployment

### Build and Run
```bash
# Build image
docker build -t order-service .

# Run container
docker run -d \
  --name order-service \
  -p 3000:3000 \
  --env-file .env \
  order-service
```

### Docker Compose
```bash
docker-compose up -d order-service
```

## Testing

### Manual Testing with JWT Token

1. **Get JWT Token** from User Service:
```bash
curl -X POST http://localhost:4000/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

2. **Place Order** using the token:
```bash
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"productId": "prod_123", "quantity": 2, "productPrice": 29.99}'
```

3. **Get User Orders**:
```bash
curl -X GET http://localhost:3000/orders \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## Security Features

- **JWT Validation**: Secure token-based authentication
- **Input Validation**: Request body validation and sanitization
- **SQL Injection Protection**: Parameterized queries with mysql2
- **CORS Configuration**: Configurable cross-origin requests
- **Helmet Security**: HTTP security headers
- **Rate Limiting**: Built-in Express rate limiting (configurable)

## Monitoring and Logging

- **Health Checks**: `/health` endpoint for monitoring
- **Request Logging**: All API requests are logged
- **Error Handling**: Comprehensive error handling and logging
- **Database Monitoring**: Connection pool status
- **Kafka Monitoring**: Producer status and event publishing

## Performance Features

- **Connection Pooling**: MySQL connection pool for optimal performance
- **Database Indexing**: Proper indexes on frequently queried fields
- **Async Operations**: Non-blocking I/O operations
- **Graceful Shutdown**: Proper cleanup on service termination

## Future Enhancements

- **Product Validation**: Consume product events for real-time validation
- **Inventory Management**: Automatic stock updates
- **Payment Integration**: Payment processing workflows
- **Order Analytics**: Order metrics and reporting
- **Multi-tenancy**: Support for multiple stores/organizations

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify MySQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **JWT Validation Failed**
   - Verify JWT_SECRET matches User Service
   - Check token expiration
   - Ensure proper Authorization header format

3. **Kafka Connection Failed**
   - Verify Kafka is running
   - Check broker addresses
   - Ensure network connectivity

4. **Service Not Starting**
   - Check port availability
   - Verify environment variables
   - Check database connection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is part of the MicroShop microservices platform.
