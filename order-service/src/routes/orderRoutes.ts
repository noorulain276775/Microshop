import { Router, Request, Response } from 'express';
import { OrderModel, CreateOrderRequest } from '../models/Order';
import { authenticateToken } from '../middleware/auth';
import { publishOrderEvent } from '../config/kafka';

const router = Router();

// POST /orders - Create a new order
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Extract user info from JWT (set by auth middleware)
    const { id: userId, email: userEmail } = req.user!;
    
    // Validate request body
    const { productId, quantity, productPrice }: CreateOrderRequest = req.body;
    
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Product ID and valid quantity are required'
      });
    }

    // Create order in database
    const order = await OrderModel.create(userId, userEmail, {
      productId,
      quantity,
      productPrice
    });

    // Publish order-created event to Kafka
    try {
      await publishOrderEvent({
        orderId: order.id,
        userId: order.userId,
        userEmail: order.userEmail,
        username: req.user!.username,
        productId: order.productId,
        quantity: order.quantity,
        total: order.total,
        status: order.status,
        timestamp: new Date().toISOString()
      });

      console.log(`Order created and event published: ${order.id}`);
    } catch (kafkaError) {
      console.error('Failed to publish Kafka event:', kafkaError);
      // Note: Order is still created in database even if Kafka fails
      // In production, you might want to implement retry logic or dead letter queue
    }

    // Return success response
    res.status(201).json({
      status: 'success',
      message: 'Order placed successfully',
      orderId: order.id,
      order: {
        id: order.id,
        productId: order.productId,
        quantity: order.quantity,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create order'
    });
  }
});

// GET /orders - Get user's orders
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.user!;
    
    const orders = await OrderModel.findByUserId(userId);
    
    res.json({
      status: 'success',
      message: 'Orders retrieved successfully',
      orders: orders.map(order => ({
        id: order.id,
        productId: order.productId,
        quantity: order.quantity,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt
      }))
    });

  } catch (error) {
    console.error('Error retrieving orders:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve orders'
    });
  }
});

// GET /orders/:id - Get specific order
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id: orderId } = req.params;
    const { id: userId } = req.user!;
    
    const order = await OrderModel.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Ensure user can only access their own orders
    if (order.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    res.json({
      status: 'success',
      message: 'Order retrieved successfully',
      order: {
        id: order.id,
        productId: order.productId,
        quantity: order.quantity,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });

  } catch (error) {
    console.error('Error retrieving order:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve order'
    });
  }
});

// PUT /orders/:id/status - Update order status (for admin/future use)
router.put('/:id/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id: orderId } = req.params;
    const { status } = req.body;
    const { id: userId } = req.user!;
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status value'
      });
    }

    const order = await OrderModel.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Ensure user can only update their own orders
    if (order.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const updated = await OrderModel.updateStatus(orderId, status);
    
    if (updated) {
      res.json({
        status: 'success',
        message: 'Order status updated successfully'
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Failed to update order status'
      });
    }

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update order status'
    });
  }
});

export default router;
