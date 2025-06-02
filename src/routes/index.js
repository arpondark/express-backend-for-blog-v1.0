const express = require('express');
const router = express.Router();
const { getPosts, createPost, getPostById, updatePost, deletePost } = require('../controllers/index');
const { register, login, getCurrentUser } = require('../controllers/authController');
const { uploadFile, upload } = require('../controllers/uploadController');
const { authenticateToken, optionalAuth, authorizePostOwner, rateLimit } = require('../middleware/index');

// Apply rate limiting to all routes
router.use(rateLimit());

// Auth routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticateToken, getCurrentUser);

// Upload route (protected)
router.post('/upload', authenticateToken, upload.single('file'), uploadFile);

// Posts routes
router.get('/posts', optionalAuth, getPosts);
router.post('/posts', authenticateToken, createPost);
router.get('/posts/:id', getPostById);
router.put('/posts/:id', authenticateToken, authorizePostOwner, updatePost);
router.delete('/posts/:id', authenticateToken, authorizePostOwner, deletePost);

module.exports = router;