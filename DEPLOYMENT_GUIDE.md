# 🚀 Deployment Guide: Host Africa with Existing Domain

## Overview
This guide shows you how to deploy your Veltrix Next.js app to Host Africa under an existing domain, so clients can view the demo.

---

## 📋 Prerequisites

1. Host Africa cPanel account access
2. Node.js support on your hosting (or use Node.js hosting addon)
3. SSH access (recommended) or FTP access
4. Your domain DNS access

---

## 🎯 Deployment Options

### **Option A: Subdomain (Best for Demo)**
- **URL Example**: `demo.yourdomain.com` or `veltrix.yourdomain.com`
- **Pros**: Clean URL, isolated from main site, easy to manage
- **Best for**: Client demos, testing, separate branding

### **Option B: Subdirectory**
- **URL Example**: `yourdomain.com/demo` or `yourdomain.com/veltrix`
- **Pros**: Keeps everything under main domain
- **Cons**: Requires proxy configuration, more complex setup

---

## 🔧 Method 1: Deploy as Subdomain (Recommended)

### **Step 1: Build Your App Locally**

```powershell
# In your project directory
npm run build
```

This creates a `.next` folder with your production build.

### **Step 2: Export Static Version (If Using Static Export)**

Add to your `package.json`:
```json
{
  "scripts": {
    "build": "next build",
    "export": "next export",
    "deploy": "next build && next export"
  }
}
```

Then run:
```powershell
npm run deploy
```

This creates an `out` folder with static HTML files.

### **Step 3: Create Subdomain in cPanel**

1. **Log into Host Africa cPanel**
2. **Navigate to**: Domains → Subdomains
3. **Create subdomain**:
   - Subdomain: `demo` (or `veltrix`)
   - Domain: `yourdomain.com`
   - Document Root: `/public_html/demo` (auto-generated)
4. **Click**: Create

### **Step 4: Upload Files via FTP/SSH**

**Using FileZilla (FTP):**
1. Connect to: `ftp.yourdomain.com`
2. Navigate to: `/public_html/demo/`
3. Upload entire `out` folder contents (if static) OR `.next`, `public`, `package.json`, etc. (if Node.js)

**Using SSH (Better):**
```bash
# Connect via SSH
ssh username@yourdomain.com

# Navigate to subdomain folder
cd /home/username/public_html/demo

# Upload files using SFTP or rsync
```

### **Step 5: Configure Node.js App (If Not Static)**

If your hosting supports Node.js apps:

1. **In cPanel**: Setup Node.js App
2. **Node.js Version**: 18.x or higher
3. **Application Root**: `/public_html/demo`
4. **Application URL**: `demo.yourdomain.com`
5. **Application Startup File**: `server.js`

Create `server.js` in your project:
```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = false
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
```

Add to `package.json`:
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "next build"
  }
}
```

6. **Install Dependencies**:
```bash
cd /public_html/demo
npm install
npm run build
```

7. **Start the app** from cPanel Node.js interface

---

## 🔧 Method 2: Static Export to Subdirectory

### **Step 1: Configure Next.js for Static Export**

Update `next.config.mjs`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/demo', // Must match your subdirectory
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true,
}

export default nextConfig
```

### **Step 2: Build Static Site**

```powershell
npm run build
```

This creates an `out` folder.

### **Step 3: Upload to Subdirectory**

1. **Access cPanel File Manager** or FTP
2. **Navigate to**: `/public_html/`
3. **Create folder**: `demo`
4. **Upload all files** from `out` folder to `/public_html/demo/`

### **Step 4: Add .htaccess for Clean URLs**

Create `/public_html/demo/.htaccess`:
```apache
# Enable rewrites
RewriteEngine On

# Handle Next.js routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /demo/index.html [L]

# Set MIME types
<IfModule mod_mime.c>
  AddType application/javascript .js
  AddType text/css .css
  AddType image/svg+xml .svg
</IfModule>
```

Your site is now live at: `yourdomain.com/demo`

---

## 🌐 Method 3: Using Vercel (Easiest Alternative)

If Host Africa doesn't support Node.js well:

1. **Deploy to Vercel** (free):
   ```powershell
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Point Subdomain** to Vercel:
   - In Host Africa DNS settings
   - Add CNAME record:
     - Name: `demo`
     - Value: `cname.vercel-dns.com`

3. **Configure in Vercel**:
   - Add custom domain: `demo.yourdomain.com`
   - Vercel handles SSL automatically

---

## ✅ Quick Setup Checklist

### For Static Export (Simplest):
- [ ] Add `output: 'export'` to `next.config.mjs`
- [ ] Run `npm run build`
- [ ] Upload `out` folder contents to `/public_html/demo/`
- [ ] Add `.htaccess` file
- [ ] Test at `yourdomain.com/demo`

### For Subdomain with Node.js:
- [ ] Create subdomain in cPanel
- [ ] Upload all project files
- [ ] Run `npm install`
- [ ] Run `npm run build`
- [ ] Configure Node.js app in cPanel
- [ ] Start application
- [ ] Test at `demo.yourdomain.com`

### For Vercel (Recommended):
- [ ] Push code to GitHub
- [ ] Connect to Vercel
- [ ] Add CNAME to DNS
- [ ] Configure custom domain in Vercel
- [ ] Test at `demo.yourdomain.com`

---

## 🐛 Troubleshooting

### Issue: 404 Errors on Page Refresh
**Solution**: Add proper `.htaccess` rewrites or use `trailingSlash: true`

### Issue: Images Not Loading
**Solution**: Set `images: { unoptimized: true }` for static export

### Issue: API Routes Not Working
**Solution**: API routes don't work with static export. Use external API or full Node.js deployment

### Issue: Node.js App Won't Start
**Solution**: 
- Check Node.js version (18+)
- Verify `package.json` has correct start script
- Check error logs in cPanel

---

## 📊 Performance Tips

1. **Enable Gzip** in `.htaccess`:
```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

2. **Set Cache Headers**:
```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/* "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

3. **Use CDN** for static assets if possible

---

## 🔒 Security Considerations

1. **Remove sensitive data** from `.env` before deploying
2. **Don't commit** `.env` files to Git
3. **Use environment variables** in cPanel for secrets
4. **Enable HTTPS** (Let's Encrypt in cPanel)
5. **Add security headers** in `.htaccess`:

```apache
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

---

## 📞 Need Help?

- **Host Africa Support**: support@hostafrica.com
- **cPanel Documentation**: docs.cpanel.net
- **Next.js Deployment**: nextjs.org/docs/deployment

---

## 🎉 You're Done!

Your demo is now live and clients can access it at:
- **Subdomain**: `https://demo.yourdomain.com`
- **Subdirectory**: `https://yourdomain.com/demo`

Share the link with your clients and start collecting feedback!
