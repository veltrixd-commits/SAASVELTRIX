# POS System - Complete Testing Guide

## ✅ WHO CAN SELL & PROCESS PAYMENTS

### 1. **Business Owners** 🏢
- ✅ Full POS access (automatic)
- ✅ Can sell products and services
- ✅ Can process all payment types
- ✅ Sales tracked with business name

### 2. **Content Creators** 🎥
- ✅ Full POS access (automatic)
- ✅ Can sell merchandise and digital products
- ✅ Can process all payment types
- ✅ Sales tracked as "Creator"

### 3. **Employees with Sales Role** 👥
- ✅ POS access (if approved with 'sales' or 'pos' permission)
- ✅ Can sell products and services
- ✅ Can process all payment types
- ✅ Sales tracked with employee name and company

### 4. **Individuals** ❌
- ❌ NO POS access (personal accounts only)
- ❌ Cannot access /dashboard/pos

---

## 🧪 TESTING INSTRUCTIONS

### Test 1: Business Owner

**Setup:**
```javascript
// Paste in browser console (F12)
localStorage.setItem('userData', JSON.stringify({
  userType: 'business',
  name: 'John Business',
  email: 'owner@business.com',
  businessName: 'Acme Corporation'
}));
// Refresh page
```

**Expected:**
- ✅ POS link shows in navigation
- ✅ Green "Business Owner" badge in header
- ✅ Can select products
- ✅ Payment modal opens automatically after adding item
- ✅ All 4 payment methods work (Cash, Card, Mobile, Electronic)
- ✅ Receipt shows "Processed By: John Business"
- ✅ Sale saved to localStorage

**Test Steps:**
1. Navigate to /dashboard/pos
2. Click any product (e.g., "Social Media Marketing Package")
3. Payment modal opens → Select "Cash"
4. Enter amount (e.g., R 3000)
5. Click "Complete Transaction"
6. ✅ Success notification appears
7. ✅ Receipt modal shows with transaction details
8. ✅ Check console: `JSON.parse(localStorage.getItem('salesHistory'))`

---

### Test 2: Content Creator

**Setup:**
```javascript
// Paste in browser console
localStorage.setItem('userData', JSON.stringify({
  userType: 'creator',
  name: 'Sarah Creator',
  email: 'creator@youtube.com'
}));
// Refresh page
```

**Expected:**
- ✅ POS link shows in navigation
- ✅ Purple "Creator" badge in header
- ✅ Can select products
- ✅ Payment modal works
- ✅ Receipt shows "Processed By: Sarah Creator"
- ✅ All payment methods functional

**Test Steps:**
1. Navigate to /dashboard/pos
2. Add product to cart
3. Payment modal opens
4. Select "Card" payment
5. Enter card details:
   - Number: 4532123456789012
   - Expiry: 12/26
   - CVV: 123
6. Click "Complete Transaction"
7. ✅ Success notification
8. ✅ Receipt shows card details

---

### Test 3: Employee WITH Sales Role

**Setup:**
```javascript
// Paste in browser console
localStorage.setItem('userData', JSON.stringify({
  userType: 'employee',
  name: 'Mike Sales',
  email: 'sales@acme.com',
  companyApproved: true,
  companyName: 'Acme Corporation',
  employeePermissions: ['wellness', 'performance', 'productivity', 'sales', 'products']
}));
// Refresh page
```

**Expected:**
- ✅ POS link shows in navigation
- ✅ Blue "Sales Employee" badge in header
- ✅ Can sell products
- ✅ Payment modal works
- ✅ Receipt shows "Processed By: Mike Sales" + "Acme Corporation"
- ✅ Sales tracked per employee

**Test Steps:**
1. Navigate to /dashboard/pos
2. Add product to cart
3. Select "Mobile" payment
4. Enter mobile: 0812345678
5. Click "Complete Transaction"
6. ✅ Success notification
7. ✅ Receipt shows mobile payment details
8. ✅ Receipt shows employee and company name

---

### Test 4: Employee WITHOUT Sales Role (Should Fail)

**Setup:**
```javascript
// Paste in browser console
localStorage.setItem('userData', JSON.stringify({
  userType: 'employee',
  name: 'Jane Basic',
  email: 'basic@acme.com',
  companyApproved: true,
  companyName: 'Acme Corporation',
  employeePermissions: ['wellness', 'performance', 'productivity']
  // NOTE: No 'sales' permission!
}));
// Refresh page
```

**Expected:**
- ❌ POS link does NOT show in navigation
- ❌ Direct access to /dashboard/pos shows "Access Denied" message
- ✅ Message says: "You don't have permission to access the Point of Sale system"
- ✅ Instructions to request 'sales' role from admin

**Test Steps:**
1. Check navigation → No POS link ✓
2. Navigate to /dashboard/pos manually
3. ✅ "Access Denied" screen appears
4. ✅ Instructions shown

---

### Test 5: Individual User (Should Fail)

**Setup:**
```javascript
// Paste in browser console
localStorage.setItem('userData', JSON.stringify({
  userType: 'individual',
  name: 'Personal User',
  email: 'user@example.com'
}));
// Refresh page
```

**Expected:**
- ❌ POS link does NOT show in navigation
- ❌ Cannot access /dashboard/pos
- ✅ Shows "Access Denied"
- ✅ Message explains need for business account

---

## 💳 TESTING ALL PAYMENT METHODS

### Cash Payment
```
1. Select product
2. Payment modal → Cash
3. Enter amount: R 5000 (if total is R 2999)
4. Change shows: R 2001
5. Complete → Success ✅
```

### Card Payment
```
1. Select product
2. Payment modal → Card
3. Enter:
   - Card: 4532123456789012
   - Expiry: 12/26
   - CVV: 123
4. Complete → Success ✅
5. Receipt shows: "Card ending in 9012"
```

### Mobile Payment
```
1. Select product
2. Payment modal → Mobile
3. Enter: 0812345678
4. QR code displayed
5. Complete → Success ✅
6. Receipt shows: "Mobile: 0812345678"
```

### Electronic Payment
```
1. Select product
2. Payment modal → Electronic
3. Enter reference: REF12345
4. Complete → Success ✅
5. Receipt shows: "Ref: REF12345"
```

---

## 🔍 VERIFY EVERYTHING WORKS

### Check Sales History
```javascript
// In console
const sales = JSON.parse(localStorage.getItem('salesHistory'));
console.table(sales);
// Should show all transactions with:
// - Transaction ID
// - Items sold
// - Total amount
// - Payment method
// - Sales person info
// - Timestamp
```

### Check Stock Updates
```javascript
// Before sale
const products = JSON.parse(localStorage.getItem('productsList'));
console.log('Product 3 stock:', products[2].stock); // e.g., 5

// Make a sale of Product 3

// After sale
const updatedProducts = JSON.parse(localStorage.getItem('productsList'));
console.log('Product 3 stock:', updatedProducts[2].stock); // Should be 4
```

### Grant Employee Sales Access
```javascript
// Company admin approves employee for sales
import { approveSalesEmployee } from '@/lib/companyRegistry';

// Initialize demo companies first
localStorage.setItem('companies', JSON.stringify([
  {
    id: 'comp-1',
    name: 'Acme Corporation',
    employerCode: 'ACME2024',
    subscriptionPlan: 'enterprise',
    subscriptionStatus: 'active',
    adminEmail: 'admin@acme.com',
    createdAt: new Date().toISOString(),
    employees: [{
      email: 'sales@acme.com',
      fullName: 'Mike Sales',
      status: 'approved',
      requestedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      permissions: ['wellness', 'performance', 'productivity', 'sales', 'products']
    }]
  }
]));

// Now employee 'sales@acme.com' has POS access!
```

---

## ✅ SUCCESS CRITERIA

Your POS system is working correctly if:

1. **Business Owner:**
   - ✅ Can access POS
   - ✅ All payment methods work
   - ✅ Sales saved with business name
   - ✅ Stock updates correctly
   - ✅ Receipt displays correctly

2. **Content Creator:**
   - ✅ Can access POS
   - ✅ All payment methods work
   - ✅ Sales tracked as "Creator"
   - ✅ Can sell merchandise/products

3. **Employee (Sales Role):**
   - ✅ Can access POS ONLY if 'sales' or 'pos' in permissions
   - ✅ All payment methods work
   - ✅ Sales tracked with employee name + company
   - ✅ Receipt shows company name

4. **Employee (No Sales Role):**
   - ✅ POS link hidden in navigation
   - ✅ Direct access shows "Access Denied"
   - ✅ Instructions to request sales role

5. **Individual:**
   - ✅ POS link hidden
   - ✅ Access denied message shown

6. **All Payment Methods:**
   - ✅ Cash (with change calculation)
   - ✅ Card (validation + last 4 digits)
   - ✅ Mobile (phone number + QR)
   - ✅ Electronic (reference number)

7. **Transaction Tracking:**
   - ✅ Transaction ID generated
   - ✅ Sales person recorded
   - ✅ Company/business name saved
   - ✅ Timestamp included
   - ✅ Payment details saved

8. **Stock Management:**
   - ✅ Stock decrements after sale
   - ✅ Services have unlimited stock (999)
   - ✅ Products track real inventory
   - ✅ "Maximum stock reached" alert works

9. **UI/UX:**
   - ✅ Auto-open payment modal after adding item
   - ✅ User badge shows in header
   - ✅ Success notification appears
   - ✅ Receipt displays properly
   - ✅ Print functionality works

---

## 🐛 TROUBLESHOOTING

### "Access Denied" for Business Owner
**Problem:** Business owner seeing access denied
**Solution:**
```javascript
// Check userData
const user = JSON.parse(localStorage.getItem('userData'));
console.log(user.userType); // Must be 'business' or 'creator'

// Fix if wrong:
localStorage.setItem('userData', JSON.stringify({
  userType: 'business',
  name: 'Your Name',
  email: 'your@email.com',
  businessName: 'Your Business'
}));
```

### Employee Can't Access POS
**Problem:** Approved employee still can't access
**Solution:**
```javascript
// Check permissions
const user = JSON.parse(localStorage.getItem('userData'));
console.log(user.employeePermissions); 
// Must include 'sales' or 'pos'

// Fix:
const updated = {...user, employeePermissions: [...user.employeePermissions, 'sales']};
localStorage.setItem('userData', JSON.stringify(updated));
```

### Payment Modal Not Opening
**Problem:** Click product but no modal
**Solution:**
1. Check browser console for errors
2. Clear cache: `Remove-Item -Path ".next" -Recurse -Force`
3. Restart dev server: `npm run dev`

### Stock Not Updating
**Problem:** Stock stays same after sale
**Solution:**
```javascript
// Manually check
const products = JSON.parse(localStorage.getItem('productsList'));
console.log(products.map(p => ({name: p.name, stock: p.stock})));

// If products not in localStorage:
// Go to /dashboard/products and add products first
```

---

## 📊 SALES TRACKING BY USER TYPE

### View All Sales with User Info
```javascript
const sales = JSON.parse(localStorage.getItem('salesHistory') || '[]');

// Group by user type
const businessSales = sales.filter(s => s.salesPerson?.userType === 'business');
const creatorSales = sales.filter(s => s.salesPerson?.userType === 'creator');
const employeeSales = sales.filter(s => s.salesPerson?.userType === 'employee');

console.log('Business Sales:', businessSales.length);
console.log('Creator Sales:', creatorSales.length);
console.log('Employee Sales:', employeeSales.length);

// View employee sales by company
const companySales = employeeSales.reduce((acc, sale) => {
  const company = sale.salesPerson?.companyName || 'Unknown';
  acc[company] = (acc[company] || 0) + 1;
  return acc;
}, {});
console.log('Sales by Company:', companySales);
```

---

**Last Updated:** February 14, 2026  
**Status:** ✅ Fully Functional

Server running at: http://localhost:3000/dashboard/pos
