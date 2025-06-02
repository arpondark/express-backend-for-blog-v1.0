const express = require('express');
const jwt = require('jsonwebtoken');

// Basic middleware for logging and validation
const requestLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};

const validatePostData = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const { title, desc, content } = req.body;
    
    if (!title || !desc || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, desc, and content are required' 
      });
    }
  }
  next();
};

// Authentication middleware - validates JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Optional authentication - doesn't fail if no token provided
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key', (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
};

// Authorization middleware - checks if user owns the resource
const authorizePostOwner = async (req, res, next) => {
  try {
    const { Post } = require('../models/index');
    const { id } = req.params;
    
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the authenticated user is the owner of the post
    if (post.username !== req.user.email && post.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied. You can only modify your own posts.' });
    }

    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

// Rate limiting middleware (basic implementation)
const rateLimitMap = new Map();
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitMap.has(clientId)) {
      rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const clientData = rateLimitMap.get(clientId);
    
    if (now > clientData.resetTime) {
      rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (clientData.count >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    
    clientData.count++;
    next();
  };
};

const router = express.Router();

// Example middleware: Logging requests
router.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Example middleware: Authentication (placeholder)
router.use((req, res, next) => {
    // Implement authentication logic here
    next();
});

router.use(requestLogger);
router.use(validatePostData);

module.exports = {
  requestLogger,
  validatePostData,
  authenticateToken,
  optionalAuth,
  authorizePostOwner,
  rateLimit,
};