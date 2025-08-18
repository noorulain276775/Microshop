# MicroShop

MicroShop is a demo **microservices-based e-commerce platform** built with:

- **Backend:** Node.js + TypeScript + Express  
- **Frontend:** React + TypeScript  
- **Messaging:** Apache Kafka for event-driven communication  
- **Database:** MongoDB/PostgreSQL (optional for each service)  
- **Dev Tools:** Docker, ts-node, Nodemon  

MicroShop demonstrates **independent services**, **event-driven communication**, and **modern full-stack architecture**.

---

## Architecture Diagram

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
| User Service | | Product Service|
+----------------+ +----------------+
|
v
+----------------+
| Order Service |
+----------------+
|
v
+----------------+
| Notification |
| Service (Kafka)|
+----------------+

---

## Key Features

1. **User Service** – register, login, and manage users.  
2. **Product Service** – list, add, update products.  
3. **Order Service** – create orders and publish events to Kafka.  
4. **Notification Service** – consume events from Kafka and notify users.  
5. **Frontend** – React UI to interact with all services.  
6. **Kafka Messaging** – enables asynchronous communication between services.  

---

## Project Structure

microshop/
├── user-service/
├── product-service/
├── order-service/
├── notification-service/
└── frontend/



---

## 🔹 Tech Stack

| Layer          | Technology                        |
|----------------|----------------------------------|
| Backend        | Node.js + TypeScript + Express   |
| Frontend       | React + TypeScript + Axios       |
| Messaging      | Apache Kafka                     |
| Database       | MongoDB / PostgreSQL             |
| Dev Tools      | Docker, Nodemon, ts-node         |

---

## 🔹 How to Run Locally

1. **Start Kafka using Docker**  
```bash
docker-compose up -d

```

2. **Start Backend Services**
```bash

cd user-service && npm install && npm run dev
cd product-service && npm install && npm run dev
cd order-service && npm install && npm run dev
cd notification-service && npm install && npm run dev

```

2. **Start Frontend**

```bash

cd frontend && npm install && npm start

```

4- **Test the flow**

Create users → add products → place orders → see notifications via Kafka