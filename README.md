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

## Key Features

1. **User Service** – Register, login, and manage users  
2. **Product Service** – List, add, update products  
3. **Order Service** – Create orders and publish events to Kafka  
4. **Notification Service** – Consume events from Kafka and notify users  
5. **Frontend** – React UI to interact with all services  
6. **Kafka Messaging** – Enables asynchronous communication between services  

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

## 🔹 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | Node.js + TypeScript + Express    |
| Frontend  | React + TypeScript + Axios        |
| Messaging | Apache Kafka                      |
| Database  | MongoDB / PostgreSQL              |
| Dev Tools | Docker, Nodemon, ts-node          |

---

## 🔹 How to Run Locally

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
   - Create users  
   - Add products  
   - Place orders  
   - See notifications via Kafka

---