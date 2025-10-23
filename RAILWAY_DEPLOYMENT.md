# 🚀 Railway Backend Deployment Guide

## 📋 Prerequisites
- GitHub repository with backend code
- Railway account (free tier available)

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Repository
1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Prepare backend for Railway deployment"
   git push origin master
   ```

### Step 2: Deploy to Railway

1. **Go to [railway.app](https://railway.app)**
2. **Sign up/Login** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository:** `rameezwangde/CarbonPrint`
6. **Select "backend" directory** as the root directory
7. **Click "Deploy"**

### Step 3: Configure Environment Variables

In Railway dashboard, go to **Variables** tab and add:

```
DATABASE_URL=postgresql://username:password@host:port/database
```

Railway will automatically provide a PostgreSQL database and set `DATABASE_URL`.

### Step 4: Update Frontend API URL

1. **Get your Railway backend URL** (e.g., `https://your-app.railway.app`)
2. **Go to Vercel dashboard**
3. **Go to your project → Settings → Environment Variables**
4. **Add:** `VITE_API_BASE_URL` = `https://your-app.railway.app`
5. **Redeploy** your Vercel frontend

## 🔧 Railway Configuration

### Automatic Detection
Railway will automatically detect:
- **Language:** Python
- **Framework:** FastAPI
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Health Check
- **Path:** `/api/health`
- **Timeout:** 100 seconds
- **Auto-restart:** On failure

## 📊 Monitoring

Railway provides:
- **Real-time logs**
- **Metrics dashboard**
- **Automatic scaling**
- **Health monitoring**

## 🔗 Connect Frontend to Backend

1. **Get Railway URL:** `https://your-app.railway.app`
2. **Update Vercel environment variable:**
   - `VITE_API_BASE_URL=https://your-app.railway.app`
3. **Redeploy frontend**

## ✅ Testing

Test your deployment:
```bash
# Health check
curl https://your-app.railway.app/api/health

# Test prediction
curl -X POST https://your-app.railway.app/api/predict \
  -H "Content-Type: application/json" \
  -d '{"body_type":"average","sex":"male","diet":"vegetarian",...}'
```

## 🆓 Free Tier Limits

- **$5 credit/month** (usually enough for small projects)
- **Always running** (no sleep)
- **PostgreSQL database** included
- **Custom domains** supported

## 🚨 Troubleshooting

### Common Issues:
1. **Build fails:** Check Python version compatibility
2. **Database connection:** Verify `DATABASE_URL` is set
3. **CORS errors:** Check allowed origins in `main.py`
4. **Memory issues:** Railway may need to scale up

### Debug Commands:
```bash
# Check logs
railway logs

# Connect to database
railway connect

# Check environment variables
railway variables
```

## 🎯 Next Steps

After successful deployment:
1. **Test all API endpoints**
2. **Update frontend API URL**
3. **Test end-to-end functionality**
4. **Set up monitoring**

---

**Your backend will be live at:** `https://your-app.railway.app`
**Your frontend will be live at:** `https://carbon-print.vercel.app`
