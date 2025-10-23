# 🚀 AWS Lambda Deployment Guide

## 📋 Prerequisites
- AWS Account (free tier)
- AWS CLI installed
- Node.js installed (for Serverless Framework)

## 🚀 Step-by-Step Deployment

### Step 1: Install Serverless Framework
```bash
npm install -g serverless
npm install -g serverless-python-requirements
```

### Step 2: Configure AWS CLI
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter region: us-east-1
# Enter output format: json
```

### Step 3: Deploy to AWS Lambda
```bash
cd backend
serverless deploy
```

### Step 4: Get Your API URL
After deployment, you'll get a URL like:
`https://xxxxx.execute-api.us-east-1.amazonaws.com/dev`

## 🎯 What This Creates:
- ✅ **Lambda Function** (your FastAPI app)
- ✅ **API Gateway** (HTTP endpoints)
- ✅ **Automatic scaling**
- ✅ **Free tier** (1M requests/month)

## 🧪 Test Your Deployment:
```bash
curl https://your-api-url.amazonaws.com/dev/api/health
```

## 💰 Cost:
- **Free tier:** 1M requests/month
- **After free tier:** $0.20 per 1M requests
- **Always available** (no sleep)

## 🔧 Environment Variables:
Set in AWS Lambda console:
- `DATABASE_URL` (if using database)
- Any other environment variables

## 📊 Monitoring:
- **CloudWatch Logs** (free tier)
- **API Gateway metrics**
- **Lambda metrics**

---

**Your backend will be live and always available!** 🎉
