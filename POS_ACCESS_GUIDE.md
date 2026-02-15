# Point of Sale (POS) - Employee Access Guide

## Overview
Employees can now access the Point of Sale system if they are assigned the **"sales"** role by their company administrator.

## Who Can Access POS?

### ✅ Full Access
- **Business Owners**: Automatic full access to POS
- **Creators**: Can access POS for selling merchandise

### ✅ Role-Based Access
- **Employees with Sales Role**: Must be approved by company admin with 'sales' or 'pos' permissions

### ❌ No Access
- **Individual Users**: Personal accounts don't have business features
- **Employees without Sales Role**: Personal features only by default

---

## How to Grant POS Access to Employees

### For Company Administrators

#### Method 1: Approve with Sales Role (Recommended)
```javascript
// Open browser console on any page
import { approveSalesEmployee } from '@/lib/companyRegistry';

// Approve employee for sales role (includes POS + Products access)
approveSalesEmployee('ACME2024', 'employee@example.com');
```

#### Method 2: Approve with Predefined Roles
```javascript
import { approveEmployeeWithRole } from '@/lib/companyRegistry';

// Sales Role: POS, Products, Personal features
approveEmployeeWithRole('ACME2024', 'employee@example.com', 'sales');

// Admin Role: Sales + Finance + Analytics
approveEmployeeWithRole('ACME2024', 'employee@example.com', 'admin');

// Basic Role: Personal features only
approveEmployeeWithRole('ACME2024', 'employee@example.com', 'basic');
```

#### Method 3: Custom Permissions
```javascript
import { approveEmployee } from '@/lib/companyRegistry';

// Approve with custom permissions array
approveEmployee('ACME2024', 'employee@example.com', [
  'wellness',
  'performance',
  'productivity',
  'sales',      // POS access
  'pos',        // Alternative permission name for POS
  'products'    // Product management
]);
```

---

## Permission Types

| Permission | Access Granted |
|------------|----------------|
| `sales` or `pos` | Point of Sale system |
| `products` | Product management |
| `wellness` | Wellness features |
| `performance` | Performance tracking |
| `productivity` | Productivity tools |
| `contentStudio` | Content creation |
| `finance` | Financial dashboard |
| `analytics` | Analytics & reports |
| `leads` | Lead management |

---

## Employee Flow

### 1. Employee Signs Up
```
1. Employee selects "Employee" user type
2. Enters company employer code (e.g., ACME2024)
3. Account created (status: pending approval)
4. Redirected to /waiting-approval page
```

### 2. Company Admin Approves
```
1. Admin uses console command or admin panel
2. Assigns role: sales, admin, or basic
3. Employee permissions updated in company registry
```

### 3. Employee Gets Access
```
1. Employee clicks "Check Status" on waiting page
2. If approved with 'sales' role:
   - POS link appears in navigation
   - Can access Point of Sale system
   - Can sell products and process payments
3. If approved without sales role:
   - Only sees personal features
   - No POS access
```

---

## Demo Company Codes

Use these codes for testing:

| Company | Code | Subscription |
|---------|------|--------------|
| Acme Corporation | `ACME2024` | Enterprise |
| TechStart Inc | `TECHSTART` | Professional |
| Creative Studios | `CREATIVE123` | Starter (Trial) |

---

## Testing the Feature

### Test as Employee with Sales Access:

1. **Create Employee Account:**
   ```
   - Sign up as Employee
   - Use employer code: ACME2024
   - Email: sales@test.com
   ```

2. **Approve with Sales Role (Console):**
   ```javascript
   approveSalesEmployee('ACME2024', 'sales@test.com');
   ```

3. **Check Access:**
   ```
   - Go to /waiting-approval
   - Click "Check Status"
   - Should redirect to dashboard
   - POS link should appear in navigation
   ```

4. **Use POS:**
   ```
   - Click "Point of Sale" in sidebar
   - Select products to sell
   - Payment modal opens automatically
   - Process payment (Cash/Card/Mobile/Electronic)
   - Complete transaction
   ```

### Test as Employee WITHOUT Sales Access:

1. **Approve as Basic Employee:**
   ```javascript
   approveEmployeeWithRole('ACME2024', 'basic@test.com', 'basic');
   ```

2. **Check Access:**
   ```
   - Login as basic@test.com
   - POS link will NOT appear in navigation
   - If accessing /dashboard/pos directly:
     → "Access Denied" message shown
     → Instructions to request sales role
   ```

---

## Troubleshooting

### "Access Denied" Message
**Reason:** User doesn't have 'sales' or 'pos' permission

**Solution:**
```javascript
// Check current permissions
const userData = JSON.parse(localStorage.getItem('userData'));
console.log(userData.employeePermissions); // Should include 'sales' or 'pos'

// Re-approve with sales role
approveSalesEmployee('YOUR_COMPANY_CODE', 'employee@email.com');

// Then refresh page or re-check status
```

### POS Link Not Showing
**Reason:** Employee not approved or missing sales permission

**Solution:**
1. Check if approved: Go to /waiting-approval
2. Check permissions in console:
   ```javascript
   const userData = JSON.parse(localStorage.getItem('userData'));
   console.log(userData.companyApproved); // Should be true
   console.log(userData.employeePermissions); // Should include 'sales'
   ```
3. Re-approve if needed

### Products Not Loading
**Reason:** No products in Products page

**Solution:**
1. Go to /dashboard/products
2. Add products or services
3. Return to POS
4. Products will appear automatically

---

## Architecture

### Permission Check Flow
```
User clicks POS in navigation
↓
Dashboard layout checks permissions.canAccessPOS
↓
If employee:
  → Check employeePermissions array
  → Look for 'sales' or 'pos' in array
  → Show link if found
↓
If business/creator:
  → Always show (canAccessPOS = true)
↓
If individual:
  → Never show (canAccessPOS = false)
```

### Files Modified
- `lib/accessControl.ts` - Added canAccessPOS permission
- `lib/companyRegistry.ts` - Added sales role helper functions
- `app/dashboard/layout.tsx` - Changed POS permission from null to 'canAccessPOS'
- `app/dashboard/pos/page.tsx` - Added access control check
- `app/waiting-approval/page.tsx` - Updated to save employeePermissions

---

## Future Enhancements

### Recommended Additions:

1. **Company Admin Dashboard**
   - Visual interface to approve employees
   - Assign roles via dropdown
   - View all pending requests

2. **Per-Employee Permissions**
   - Sales Manager: Full sales access
   - Cashier: POS only, no product editing
   - Viewer: View-only POS access

3. **Transaction Limits**
   - Set max transaction amount per employee
   - Require manager approval for high-value sales
   - Track sales per employee

4. **Sales Reports**
   - Track which employee made each sale
   - Sales performance by employee
   - Commission calculations

---

**Implementation Status:** ✅ Complete  
**Last Updated:** February 14, 2026
