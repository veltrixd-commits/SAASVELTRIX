# 🚀 Quick Deployment Checklist

## Before You Deploy

### 1. Choose Your Deployment Method
- [ ] **Subdomain** (e.g., demo.yourdomain.com) - **RECOMMENDED**
- [ ] **Subdirectory** (e.g., yourdomain.com/demo)

### 2. Update Configuration

#### For Subdirectory Deployment:

Edit `next.config.js` and uncomment these lines:
```javascript
output: 'export',
basePath: '/demo', // Change to your folder name
trailingSlash: true,
// In images section:
unoptimized: true,
```

#### For Subdomain Deployment:
Edit `next.config.js` and uncomment:
```javascript
output: 'export',
// basePath: '/demo', // LEAVE THIS COMMENTED for subdomain
trailingSlash: true,
// In images section:
unoptimized: true,
```

---

## 📦 Build Steps

### Step 1: Build the Production Version
```powershell
npm run build
```

This creates an `out` folder with your static site.

### Step 2: Test Locally (Optional)
```powershell
# Install serve globally
npm install -g serve

# Test the build
serve out
```

Visit http://localhost:3000 to test.

---

## 🌐 Upload to Host Africa

### Method 1: Using cPanel File Manager (Easy)

1. **Log into cPanel** at Host Africa
2. **Open File Manager**
3. **Navigate to**:
   - Subdirectory: `/public_html/demo/`
   - Subdomain: `/public_html/demo.yourdomain.com/` (or wherever created)
4. **Upload** entire contents of the `out` folder
5. **Copy** `.htaccess.example` → `.htaccess` and edit paths if needed
6. **Set permissions** (755 for folders, 644 for files)

### Method 2: Using FTP (FileZilla)

1. **Connect via FTP**:
   - Host: `ftp.yourdomain.com`
   - Username: Your cPanel username
   - Password: Your cPanel password
   - Port: 21

2. **Navigate** to correct folder on server
3. **Upload** contents of `out` folder
4. **Upload** `.htaccess` file

### Method 3: Using SSH (Advanced)

```bash
# Connect via SSH
ssh username@yourdomain.com

# Navigate to directory
cd /home/username/public_html/demo

# Upload using SFTP or create archive locally and extract
```

---

## ✅ Post-Deployment Checklist

### In cPanel:

- [ ] **SSL Certificate Installed** (Let's Encrypt)
  - Go to: SSL/TLS Status → Install
  
- [ ] **HTTPS Redirect Working**
  - Test: http://demo.yourdomain.com → https://demo.yourdomain.com

- [ ] **Correct Permissions Set**
  - Folders: 755
  - Files: 644

### For Subdomain:

- [ ] **Subdomain Created** in cPanel
- [ ] **DNS Propagated** (wait 1-24 hours)
- [ ] **Test URL**: https://demo.yourdomain.com

### For Subdirectory:

- [ ] **Folder Created**: `/public_html/demo/`
- [ ] **.htaccess Configured** with correct RewriteBase
- [ ] **Test URL**: https://yourdomain.com/demo

---

## 🧪 Testing Your Deployment

Test these pages:
- [ ] Homepage: `/`
- [ ] Pricing: `/pricing`
- [ ] Login: `/login`
- [ ] Signup: `/signup`
- [ ] Dashboard: `/dashboard` (should redirect to login)

### Check Mobile Responsiveness:
- [ ] Test on phone
- [ ] Test on tablet
- [ ] Test on desktop

### Check Performance:
- [ ] Run PageSpeed Insights
- [ ] Test loading speed
- [ ] Check console for errors

---

## 🐛 Common Issues & Fixes

### Issue 1: 404 Errors on Page Refresh
**Fix**: Verify `.htaccess` is uploaded and RewriteBase is correct

### Issue 2: Pages Load But No Styling
**Fix**: Check `basePath` in `next.config.js` matches your folder name

### Issue 3: Images Not Loading
**Fix**: Ensure `unoptimized: true` is set in images config

### Issue 4: "Too Many Redirects" Error
**Fix**: Check HTTPS redirect rules in `.htaccess`, remove duplicates

### Issue 5: Blank Page
**Fix**: 
- Check browser console for errors
- Verify all files uploaded correctly
- Check file permissions

---

## 📊 Optimization Tips

### After successful deployment:

1. **Enable Cloudflare** (Free CDN)
   - Point DNS to Cloudflare
   - Enable caching and minification

2. **Test Performance**
   - Google PageSpeed Insights
   - GTmetrix
   - WebPageTest

3. **Monitor Traffic**
   - Set up Google Analytics (if needed)
   - Check cPanel Awstats

---

## 📞 Need Help?

- **Host Africa Support**: support@hostafrica.com  
- **Documentation**: See DEPLOYMENT_GUIDE.md for detailed instructions

---

## 🎉 Success!

Once deployed, share this URL with your client:
- **Subdomain**: `https://demo.yourdomain.com`
- **Subdirectory**: `https://yourdomain.com/demo`

**Congratulations! Your Veltrix demo is now live! 🚀**
