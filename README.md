# MicroShop

MicroShop is a demo **microservices-based e-commerce platform** built with:

- **Backend:** Node.js + TypeScript + Express  
- **Frontend:** React + TypeScript  
- **Messaging:** Apache Kafka for event-driven communication  
- **Database:** MongoDB / PostgreSQL (optional for each service)  
- **Dev Tools:** Docker, ts-node, Nodemon  

MicroShop demonstrates **independent services**, **event-driven communication**, and **modern full-stack architecture**.

---

## Architecture Diagram

```
   +----------------+        
   | React Frontend |        
   +----------------+        
           |                       
           v                       
   +----------------+        
   | API Gateway    |        
   +----------------+        
      |        |                 
      v        v                 
+----------------+ +----------------+
| User Service  | | Product Service |
+----------------+ +----------------+
      |                |
      v                v
+----------------+     |
| Order Service  |     |
+----------------+     |
      |                |
      v                v
+----------------+ +----------------+
| Notification   | | Kafka Broker   |
| Service        | +----------------+
+----------------+
```

---

## Features Overview

- **User Service:** Register, login, manage users  
  - Produces `USER_CREATED` events to Kafka  
- **Product Service:** List, add, update products  
- **Order Service:** Create orders, produces `ORDER_CREATED` events to Kafka  
- **Notification Service:** Consumes Kafka events, sends notifications  
  - Welcome emails for new users  
  - Order confirmation emails  
- **Frontend:** React UI interacts with all services  
- **Kafka Messaging:** Enables asynchronous, loosely coupled communication  

---

## Project Structure

```
microshop/
├── user-service/
├── product-service/
├── order-service/
├── notification-service/
└── frontend/
```

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | Node.js + TypeScript + Express    |
| Frontend  | React + TypeScript + Axios        |
| Messaging | Apache Kafka                      |
| Database  | MongoDB / PostgreSQL              |
| Dev Tools | Docker, Nodemon, ts-node          |

---

## How to Run Locally

1. **Start Kafka using Docker**  
   ```bash
   docker-compose up -d
   ```

2. **Start Backend Services**  
   Open separate terminals for each service and run:
   ```bash
   cd user-service && npm install && npm run dev
   cd product-service && npm install && npm run dev
   cd order-service && npm install && npm run dev
   cd notification-service && npm install && npm run dev
   ```

3. **Start Frontend**  
   ```bash
   cd frontend && npm install && npm start
   ```

4. **Test the Flow**  
   - Register users  
   - Add products  
   - Place orders  
   - Receive notifications via Kafka