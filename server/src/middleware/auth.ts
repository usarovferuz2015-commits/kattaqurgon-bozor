// ============================================
// Auth Middleware
// ============================================
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.utils';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        telegramId: number;
        role: string;
      };
    }
  }
}

/**
 * Authenticates requests using JWT token in Authorization header.
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized: No token provided' 
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized: Invalid or expired token' 
    });
  }

  // Attach decoded user info to the request
  req.user = {
    id: decoded.id,
    telegramId: decoded.telegramId,
    role: decoded.role,
  };

  next();
}

/**
 * Ensures the user has admin role.
 */
export async function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Forbidden: Admin access required' 
    });
  }
  next();
}
