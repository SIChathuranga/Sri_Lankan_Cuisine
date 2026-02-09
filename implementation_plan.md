# Sri Lankan Cuisine Blog - Refactoring Implementation Plan

## Project Overview
Refactoring an unfinished open-source blog website for Sri Lankan cuisine with modern architecture, improved UX/UI, and cloud deployment readiness.

**Deployment Targets:**
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Image Storage: Cloudinary

---

## Current State Analysis

### Existing Structure
```
Sri_Lankan_Cuisine/
├── frontend/
│   ├── Client/          # Public-facing pages (HTML, CSS, JS)
│   │   ├── home.html/css/js
│   │   ├── review.html/css/js
│   │   ├── contactus.html/css/js
│   │   └── src/         # Carousel images (6 images)
│   └── Admin/           # Admin panel
│       ├── login.html/css/js
│       ├── admin.html/css/js
│       └── admin-review.html/css/js
├── backend/             # Currently empty (needs Python backend)
└── README.md
```

### Issues Identified
1. ❌ No backend implementation
2. ❌ No database integration
3. ❌ No image upload/storage system
4. ❌ Basic UI without modern theme system
5. ❌ Comment form on separate page (needs to be on home page)
6. ❌ No comment approval workflow
7. ❌ Not deployment-ready

---

## Technology Stack

### Backend
- **Framework:** Flask (Python)
- **Database:** MongoDB (via PyMongo)
- **Image Storage:** Cloudinary
- **Authentication:** Flask sessions with secure admin login
- **CORS:** Flask-CORS for frontend communication
- **Environment:** python-dotenv for configuration

### Frontend
- **Core:** HTML5, CSS3, JavaScript (ES6+)
- **UI Framework:** Bootstrap 5
- **Icons:** Bootstrap Icons
- **Theme:** Custom dark/light mode with localStorage persistence

### Deployment
- **Frontend:** Vercel (static hosting)
- **Backend:** Render (Python web service)
- **Database:** MongoDB Atlas (cloud)
- **CDN:** Cloudinary (image hosting)

---

## Implementation Phases

## Phase 1: Backend Infrastructure Setup ⚙️

### 1.1 Project Structure Creation
**Files to create:**
```
backend/
├── app.py                      # Main Flask application
├── config.py                   # Configuration management
├── requirements.txt            # Python dependencies
├── .env.example               # Environment template
├── models/
│   ├── __init__.py
│   ├── food.py                # Food article model
│   ├── comment.py             # Comment model
│   └── admin.py               # Admin user model
├── routes/
│   ├── __init__.py
│   ├── food_routes.py         # Food CRUD endpoints
│   ├── comment_routes.py      # Comment management
│   ├── admin_routes.py        # Admin authentication
│   └── upload_routes.py       # Image upload to Cloudinary
├── utils/
│   ├── __init__.py
│   ├── db.py                  # MongoDB connection
│   ├── cloudinary_helper.py   # Cloudinary integration
│   └── auth.py                # Authentication middleware
└── migrations/
    └── seed_data.py           # Initial data seeding
```

**Tasks:**
- [ ] Create Flask application with CORS support
- [ ] Set up MongoDB connection with PyMongo
- [ ] Configure Cloudinary SDK
- [ ] Implement environment variable management
- [ ] Create requirements.txt with all dependencies

**Dependencies (requirements.txt):**
```
Flask==3.0.0
flask-cors==4.0.0
pymongo==4.6.0
python-dotenv==1.0.0
cloudinary==1.37.0
dnspython==2.4.2
gunicorn==21.2.0
```

### 1.2 Database Models

**Food Model (models/food.py):**
```python
{
    "_id": ObjectId,
    "title": str,
    "description": str,
    "image_url": str,          # Cloudinary URL
    "image_public_id": str,    # For deletion
    "ingredients": [str],
    "instructions": str,
    "category": str,
    "created_at": datetime,
    "updated_at": datetime,
    "is_active": bool
}
```

**Comment Model (models/comment.py):**
```python
{
    "_id": ObjectId,
    "name": str,
    "email": str,
    "comment_text": str,
    "status": str,             # "pending", "approved", "rejected"
    "created_at": datetime,
    "reviewed_at": datetime,
    "reviewed_by": str         # Admin username
}
```

**Admin Model (models/admin.py):**
```python
{
    "_id": ObjectId,
    "username": str,
    "password_hash": str,      # Hashed password
    "email": str,
    "created_at": datetime,
    "last_login": datetime
}
```

**Tasks:**
- [ ] Create MongoDB schemas with validation
- [ ] Implement model helper functions
- [ ] Add indexes for performance (email, status, created_at)

### 1.3 API Routes Implementation

**Food Routes (routes/food_routes.py):**
- `GET /api/foods` - Get all active foods (public)
- `GET /api/foods/:id` - Get single food (public)
- `POST /api/foods` - Create food (admin only)
- `PUT /api/foods/:id` - Update food (admin only)
- `DELETE /api/foods/:id` - Delete food (admin only)

**Comment Routes (routes/comment_routes.py):**
- `GET /api/comments/approved` - Get approved comments (public)
- `GET /api/comments/all` - Get all comments (admin only)
- `POST /api/comments` - Submit comment (public)
- `PUT /api/comments/:id/approve` - Approve comment (admin only)
- `PUT /api/comments/:id/reject` - Reject/delete comment (admin only)

**Admin Routes (routes/admin_routes.py):**
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/check-auth` - Check authentication status
- `PUT /api/admin/change-password` - Change password

**Upload Routes (routes/upload_routes.py):**
- `POST /api/upload/image` - Upload image to Cloudinary (admin only)

**Tasks:**
- [ ] Implement all API endpoints
- [ ] Add request validation
- [ ] Implement error handling
- [ ] Add authentication middleware for admin routes
- [ ] Test all endpoints with Postman/Thunder Client

### 1.4 Cloudinary Integration

**Features:**
- Image upload with automatic optimization
- Thumbnail generation
- Secure deletion
- URL transformation for responsive images

**Tasks:**
- [ ] Set up Cloudinary configuration
- [ ] Create upload helper function
- [ ] Implement image deletion on food removal
- [ ] Add image validation (size, format)

---

## Phase 2: Frontend Modernization 🎨

### 2.1 Theme System Implementation

**Features:**
- Dark/Light mode toggle
- System preference detection
- Smooth transitions
- localStorage persistence
- Consistent color palette

**Files to create/modify:**
```
frontend/Client/
├── css/
│   ├── theme.css          # Theme variables and transitions
│   ├── common.css         # Shared styles
│   └── components.css     # Reusable components
└── js/
    ├── theme.js           # Theme management
    ├── api.js             # API helper functions
    └── config.js          # Frontend configuration
```

**Color Palette:**
```css
/* Light Theme */
--bg-primary: #ffffff
--bg-secondary: #f8f9fa
--text-primary: #212529
--text-secondary: #6c757d
--accent: #ff6b35
--accent-hover: #ff5722

/* Dark Theme */
--bg-primary: #1a1a2e
--bg-secondary: #16213e
--text-primary: #eaeaea
--text-secondary: #a0a0a0
--accent: #ff6b35
--accent-hover: #ff8c42
```

**Tasks:**
- [ ] Create CSS custom properties for theming
- [ ] Implement theme toggle button
- [ ] Add smooth transitions (0.3s ease)
- [ ] Save theme preference to localStorage
- [ ] Apply theme to all pages

### 2.2 Home Page Refactoring (home.html)

**Changes:**
1. **Move comment form to bottom** (before footer)
   - Minimalistic design
   - Floating card style
   - Smooth scroll to form
   
2. **Enhance carousel**
   - Use existing 6 images from `/src`
   - Add overlay gradient
   - Improve caption styling
   - Add autoplay controls

3. **Food showcase improvements**
   - Card hover effects
   - Lazy loading images
   - Skeleton loaders
   - Improved pagination

4. **Modern interactions**
   - Smooth scroll behavior
   - Fade-in animations on scroll
   - Micro-interactions on buttons
   - Toast notifications for form submissions

**Tasks:**
- [ ] Restructure HTML layout
- [ ] Move comment form to bottom
- [ ] Add animation classes
- [ ] Implement smooth scroll
- [ ] Connect to backend API
- [ ] Add loading states

### 2.3 Comments Page Refactoring (review.html)

**New Design:**
- **Remove comment form** (now on home page)
- **List view of approved comments**
  - Card-based layout
  - Show comment text, name, date
  - Chronological order (newest first)
  - Infinite scroll or pagination
  - Empty state design

**Tasks:**
- [ ] Remove comment form section
- [ ] Create comment card component
- [ ] Implement date formatting
- [ ] Add infinite scroll
- [ ] Connect to backend API
- [ ] Add loading skeleton

### 2.4 Admin Panel Enhancement

**Admin Login (Admin/login.html):**
- Modern login form
- Password visibility toggle
- Remember me option
- Error handling with animations

**Admin Dashboard (Admin/admin.html):**
- Food management interface
- Image upload with preview
- Rich text editor for descriptions
- Drag-and-drop image upload

**Admin Review (Admin/admin-review.html):**
- Pending comments list
- Approve/Reject buttons
- Comment details modal
- Bulk actions
- Filter by status

**Tasks:**
- [ ] Redesign admin login page
- [ ] Create food management UI
- [ ] Implement image upload interface
- [ ] Build comment moderation interface
- [ ] Add admin authentication checks
- [ ] Connect all admin features to backend

### 2.5 Responsive Design

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Tasks:**
- [ ] Test all pages on mobile
- [ ] Optimize carousel for mobile
- [ ] Ensure touch-friendly buttons
- [ ] Test dark/light theme on all devices

---

## Phase 3: API Integration 🔌

### 3.1 API Helper Module (js/api.js)

**Features:**
- Centralized API calls
- Error handling
- Loading states
- Token management for admin

**Functions:**
```javascript
// Public APIs
- fetchFoods()
- fetchFoodById(id)
- submitComment(commentData)
- fetchApprovedComments()

// Admin APIs
- adminLogin(credentials)
- adminLogout()
- checkAuth()
- createFood(foodData)
- updateFood(id, foodData)
- deleteFood(id)
- uploadImage(file)
- fetchAllComments()
- approveComment(id)
- rejectComment(id)
```

**Tasks:**
- [ ] Create API base URL configuration
- [ ] Implement fetch wrapper with error handling
- [ ] Add request/response interceptors
- [ ] Implement token storage for admin
- [ ] Add retry logic for failed requests

### 3.2 Frontend-Backend Connection

**Home Page (home.js):**
- [ ] Fetch and display foods
- [ ] Implement search functionality
- [ ] Handle comment submission
- [ ] Show success/error messages

**Review Page (review.js):**
- [ ] Fetch approved comments
- [ ] Display comments with formatting
- [ ] Implement pagination/infinite scroll

**Admin Pages:**
- [ ] Login authentication
- [ ] Food CRUD operations
- [ ] Image upload with Cloudinary
- [ ] Comment moderation

---

## Phase 4: Deployment Preparation 🚀

### 4.1 Backend Deployment (Render)

**Files to create:**
```
backend/
├── render.yaml            # Render configuration
├── Procfile              # Process file
└── runtime.txt           # Python version
```

**render.yaml:**
```yaml
services:
  - type: web
    name: sri-lankan-cuisine-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: MONGODB_URI
        sync: false
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
      - key: SECRET_KEY
        sync: false
```

**Tasks:**
- [ ] Create Render configuration
- [ ] Set up environment variables on Render
- [ ] Configure MongoDB Atlas connection
- [ ] Test deployment
- [ ] Set up custom domain (optional)

### 4.2 Frontend Deployment (Vercel)

**Files to create:**
```
frontend/
├── vercel.json           # Vercel configuration
└── .vercelignore        # Files to ignore
```

**vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "Client/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/Client/$1"
    }
  ]
}
```

**Tasks:**
- [ ] Create Vercel configuration
- [ ] Update API URLs to production backend
- [ ] Configure environment variables
- [ ] Test deployment
- [ ] Set up custom domain (optional)

### 4.3 Database Setup (MongoDB Atlas)

**Tasks:**
- [ ] Create MongoDB Atlas account
- [ ] Create cluster (free tier)
- [ ] Set up database user
- [ ] Configure IP whitelist (0.0.0.0/0 for Render)
- [ ] Get connection string
- [ ] Create database and collections
- [ ] Set up indexes
- [ ] Seed initial admin user

### 4.4 Cloudinary Setup

**Tasks:**
- [ ] Create Cloudinary account (free tier)
- [ ] Get API credentials
- [ ] Configure upload presets
- [ ] Set up folder structure
- [ ] Configure transformation settings

---

## Phase 5: Testing & Optimization 🧪

### 5.1 Functional Testing

**Frontend:**
- [ ] Test all user flows
- [ ] Test comment submission
- [ ] Test theme toggle
- [ ] Test responsive design
- [ ] Test cross-browser compatibility

**Backend:**
- [ ] Test all API endpoints
- [ ] Test authentication
- [ ] Test image upload
- [ ] Test error handling
- [ ] Test database operations

**Admin Panel:**
- [ ] Test login/logout
- [ ] Test food CRUD
- [ ] Test comment moderation
- [ ] Test image management

### 5.2 Performance Optimization

**Frontend:**
- [ ] Minify CSS/JS
- [ ] Optimize images
- [ ] Implement lazy loading
- [ ] Add service worker (PWA)
- [ ] Optimize carousel images

**Backend:**
- [ ] Add database indexes
- [ ] Implement caching
- [ ] Optimize queries
- [ ] Add rate limiting
- [ ] Enable gzip compression

### 5.3 Security

**Backend:**
- [ ] Implement CSRF protection
- [ ] Add rate limiting
- [ ] Sanitize user inputs
- [ ] Secure admin routes
- [ ] Use HTTPS only

**Frontend:**
- [ ] Sanitize user inputs
- [ ] Implement XSS protection
- [ ] Secure localStorage usage

---

## Phase 6: Documentation & Launch 📚

### 6.1 Documentation

**Files to update:**
- [ ] README.md - Installation and deployment guide
- [ ] API_DOCUMENTATION.md - API endpoints
- [ ] CONTRIBUTING.md - Contribution guidelines
- [ ] .env.example - Environment variables template

### 6.2 Final Checks

- [ ] Update all dependencies
- [ ] Remove console.logs
- [ ] Add proper error messages
- [ ] Test production builds
- [ ] Create backup strategy
- [ ] Set up monitoring (optional)

### 6.3 Launch

- [ ] Deploy backend to Render
- [ ] Deploy frontend to Vercel
- [ ] Test production environment
- [ ] Create initial admin user
- [ ] Seed sample food data
- [ ] Announce launch

---

## File Structure (Final)

```
Sri_Lankan_Cuisine/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   ├── render.yaml
│   ├── Procfile
│   ├── runtime.txt
│   ├── .env.example
│   ├── models/
│   │   ├── __init__.py
│   │   ├── food.py
│   │   ├── comment.py
│   │   └── admin.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── food_routes.py
│   │   ├── comment_routes.py
│   │   ├── admin_routes.py
│   │   └── upload_routes.py
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── db.py
│   │   ├── cloudinary_helper.py
│   │   └── auth.py
│   └── migrations/
│       └── seed_data.py
├── frontend/
│   ├── vercel.json
│   ├── .vercelignore
│   ├── Client/
│   │   ├── home.html
│   │   ├── review.html
│   │   ├── contactus.html
│   │   ├── css/
│   │   │   ├── theme.css
│   │   │   ├── common.css
│   │   │   ├── components.css
│   │   │   ├── home.css
│   │   │   ├── review.css
│   │   │   └── contactus.css
│   │   ├── js/
│   │   │   ├── theme.js
│   │   │   ├── api.js
│   │   │   ├── config.js
│   │   │   ├── home.js
│   │   │   ├── review.js
│   │   │   └── contactus.js
│   │   └── src/
│   │       └── [carousel images]
│   └── Admin/
│       ├── login.html
│       ├── admin.html
│       ├── admin-review.html
│       └── [corresponding CSS/JS files]
├── .gitignore
├── README.md
├── implementation_plan.md
└── API_DOCUMENTATION.md
```

---

## Environment Variables

### Backend (.env)
```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB_NAME=sri_lankan_cuisine

# Flask
SECRET_KEY=your-secret-key-here
FLASK_ENV=production

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server
PORT=5000
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

### Frontend (config.js)
```javascript
const API_BASE_URL = 'https://your-render-app.onrender.com/api';
```

---

## Timeline Estimate

| Phase | Duration | Priority |
|-------|----------|----------|
| Phase 1: Backend Infrastructure | 3-4 days | HIGH |
| Phase 2: Frontend Modernization | 3-4 days | HIGH |
| Phase 3: API Integration | 2-3 days | HIGH |
| Phase 4: Deployment Preparation | 2 days | MEDIUM |
| Phase 5: Testing & Optimization | 2-3 days | HIGH |
| Phase 6: Documentation & Launch | 1-2 days | MEDIUM |
| **Total** | **13-18 days** | |

---

## Success Criteria

✅ **Functionality:**
- Users can view food articles with images
- Users can submit comments (pending approval)
- Admin can login securely
- Admin can create/edit/delete food articles
- Admin can approve/reject comments
- Only approved comments are visible to public

✅ **Design:**
- Modern, responsive UI
- Smooth dark/light theme toggle
- Professional animations and transitions
- Mobile-friendly interface

✅ **Performance:**
- Page load < 3 seconds
- Images optimized via Cloudinary
- Smooth scrolling and interactions

✅ **Deployment:**
- Frontend live on Vercel
- Backend live on Render
- Database on MongoDB Atlas
- Images on Cloudinary

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Set up development environment**
3. **Create MongoDB Atlas account**
4. **Create Cloudinary account**
5. **Start Phase 1: Backend Infrastructure**

---

## Notes

- All existing carousel images will be preserved
- Current HTML structure will be enhanced, not completely rewritten
- Admin credentials will be securely hashed
- Comment moderation ensures quality content
- Open-source nature maintained (MIT License)

---

**Last Updated:** 2026-02-09
**Version:** 1.0
**Status:** Ready for Implementation
