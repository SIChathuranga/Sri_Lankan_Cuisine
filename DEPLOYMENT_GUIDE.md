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
7. Replace `<password>` with your actual password.

---

## 2️⃣ Image Storage Setup (Cloudinary)

1. Log in to [Cloudinary](https://cloudinary.com).
2. Go to the **Dashboard**.
3. Copy your **Cloud Name**, **API Key**, and **API Secret**.

---

## 3️⃣ Backend Deployment (Render)

1. Push your project code to a GitHub repository.
2. Log in to [Render](https://render.com).
3. Click **New** -> **Web Service**.
4. Connect your GitHub repository.
5. Configure the service:
   - **Name**: `sri-lankan-cuisine-api`
   - **Root Directory**: `backend` (Important!)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Plan**: Free

6. Scroll down to **Environment Variables** and add:
   - `MONGODB_URI`: (Your MongoDB connection string from Step 1)
   - `MONGODB_DB_NAME`: `sri_lankan_cuisine_db`
   - `SECRET_KEY`: (Generate a random secure string)
   - `CLOUDINARY_CLOUD_NAME`: (From Step 2)
   - `CLOUDINARY_API_KEY`: (From Step 2)
   - `CLOUDINARY_API_SECRET`: (From Step 2)
   - `ADMIN_USERNAME`: `admin` (Default admin username)
   - `ADMIN_PASSWORD`: `password123` (Default admin password - change immediately!)
   - `FRONTEND_URL`: `https://sri-lankan-cuisine.vercel.app` (You'll update this later)

7. Click **Create Web Service**.
8. Wait for the build to finish. Copy the **Service URL** (e.g., `https://sri-lankan-cuisine-api.onrender.com`).

---

## 4️⃣ Frontend Deployment (Vercel)

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `frontend/Client` (Wait! Vercel needs the root to be `frontend/Client` to serve `index.html` correctly, OR we can deploy the whole `frontend` folder and use `vercel.json` to route).
   
   *Recommended Approach*:
   - Keep default root (`./`) or set to `frontend`.
   - We need to create a `vercel.json` in the root to handle routing if we want to serve from `frontend/Client`.

   **Easier Method**:
   - In Vercel, set **Root Directory** to `frontend/Client`.
   - This will make `home.html` accessible. However, typically we want `index.html` as the entry.
   - **Action**: Rename `home.html` to `index.html` locally before deploying, OR configure `vercel.json` to rewrite `/` to `/home.html`.

5. **Environment Variables**:
   - Vercel handles frontend, but our frontend code (`config.js`) needs to know the API URL.
   - We need to update `frontend/Client/js/config.js` manually or use a build step.
   - **Simpler**: Just edit `frontend/Client/js/config.js` locally before pushing:
     ```javascript
     const API_BASE_URL = "https://your-render-app-name.onrender.com";
     ```

6. Click **Deploy**.

---

## 5️⃣ Final Configuration

1. Once Frontend is deployed, copy its URL (e.g., `https://sri-lankan-cuisine.vercel.app`).
2. Go back to **Render Dashboard** -> **Environment Variables**.
3. Update `FRONTEND_URL` with your actual Vercel URL.
4. Redeploy Render service (if needed).

## 🚀 Verification

1. Open your Vercel URL.
2. Check the browser console (F12) for any errors.
3. Try to log in to `/Admin/login.html` (Note: If you deployed `frontend/Client` as root, you won't reach Admin. You need to deploy `frontend` as root).

### ⚠️ Important Note on Frontend Structure
Since we have `Client` and `Admin` side-by-side, it is best to:
1. Set Vercel Root Directory to `frontend`.
2. Access the site via `https://your-site.vercel.app/Client/home.html`.
3. To make it cleaner, create a `vercel.json` in the `frontend` folder:
   ```json
   {
     "rewrites": [
       { "source": "/", "destination": "/Client/home.html" }
     ]
   }
   ```

## 🔐 Security Reminder
- Change the default admin password immediately after first login!
- Ensure your MongoDB Network Access is restricted if possible (Render IPs change, so 0.0.0.0/0 is common for free tiers).
