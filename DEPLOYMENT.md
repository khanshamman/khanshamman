# Deployment Guide

This guide will help you deploy the Khan Shamman Order Management app to Vercel (frontend) and Render (backend).

---

## Prerequisites

- GitHub account with your repository
- Vercel account (free): https://vercel.com
- Render account (free): https://render.com

---

## Step 1: Deploy Backend to Render

### Option A: Using Render Dashboard (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `khanshamman-api` (or your preferred name)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = (click "Generate" for a secure random value)
   - `FRONTEND_URL` = (leave empty for now, add after Vercel deploy)

6. **Important for Data Persistence**: 
   - Go to **Disks** tab
   - Add a disk with mount path: `/opt/render/project/src/data`
   - Size: 1 GB (minimum)
   - Note: This requires a paid plan ($7/month). Without it, database resets on each deploy.

7. Click **"Create Web Service"**

8. Copy your Render URL (e.g., `https://khanshamman-api.onrender.com`)

### Option B: Using render.yaml (Blueprint)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your repository
4. Render will auto-detect `backend/render.yaml`
5. Review and deploy

---

## Step 2: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variable:
   - Name: `VITE_API_URL`
   - Value: `https://your-render-url.onrender.com/api`
   - (Replace with your actual Render URL from Step 1)

6. Click **"Deploy"**

7. Copy your Vercel URL (e.g., `https://khanshamman.vercel.app`)

---

## Step 3: Update Backend CORS

1. Go back to Render Dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Update `FRONTEND_URL` to your Vercel URL:
   - Value: `https://khanshamman.vercel.app`
5. The service will auto-redeploy

---

## Step 4: Test Your Deployment

1. Visit your Vercel URL
2. Login with admin credentials:
   - **Username**: `abbas123`
   - **Password**: `khanshamman7`
3. Test creating orders and managing products

---

## Troubleshooting

### "Network Error" or API not connecting
- Check that `VITE_API_URL` in Vercel matches your Render URL
- Ensure Render service is running (check logs)
- Verify `FRONTEND_URL` in Render matches your Vercel URL

### Database resets after deploy
- You need to add a persistent disk in Render
- Free tier doesn't include disk storage
- Consider upgrading to Render paid plan

### Login not working
- Check browser console for errors
- Verify backend is responding: visit `https://your-render-url/api/health`

---

## Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Render  
1. Go to Service Settings → Custom Domain
2. Add your custom domain
3. Update DNS records as instructed

---

## Environment Variables Summary

### Backend (Render)
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `JWT_SECRET` | Secret for auth tokens | (auto-generated) |
| `FRONTEND_URL` | Vercel URL for CORS | `https://app.vercel.app` |
| `PORT` | Server port | `5000` (auto-set by Render) |

### Frontend (Vercel)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.onrender.com/api` |

