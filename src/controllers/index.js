const { Post, User } = require('../models/index');
const mongoose = require('mongoose');

// Database connection helper (you'll need to implement this)
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected successfully!');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

// GET /posts - Fetch all posts
const getPosts = async (req, res) => {
  try {
    console.log('Attempting to connect to database...');
    await connectDB();
    console.log('Database connected successfully!');
    
    const posts = await Post.find().sort({ createdAt: -1 });
    
    res.status(200).json(posts);
  } catch (error) {
    console.error('Database connection or query failed:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

// POST /posts - Create a new post
const createPost = async (req, res) => {
  try {
    await connectDB();
    
    const { title, desc, img, content, username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    const newPost = new Post({
      title,
      desc,
      img,
      content,
      username
    });
    
    await newPost.save();
    
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

// GET /posts/:id - Fetch a single post by ID
const getPostById = async (req, res) => {
  const { id } = req.params;
  
  try {
    await connectDB();
    
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Database Error" });
  }
};

// PUT /posts/:id - Update a post
const updatePost = async (req, res) => {
  const { id } = req.params;
  
  try {
    await connectDB();
    
    const { title, desc, img, content } = req.body;
    
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { title, desc, img, content },
      { new: true }
    );
    
    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
};

// DELETE /posts/:id - Delete a post
const deletePost = async (req, res) => {
  const { id } = req.params;
  
  try {
    await connectDB();
    
    const deletedPost = await Post.findByIdAndDelete(id);
    
    if (!deletedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

module.exports = {
  getPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost
};