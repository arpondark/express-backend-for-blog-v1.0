# Express Backend for Blog Application

A complete Express.js backend with authentication, file uploads, and blog post management.

## Features

- **Authentication System**: JWT-based login/register
- **File Uploads**: Cloudinary integration for image uploads
- **Blog Posts**: Full CRUD operations with authorization
- **Protected Routes**: Middleware for securing endpoints
- **Rate Limiting**: Basic protection against abuse

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post (protected)
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id` - Update post (protected, owner only)
- `DELETE /api/posts/:id` - Delete post (protected, owner only)

### Upload
- `POST /api/upload` - Upload image to Cloudinary (protected)

## Setup Instructions

1. **Install dependencies:**
```bash
cd express-backend
npm install
```

2. **Environment Variables:**
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required variables:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

3. **Run the server:**
```bash
npm run dev  # Development with auto-restart
npm start    # Production
```

## Usage Examples

### Authentication
```javascript
// Register
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'johndoe',
    email: 'john@example.com',
    password: 'password123'
  })
});

// Login
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

const { token } = await loginResponse.json();
```

### Protected Requests
```javascript
// Create post
const response = await fetch('http://localhost:5000/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'My Post',
    desc: 'Post description',
    content: 'Post content',
    img: 'image-url',
    username: 'johndoe'
  })
});
```

### File Upload
```javascript
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('http://localhost:5000/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const { url } = await response.json();
```

## Middleware

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Authentication**: JWT token validation
- **Authorization**: User ownership checks for posts
- **File Validation**: Image files only, 5MB limit

## Error Handling

The API returns consistent error responses:
```json
{
  "error": "Error message here"
}
```

Common status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error