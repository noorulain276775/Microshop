# MicroShop

MicroShop is a microservices-based e-commerce platform demonstrating event-driven architecture with Apache Kafka.

## Architecture Overview

The platform consists of four main microservices:

| Service | Technology Stack | Port | Database | Description |
|---------|------------------|------|----------|-------------|
| User Service | Node.js + TypeScript + Express | 4000 | MongoDB | User registration, authentication, and management with Kafka producer |
| Product Service | Python + FastAPI | 8000 | MongoDB | Product CRUD operations with Kafka producer |
| Order Service | Node.js + TypeScript + Express | - | - | Order creation and management with Kafka producer |
| Notification Service | Node.js + TypeScript + Express | - | - | Consumes Kafka events and sends notifications |

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
- Handles order creation and management
- Kafka producer for order events

### Notification Service
- Built with Node.js, TypeScript, and Express
- Consumes Kafka events from other services
- Sends notifications based on events

## Infrastructure

- **Message Broker**: Apache Kafka with Zookeeper
- **Database**: MongoDB
- **Containerization**: Docker and Docker Compose
- **Kafka UI**: Web interface for monitoring Kafka topics and messages

## Project Structure

```
Microshop/
├── user-service/          # Node.js + TypeScript service
├── product-service/       # Python + FastAPI service  
├── order-service/         # Node.js + TypeScript service
├── notification-service/  # Node.js + TypeScript service
├── docker-compose.yaml    # Infrastructure setup
└── README.md
```

## Prerequisites

- Docker and Docker Compose
- Node.js (for user, order, and notification services)
- Python 3.8+ (for product service)

## Getting Started

1. **Start Infrastructure Services**
   ```bash
   docker-compose up -d
   ```
   This starts:
   - Zookeeper (port 2181)
   - Kafka (ports 9092, 29092)
   - Kafka UI (port 8080)
   - MongoDB (port 27017)

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

5. **Start Notification Service**
   ```bash
   cd notification-service
   npm install
   npm run dev
   ```

## Access Points

- **Kafka UI**: http://localhost:8080
- **User Service**: http://localhost:4000
- **Product Service**: http://localhost:8000
- **MongoDB**: localhost:27017

## Development Notes

- Each service has its own database collection in MongoDB
- Kafka topics are auto-created when services start
- Services use environment variables for configuration
- Docker Compose handles service dependencies and networking