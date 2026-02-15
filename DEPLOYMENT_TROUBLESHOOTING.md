# Deployment Troubleshooting Guide

## Problem: Website Shows Text Only (No Styling/Graphics)

This happens when CSS and JavaScript files aren't loading properly. Here's how to fix it:

---

## ✅ Solution Steps

### 1. **IMPORTANT: Use the Latest ZIP File**
```
veltrix-deployment-20260213_201033.zip (NEW - includes .htaccess)
```

**Previous ZIP files did NOT include the .htaccess file!**

---

### 2. **Upload Instructions**

#### Option A: Subdomain Deployment (Recommended)
**For: `demo.yourdomain.com`**

1. **Create Subdomain in cPanel:**
   - Go to **Domains** → **Subdomains**
   - Create subdomain: `demo`
   - Document root will be: `public_html/demo`

2. **Upload Files:**
   - Go to **File Manager**
   - Navigate to `public_html/demo`
   - **Delete ALL existing files** in this folder
   - Upload the ZIP file
   - Right-click → **Extract**
   - Move all files from extracted folder to `public_html/demo`

3. **Verify .htaccess:**
   - In `public_html/demo`, you should see `.htaccess` file
   - If not visible, click **Settings** (top right) → Enable "Show Hidden Files"
   - The `.htaccess` file **MUST** be present

#### Option B: Subdirectory Deployment
**For: `yourdomain.com/demo`**

1. **Create Folder:**
   - Go to **File Manager**
   - Navigate to `public_html`
   - Create new folder: `demo`

2. **Upload Files:**
   - Navigate into `public_html/demo`
   - Upload the ZIP file
   - Extract all files
   - Verify `.htaccess` is present

3. **Update next.config.js** (for future builds):
   ```javascript
   basePath: '/demo',  // Uncomment this line
   ```

---

### 3. **File Structure After Upload**

Your deployment folder should look like this:
```
public_html/demo/
├── .htaccess          ← CRITICAL FILE
├── index.html
├── 404.html
├── _next/
│   ├── static/
│   │   ├── css/
│   │   │   └── e1b28a67dbdbce07.css  ← Styles
│   │   └── chunks/                    ← JavaScript
│   └── -OmYhbSCZA2bvhrRtw8nY/
├── dashboard/
├── pricing/
├── login/
└── signup/
```

---

### 4. **Common Issues & Fixes**

#### Issue: Still No Styling After Uploading New ZIP

**Check 1: .htaccess File**
```bash
# In cPanel File Manager, navigate to your deployment folder
# You MUST see .htaccess file
# If not visible: Settings → Show Hidden Files (dot files)
```

**Check 2: .htaccess Permissions**
```
Right-click .htaccess → Change Permissions → Set to 644
```

**Check 3: Apache mod_rewrite Enabled**
```
Contact Host Africa support and ask:
"Please enable mod_rewrite, mod_deflate, mod_expires, and mod_headers 
for my domain/subdomain"
```

#### Issue: Page Not Found Errors

Your .htaccess should contain these rules:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Don't rewrite files and directories
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  
  # Handle Next.js pages
  RewriteRule ^(.*)$ /$1.html [L,QSA]
</IfModule>
```

#### Issue: CSS/JS 404 Errors

**Solution 1: Clear Browser Cache**
- Press `Ctrl + Shift + Delete`
- Clear cache and reload page
- Or use Incognito mode

**Solution 2: Check File Permissions**
- All folders: 755
- All files: 644
- .htaccess: 644

**Solution 3: Check _next Folder**
```bash
# In File Manager, verify these exist:
_next/static/css/e1b28a67dbdbce07.css
_next/static/chunks/ (folder with JS files)
```

---

### 5. **Test Your Deployment**

After uploading, test these URLs:

1. **Homepage:** `https://demo.yourdomain.com` or `https://yourdomain.com/demo`
   - Should show full styling and graphics

2. **CSS File:** `https://demo.yourdomain.com/_next/static/css/e1b28a67dbdbce07.css`
   - Should show CSS code (not 404)

3. **Pricing Page:** `https://demo.yourdomain.com/pricing`
   - Should load with all styling

If any of these fail, the issue is with your server configuration.

---

### 6. **Contact Host Africa Support**

If styling still doesn't work after following all steps:

**Email/Chat Support With:**
```
Subject: Enable Apache Modules for Static Site

Hi, I've uploaded a static website to [your domain/subdomain].
The HTML loads but CSS/JS files are not loading.

Please enable these Apache modules:
- mod_rewrite
- mod_deflate
- mod_expires
- mod_headers

Also confirm that .htaccess files are enabled for my account.

Domain: [your domain]
Folder: [your deployment path]
```

---

## 📋 Quick Checklist

Before contacting support, verify:

- [ ] Used the **NEW** ZIP file (20260213_201033.zip)
- [ ] Extracted files to correct directory
- [ ] `.htaccess` file is present and visible
- [ ] `.htaccess` permissions are 644
- [ ] `_next` folder exists with `static/css` and `static/chunks` inside
- [ ] Tested in Incognito/Private browsing mode
- [ ] Cleared browser cache
- [ ] All files have correct permissions (755 for folders, 644 for files)

---

## 🎯 Expected Result

When correctly deployed, your site should have:

- ✅ Full color gradients and backgrounds
- ✅ Proper fonts and text sizing
- ✅ Card shadows and hover effects
- ✅ Responsive design on mobile/tablet/desktop
- ✅ All buttons and icons visible
- ✅ Smooth animations and transitions

---

## Need More Help?

1. **Check browser console for errors:**
   - Press `F12` → Console tab
   - Look for red errors mentioning CSS or 404

2. **Check Network tab:**
   - Press `F12` → Network tab
   - Reload page
   - Look for failed requests (red items)
   - Check if `e1b28a67dbdbce07.css` loaded successfully

3. **Send screenshots to support:**
   - Browser console errors
   - Network tab showing failed requests
   - File Manager showing your folder structure

---

**Remember:** The key file is `.htaccess` - it MUST be present in your deployment folder!
