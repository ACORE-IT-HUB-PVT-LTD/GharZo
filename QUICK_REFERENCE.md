# Quick Reference - Authentication & Routing

## 🎯 Single Source of Truth

**AuthContext** (`src/Components/User_Section/Context/AuthContext.jsx`)
- ✅ All user auth state
- ✅ Fetches from `/api/auth/me` on app init
- ✅ Manages loading state (undefined → loading, null → not auth, object → auth)

```javascript
const { user, loading, fetchUser, isLandlord } = useAuth();

// user = undefined  → still loading
// user = null       → not authenticated
// user = {...}      → authenticated
// loading = false   → auth check complete
```

---

## 🚀 Redirect Rules

**routingUtils.js** - All redirect paths in ONE place
```javascript
redirectByRole(navigate, role)

// Automatically redirects to:
'tenant'    → /tenant/profile
'landlord'  → /landlord/add-property
'sub_owner' → /sub_owner
'worker'    → /dr_worker
```

---

## 🛡️ Protected Layouts

**LayoutGuard.jsx** - Wraps sensitive layouts
```jsx
<LayoutGuard 
  requiredRole="tenant" 
  fallbackPath="/tenant_login"
>
  <TenantLayoutContent />
</LayoutGuard>
```

**Protected Layouts**:
- ✅ TenantLayout - requires `role === 'tenant'`
- ✅ LandlordLayout - requires `role === 'landlord'`
- ✅ SubOwnerLayout - requires `role === 'sub_owner'`
- ⚠️ DrWorkerLayout - currently unprotected (per user request)

---

## ✋ Button Click Flow

**Example: "Tenant Dashboard" Button**

```javascript
const handleTenantLogin = () => {
  // 1. Check if user exists
  if (!user) {
    setShowLogin(true);  // Show login modal
    return;
  }
  
  // 2. Check role match
  if (user.role?.toLowerCase() === 'tenant') {
    redirectByRole(navigate, user.role);  // Go to /tenant/profile
  } else {
    setRoleModalMessage(`You are: ${user.role}`);
    setShowRoleModal(true);  // Show access denied
  }
};
```

---

## ⚡ No More API Calls in Components

❌ **BAD** (Old way - causes loops):
```javascript
const handleClick = async () => {
  const user = await fetch('/api/auth/me');  // Extra API call!
  navigate('/tenant/profile');
};
```

✅ **GOOD** (New way - use AuthContext):
```javascript
const { user } = useAuth();  // Already fetched on init

const handleClick = () => {
  if (user?.role === 'tenant') {
    navigate('/tenant/profile');
  }
};
```

---

## 🔄 Auth Initialization

**Automatic on App Load**:
1. AuthContext created
2. Checks for token in localStorage/sessionStorage
3. Calls `/api/auth/me` to verify token
4. Sets user data + loading=false
5. App renders with fresh auth state

**No additional setup needed** ✅

---

## 📝 Token Storage

These keys are auto-checked:
```javascript
localStorage.getItem('token')
localStorage.getItem('usertoken')
sessionStorage.getItem('token')
```

Pick ONE for your app and stick with it.

---

## 🧪 Quick Test

```bash
# Open DevTools Console
// 1. Check if auth worked
const { user } = useAuth();
console.log(user);  // Should show user object after login

// 2. Check role
console.log(user?.role);  // Should show "tenant", "landlord", etc.

// 3. Check loading
const { loading } = useAuth();
console.log(loading);  // Should be false after init
```

---

## ❌ Common Mistakes

**Mistake 1**: Calling `/api/auth/me` in a button handler
```javascript
❌ const response = await fetch('/api/auth/me');
✅ const { user } = useAuth();  // Use this instead
```

**Mistake 2**: Not checking if `loading === true`
```javascript
❌ if (!user) redirect();  // Might redirect while loading
✅ if (loading) return <Spinner />;
   if (!user) redirect();  // Now safe
```

**Mistake 3**: Using different role values
```javascript
❌ user.role === 'Tenant'  (capital T)
✅ user.role?.toLowerCase() === 'tenant'  (lowercase)
```

**Mistake 4**: Redirect logic scattered everywhere
```javascript
❌ navigate('/tenant') in PG.jsx
❌ navigate('/tenant/profile') in Button.jsx
❌ navigate('/tenant') in Modal.jsx
✅ Use redirectByRole() everywhere
```

---

## 📚 File Locations

**Core Auth**:
- `src/Components/User_Section/Context/AuthContext.jsx` - Auth state
- `src/utils/LayoutGuard.jsx` - Protected layout wrapper
- `src/utils/routingUtils.js` - Redirect rules

**Layouts** (Protected):
- `src/Components/TenantSection/TenantLayout.jsx`
- `src/Components/LandLoard/Layout/Layout.jsx`
- `src/Components/Sub_owner/SubOwnerLayout/SubOwnerLayout.jsx`

**Pages** (Updated):
- `src/Components/User_Section/PG/PG.jsx`

---

## 🔧 Customization

### Change a redirect rule
**File**: `src/utils/routingUtils.js`
```javascript
export const redirectByRole = (navigate, role) => {
  const roleMap = {
    tenant: '/tenant/dashboard',  // Change this line
    // ...
  };
};
```

### Change fallback for unauthorized
**File**: `src/utils/LayoutGuard.jsx`
```jsx
<LayoutGuard 
  requiredRole="tenant" 
  fallbackPath="/your-custom-page"  // Change here
>
```

### Add new role
**File 1**: `src/Components/User_Section/Context/AuthContext.jsx`
```javascript
const isMyRole = () => user?.role === 'my_role';
// Export it
```

**File 2**: `src/utils/routingUtils.js`
```javascript
'my_role': '/my_role_dashboard'
```

**File 3**: `src/utils/LayoutGuard.jsx`
```jsx
<LayoutGuard requiredRole="my_role" fallbackPath="/login">
```

---

## 🐛 Debugging

**Enable logs** (optional):
```javascript
// In AuthContext.jsx useEffect
console.log('Auth loading...', loading);
console.log('User fetched:', user);
console.log('Current role:', user?.role);
```

**Test token** (in browser console):
```javascript
localStorage.getItem('token')  // See current token
localStorage.removeItem('token')  // Clear to test logout
localStorage.setItem('token', 'test-token')  // Set test token
```

**Test redirect**:
```javascript
// In a component's useEffect
import { redirectByRole } from '../../utils/routingUtils';
const { user } = useAuth();
const navigate = useNavigate();

redirectByRole(navigate, user?.role);  // Test redirect
```

---

**Last Updated**: February 4, 2026  
**Status**: ✅ Production Ready
