# Sri Lankan Cuisine Blog

A modern, open-source blog platform showcasing the rich culinary heritage of Sri Lanka. Built with Flask, MongoDB, and Cloudinary, featuring a beautiful dark/light theme toggle and responsive design.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🍛 **Food Articles**: Browse and discover authentic Sri Lankan recipes and cuisine
- 💬 **Comments System**: Engage with the community through comments
- 🎨 **Modern UI/UX**: Beautiful, responsive design with smooth animations
- 🌓 **Dark/Light Theme**: Toggle between themes with localStorage persistence
- 🔐 **Admin Panel**: Secure admin authentication for content management
- ☁️ **Cloud Storage**: Images stored and optimized via Cloudinary
- 📱 **Responsive**: Works seamlessly on desktop, tablet, and mobile
- 🚀 **Fast & Scalable**: MongoDB backend for optimal performance

## 🛠️ Technology Stack

### Backend
- **Flask 3.0** - Python web framework
- **MongoDB** - NoSQL database
- **PyMongo** - MongoDB driver
- **Cloudinary** - Image storage and optimization
- **Flask-CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with custom properties
- **JavaScript (ES6+)** - Interactive functionality
- **Bootstrap 5** - UI components
- **Bootstrap Icons** - Icon library

## 📋 Prerequisites

- Python 3.9 or higher
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (free tier available)
- Modern web browser

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Sri_Lankan_Cuisine.git
cd Sri_Lankan_Cuisine
```

### 2. Set Up Python Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\\Scripts\\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sri_lankan_cuisine_db
MONGODB_DB_NAME=sri_lankan_cuisine_db

# Flask Configuration
SECRET_KEY=your_secret_key_here_change_in_production
FLASK_ENV=development

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server Configuration
PORT=5000
HOST=localhost
```

### 4. Set Up MongoDB

#### Option A: MongoDB Atlas (Recommended)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Add it to `.env` as `MONGODB_URI`

#### Option B: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use `mongodb://localhost:27017/` as your `MONGODB_URI`

### 5. Set Up Cloudinary

1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. Get your credentials from the dashboard
3. Add them to `.env`

### 6. Migrate Data (Optional)

If you have existing SQLite data:

```bash
python backend/migrations/migrate_to_mongodb.py
```

### 7. Run the Application

```bash
# Start the backend server
python backend/app.py
```

The API will be available at `http://localhost:5000`

### 8. Open the Frontend

Open `frontend/public/index.html` in your browser, or use a local server:

```bash
# Using Python's built-in server
cd frontend/public
python -m http.server 8000
```

Then visit `http://localhost:8000`

## 📁 Project Structure

```
Sri_Lankan_Cuisine/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── config.py              # Configuration settings
│   ├── models/
│   │   ├── food.py           # Food model
│   │   ├── comment.py        # Comment model
│   │   └── admin.py          # Admin model
│   ├── routes/
│   │   ├── food_routes.py    # Food endpoints
│   │   ├── comment_routes.py # Comment endpoints
│   │   ├── admin_routes.py   # Admin endpoints
│   │   └── upload_routes.py  # Upload endpoints
│   ├── utils/
│   │   ├── db.py             # Database connection
│   │   ├── cloudinary_helper.py # Cloudinary integration
│   │   └── auth.py           # Authentication utilities
│   └── migrations/
│       └── migrate_to_mongodb.py # Data migration script
├── frontend/
│   ├── public/
│   │   ├── index.html        # Home page
│   │   ├── review.html       # Comments page
│   │   ├── contact.html      # Contact page
│   │   └── admin/
│   │       ├── login.html    # Admin login
│   │       └── dashboard.html # Admin dashboard
│   └── assets/
│       ├── css/
│       │   ├── theme.css     # Theme system
│       │   └── main.css      # Main styles
│       └── js/
│           ├── theme.js      # Theme manager
│           ├── api.js        # API helper
│           └── main.js       # Main app logic
├── .env                       # Environment variables (create this)
├── .env.example              # Environment template
├── .gitignore
├── requirements.txt
├── README.md
└── implementation_plan.md
```

## 🔑 Default Admin Credentials

**Username**: `admin`  
**Password**: `password123`

⚠️ **Important**: Change these credentials immediately after first login!

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Foods
- `GET /foods` - Get all foods
- `GET /foods/:id` - Get single food
- `POST /foods` - Create food (Admin)
- `PUT /foods/:id` - Update food (Admin)
- `DELETE /foods/:id` - Delete food (Admin)

#### Comments
- `GET /comments/food/:foodId` - Get comments for food
- `GET /comments` - Get all comments (Admin)
- `POST /comments` - Create comment
- `PUT /comments/:id` - Update comment (Admin)
- `DELETE /comments/:id` - Delete comment (Admin)
- `POST /comments/:id/approve` - Approve comment (Admin)
- `POST /comments/:id/reject` - Reject comment (Admin)

#### Admin
- `POST /admin/login` - Admin login
- `POST /admin/logout` - Admin logout
- `GET /admin/check-auth` - Check authentication
- `POST /admin/change-password` - Change password

#### Upload
- `POST /upload/image` - Upload image to Cloudinary (Admin)

## 🎨 Theme System

The application features a sophisticated dark/light theme system:

- **Automatic Detection**: Respects system preferences
- **Manual Toggle**: Switch themes with a button click
- **Persistence**: Theme choice saved in localStorage
- **Smooth Transitions**: Animated theme changes

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Sri Lankan culinary community
- Bootstrap team for the UI framework
- MongoDB and Cloudinary for their excellent services

## 📧 Contact

For questions or support, please contact: info.srilankancuisine24@gmail.com

## 🗺️ Roadmap

- [ ] User authentication and profiles
- [ ] Recipe ratings and reviews
- [ ] Social media sharing
- [ ] Newsletter subscription
- [ ] Multi-language support (Sinhala, Tamil, English)
- [ ] Advanced search and filters
- [ ] Mobile app (React Native)

---

Made with ❤️ for Sri Lankan cuisine enthusiasts worldwide
