# EmailJS Configuration Guide

## Quick Setup (5 minutes)

### 1. Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for free (no credit card required)
3. Verify your email

### 2. Get Your Credentials
1. **Service ID**: Go to "Email Services" → Copy your service ID
2. **Public Key**: Go to "Account" → "General" → Copy your public key
3. **Template ID**: Use `template_summary_report` (we'll create this)

### 3. Update Your Code
Replace these values in `SummaryReport.tsx`:

```typescript
// Line 44-46 in SummaryReport.tsx
const EMAILJS_SERVICE_ID = 'your_actual_service_id';
const EMAILJS_TEMPLATE_ID = 'template_summary_report';
const EMAILJS_PUBLIC_KEY = 'your_actual_public_key';
```

### 4. Create Email Template
1. In EmailJS dashboard, go to "Email Templates"
2. Click "Create New Template"
3. Use the template from `emailjs-setup.md`
4. Set Template ID as: `template_summary_report`

## Alternative: Use Fallback Mode

If you don't want to set up EmailJS right now, the app will:
- ✅ **Copy email content to clipboard**
- ✅ **Show formatted email text**
- ✅ **Guide you to paste into your email client**

## Test the Integration

1. Try sending an email
2. If EmailJS is configured → Email sends automatically
3. If not configured → Content copies to clipboard with instructions

## Troubleshooting

**Error: "Failed to send email"**
- Check your EmailJS credentials
- Verify the service is active
- Check browser console for detailed errors

**Error: "EmailJS not configured"**
- This is normal if you haven't set up EmailJS yet
- Use the fallback mode (clipboard copy)
- Or set up EmailJS using the guide above
