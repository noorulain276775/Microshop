import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  productId: string;
  quantity: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderRequest {
  productId: string;
  quantity: number;
  productPrice?: number; // Optional: can be sent from frontend or calculated
}

export interface CreateOrderResponse {
  status: 'success' | 'error';
  message: string;
  orderId?: string;
  order?: Order;
}

export class OrderModel {
  // Create a new order
  static async create(
    userId: string, 
    userEmail: string, 
    orderData: CreateOrderRequest
  ): Promise<Order> {
    const connection = await pool.getConnection();
    
    try {
      const orderId = uuidv4();
      const total = (orderData.productPrice || 0) * orderData.quantity;
      
      const [result] = await connection.execute(
        `INSERT INTO orders (id, userId, userEmail, productId, quantity, total, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, userId, userEmail, orderData.productId, orderData.quantity, total, 'pending']
      );

      // Fetch the created order
      const [orders] = await connection.execute(
        'SELECT * FROM orders WHERE id = ?',
        [orderId]
      );

      const order = (orders as any[])[0];
      
      return {
        id: order.id,
        userId: order.userId,
        userEmail: order.userEmail,
        productId: order.productId,
        quantity: order.quantity,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    } finally {
      connection.release();
    }
  }

  // Get order by ID
  static async findById(orderId: string): Promise<Order | null> {
    const connection = await pool.getConnection();
    
    try {
      const [orders] = await connection.execute(
        'SELECT * FROM orders WHERE id = ?',
        [orderId]
      );

      if ((orders as any[]).length === 0) {
        return null;
      }

      const order = (orders as any[])[0];
      
      return {
        id: order.id,
        userId: order.userId,
        userEmail: order.userEmail,
        productId: order.productId,
        quantity: order.quantity,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    } finally {
      connection.release();
    }
  }

  // Get orders by user ID
  static async findByUserId(userId: string): Promise<Order[]> {
    const connection = await pool.getConnection();
    
    try {
      const [orders] = await connection.execute(
        'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC',
        [userId]
      );

      return (orders as any[]).map(order => ({
        id: order.id,
        userId: order.userId,
        userEmail: order.userEmail,
        productId: order.productId,
        quantity: order.quantity,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }));
    } finally {
      connection.release();
    }
  }

  // Update order status
  static async updateStatus(orderId: string, status: Order['status']): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, orderId]
      );

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  // Get all orders (for admin purposes)
  static async findAll(): Promise<Order[]> {
    const connection = await pool.getConnection();
    
    try {
      const [orders] = await connection.execute(
        'SELECT * FROM orders ORDER BY createdAt DESC'
      );

      return (orders as any[]).map(order => ({
        id: order.id,
        userId: order.userId,
        userEmail: order.userEmail,
        productId: order.productId,
        quantity: order.quantity,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }));
    } finally {
      connection.release();
    }
  }
}
