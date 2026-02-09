# Sri Lankan Cuisine - Deployment Guide

This guide will walk you through deploying the Sri Lankan Cuisine blog. The backend will be hosted on **Render** and the frontend on **Vercel**.

## 📋 Prerequisites

Before you begin, ensure you have accounts on:
1. **GitHub** (to host your code)
2. **MongoDB Atlas** (for the database)
3. **Cloudinary** (for image storage)
4. **Render** (for the backend)
5. **Vercel** (for the frontend)

---

## 1️⃣ Database Setup (MongoDB Atlas)

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Project and a **FREE (M0)** cluster.
3. In **Database Access**, create a user:
   - Username: `admin` (or your choice)
   - Password: `your-secure-password`
   - Role: `Atlas Admin`
4. In **Network Access**, add IP Address `0.0.0.0/0` (Allow access from anywhere).
5. Go to **Database** -> **Connect** -> **Drivers** (Python 3.6+).
6. Copy the connection string. It looks like:
   `mongodb+srv://admin:<password>@cluster0.example.mongodb.net/?retryWrites=true&w=majority`
7. Replace `<password>` with your actual password and add database name: `sri_lankan_cuisine_db`

---

## 2️⃣ Image Storage Setup (Cloudinary)

1. Log in to [Cloudinary](https://cloudinary.com).
2. Go to the **Dashboard**.
3. Copy your **Cloud Name**, **API Key**, and **API Secret**.

---

## 3️⃣ Backend Deployment (Render)

### Step 1: Push to GitHub
1. Ensure your code is pushed to a GitHub repository.

### Step 2: Create Render Web Service
1. Log in to [Render](https://render.com).
2. Click **New** -> **Web Service**.
3. Connect your GitHub repository.

### Step 3: Configure the Service
- **Name**: `sri-lankan-cuisine-api`
- **Root Directory**: `backend` (⚠️ Important!)
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app`
- **Plan**: Free

### Step 4: Add Environment Variables
Scroll down to **Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB connection string |
| `MONGODB_DB_NAME` | `sri_lankan_cuisine_db` |
| `SECRET_KEY` | Generate a random secure string (32+ chars) |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary Dashboard |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | `your-secure-password` |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` (update after Vercel deploy) |

### Step 5: Deploy
1. Click **Create Web Service**.
2. Wait for the build to finish.
3. Copy the **Service URL** (e.g., `https://sri-lankan-cuisine-api.onrender.com`).

---

## 4️⃣ Update Frontend API URL

**Before deploying to Vercel**, update the backend URL in your frontend:

1. Open `frontend/Client/js/config.js`
2. Find this line at the top:
   ```javascript
   const PRODUCTION_API_URL = 'https://your-backend-app.onrender.com/api';
   ```
3. Replace with your actual Render URL:
   ```javascript
   const PRODUCTION_API_URL = 'https://sri-lankan-cuisine-api.onrender.com/api';
   ```
4. Commit and push this change to GitHub.

---

## 5️⃣ Frontend Deployment (Vercel)

### Step 1: Create Vercel Project
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.

### Step 2: Configure Project
- **Framework Preset**: Other
- **Root Directory**: `frontend` (⚠️ Important! Set it to `frontend`, NOT `frontend/Client`)
- Click **Deploy**

### Step 3: Get Your Vercel URL
After deployment, copy your Vercel URL (e.g., `https://sri-lankan-cuisine.vercel.app`).

---

## 6️⃣ Final Configuration - Update CORS

1. Go back to **Render Dashboard** -> Your Web Service -> **Environment Variables**.
2. Update `ALLOWED_ORIGINS` with your Vercel URL:
   ```
   https://sri-lankan-cuisine.vercel.app
   ```
3. Click **Save Changes** (Render will automatically redeploy).

---

## 🔗 URL Structure

After deployment, your site will be accessible at:

| Page | URL |
|------|-----|
| Home | `https://your-app.vercel.app/` |
| Reviews | `https://your-app.vercel.app/reviews` |
| Contact | `https://your-app.vercel.app/contact` |
| Admin Login | `https://your-app.vercel.app/admin` |
| Admin Dashboard | `https://your-app.vercel.app/admin/dashboard` |
| Admin Reviews | `https://your-app.vercel.app/admin/reviews` |

---

## 🚀 Verification

1. Open your Vercel URL.
2. Check if the home page loads correctly.
3. Check browser console (F12) for any API errors.
4. Test the admin login at `/admin`.
5. Try adding a recipe and a comment.

### Common Issues

**API calls failing (CORS errors)**:
- Ensure `ALLOWED_ORIGINS` on Render includes your Vercel URL.
- Make sure URLs don't have trailing slashes.

**"Failed to load recipes" error**:
- Backend might be sleeping (free tier takes ~30s to wake up).
- Click "Retry" or refresh after 30 seconds.
- Check Render logs for errors.

**Admin login not working**:
- Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` env vars on Render.
- Check browser console for error details.

---

## 🔐 Security Reminders

1. **Change the default admin password immediately** after first login!
2. Use a strong, unique `SECRET_KEY` (32+ random characters).
3. Consider restricting MongoDB Network Access to Render IP ranges if available.
4. Regularly update your dependencies for security patches.

---

## 📱 Mobile Testing

The site is fully responsive. Test on:
- Mobile devices (320px - 768px)
- Tablets (768px - 1024px)
- Desktops (1024px+)

---

## 🔄 Updating Your Site

1. Make changes locally.
2. Commit and push to GitHub.
3. Vercel and Render will auto-deploy from the main branch.

---

## 💡 Tips

- **Free Tier Limitations**: Render free tier spins down after 15 minutes of inactivity. First request may take 30+ seconds.
- **Custom Domain**: Both Vercel and Render allow custom domains on free tiers.
- **Environment Management**: Keep sensitive values in environment variables, never in code.

---

**Happy Deploying! 🎉**
