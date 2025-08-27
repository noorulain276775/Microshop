import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Extend Request interface to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
      };
    }
  }
}

// JWT secret (must match User Service)
const JWT_SECRET = process.env.JWT_SECRET;

// Validate that JWT_SECRET is provided
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ 
      status: 'error', 
      message: 'Access token required' 
    });
    return;
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Extract user information from JWT claims
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username
    };

    console.log(`User authenticated: ${decoded.email} (ID: ${decoded.id})`);
    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    res.status(403).json({ 
      status: 'error', 
      message: 'Invalid or expired token' 
    });
  }
};

// Optional: Check if user has specific role (for future use)
export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // For now, just check if user exists
    // Role-based access control can be implemented later
    if (req.user) {
      next();
    } else {
      res.status(403).json({ 
        status: 'error', 
        message: 'Insufficient permissions' 
      });
    }
  };
};
